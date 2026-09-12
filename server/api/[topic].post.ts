import { db, schema } from '@nuxthub/db';
import { messageMetadataSchema, messageResponseSchema, type MessageMetadata, type RichMetadata } from '../schemas/message';
import type { H3Event } from 'h3';
import { toMessageResponse } from '../utils/messages';
import { eq, desc } from 'drizzle-orm';
import { consola } from 'consola';

// Extract ntfy.sh-style metadata from request headers and query params.
// ntfy.sh supports both headers (X-Title, Title, etc.) and query parameters.
// Sonarr's built-in ntfy provider sends title, message, priority, tags, and click
// as query parameters instead of headers.
function extractMetadata(event: H3Event): MessageMetadata {
  const headers = getHeaders(event);
  const query = getQuery(event);

  // Look up a value from headers first, then query params.
  // ntfy.sh supports multiple header formats (X-Title, Title, etc.)
  const get = (names: string[]) => {
    for (const name of names) {
      const headerValue = headers[name.toLowerCase()];
      if (headerValue) return String(headerValue);
      const queryValue = query[name.toLowerCase()];
      if (queryValue) return String(queryValue);
    }
    return undefined;
  };

  const metadata: MessageMetadata = {};
  const richMetadata: RichMetadata = {};

  // Extract title
  const title = get(['x-title', 'title', 't', 'ti']);
  if (title) metadata.title = title;

  // Extract priority (1-5, or named: min, low, default, high, urgent/max)
  const priorityStr = get(['x-priority', 'priority', 'p', 'prio']);
  if (priorityStr) {
    const priorityMap: Record<string, number> = {
      min: 1, low: 2, default: 3, high: 4, urgent: 5, max: 5,
    };
    metadata.priority = priorityMap[priorityStr.toLowerCase()] || parseInt(priorityStr) || 3;
  }

  // Extract tags (comma-separated)
  const tagsStr = get(['x-tags', 'tags', 'tag', 'ta']);
  if (tagsStr) {
    metadata.tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  // Extract click URL
  const click = get(['x-click', 'click']);
  if (click) metadata.click = click;

  // Extract icon URL
  const icon = get(['x-icon', 'icon']);
  if (icon) metadata.icon = icon;

  // Extract actions (JSON array)
  const actionsStr = get(['x-actions', 'actions', 'action']);
  if (actionsStr) {
    try {
      metadata.actions = JSON.parse(actionsStr);
    }
    catch (e) {
      console.error('Failed to parse actions JSON:', e);
    }
  }

  // Extract ntfy.sh metadata
  const attach = get(['x-attach', 'attach']);
  if (attach) richMetadata.attach = attach;

  const filename = get(['x-filename', 'filename']);
  if (filename) richMetadata.filename = filename;

  const line = get(['x-line', 'line']);
  if (line) richMetadata.line = line;

  const timestamp = get(['x-timestamp', 'timestamp']);
  if (timestamp) richMetadata.timestamp = timestamp;

  // Extract Radarr/Sonarr rich metadata
  // Quality (e.g., WEBDL-1080p, Bluray-1080p)
  const quality = get(['x-quality', 'quality']);
  if (quality) richMetadata.quality = quality;

  // Size (e.g., "1.34 GB", "8.5 GB")
  const size = get(['x-size', 'size']);
  if (size) richMetadata.size = size;

  // Release group (e.g., GLHF, SPARKS, FGT)
  const releaseGroup = get(['x-releasegroup', 'x-release-group', 'releasegroup', 'release-group']);
  if (releaseGroup) richMetadata.releaseGroup = releaseGroup;

  // Indexer (e.g., 1337x, NZBgeek, RARBG)
  const indexer = get(['x-indexer', 'indexer']);
  if (indexer) richMetadata.indexer = indexer;

  // Download client (e.g., SABnzbd, qBittorrent)
  const downloadClient = get(['x-downloadclient', 'x-download-client', 'downloadclient', 'download-client']);
  if (downloadClient) richMetadata.downloadClient = downloadClient;

  // Source (e.g., Prowlarr)
  const source = get(['x-source', 'source']);
  if (source) richMetadata.source = source;

  // Custom format
  const customFormat = get(['x-customformat', 'x-custom-format', 'customformat', 'custom-format']);
  if (customFormat) richMetadata.customFormat = customFormat;

  // Custom format score
  const customFormatScore = get(['x-customformatscore', 'x-custom-format-score', 'customformatscore', 'custom-format-score']);
  if (customFormatScore) {
    const score = parseInt(customFormatScore);
    if (!isNaN(score)) richMetadata.customFormatScore = score;
  }

  // Series name
  const seriesName = get(['x-seriesname', 'x-series-name', 'seriesname', 'series-name']);
  if (seriesName) richMetadata.seriesName = seriesName;

  // Episode title
  const episodeTitle = get(['x-episodetitle', 'x-episode-title', 'episodetitle', 'episode-title']);
  if (episodeTitle) richMetadata.episodeTitle = episodeTitle;

  // Episode number
  const episodeNumber = get(['x-episodenumber', 'x-episode-number', 'episodenumber', 'episode-number']);
  if (episodeNumber) richMetadata.episodeNumber = episodeNumber;

  // Season number
  const seasonNumber = get(['x-seasonnumber', 'x-season-number', 'seasonnumber', 'season-number']);
  if (seasonNumber) richMetadata.seasonNumber = seasonNumber;

  // Movie title
  const movieTitle = get(['x-movietitle', 'x-movie-title', 'movietitle', 'movie-title']);
  if (movieTitle) richMetadata.movieTitle = movieTitle;

  // Movie year
  const movieYear = get(['x-movieyear', 'x-movie-year', 'movieyear', 'movie-year']);
  if (movieYear) richMetadata.movieYear = movieYear;

  // File name
  const fileName = get(['x-filename', 'filename']);
  if (fileName) richMetadata.fileName = fileName;

  // File path
  const filePath = get(['x-filepath', 'x-file-path', 'filepath']);
  if (filePath) richMetadata.filePath = filePath;

  // Only add metadata if we found any rich metadata
  if (Object.keys(richMetadata).length > 0) {
    metadata.metadata = richMetadata;
  }

  return metadata;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const topic = getRouterParam(event, 'topic');
    if (!topic) {
      setResponseStatus(event, 400);
      return { error: 'Topic is required' };
    }

    const body = await readRawBody(event);
    const headers = getHeaders(event);
    const query = getQuery(event);
    const message = body?.toString() || (query.message ? String(query.message) : '') || '';

    // Log the full notification at debug level for discovery and debugging.
    // Enable by setting CONSOLA_LEVEL=4 (or higher) in the environment.
    consola.debug('[AuditArr] Notification received:\n' +
      `  topic: ${topic}\n` +
      `  headers: ${JSON.stringify(headers, null, 2)}\n` +
      `  query: ${JSON.stringify(query, null, 2)}\n` +
      `  body: ${message}`
    );

    // Extract ntfy.sh headers
    const metadata = extractMetadata(event);

    // Log extracted metadata so we can discover new fields to support
    consola.debug('[AuditArr] Extracted metadata:\n' +
      `  topic: ${topic}\n` +
      `  metadata: ${JSON.stringify(metadata, null, 2)}`
    );

    // Validate metadata with Zod
    const validatedMetadata = messageMetadataSchema.parse(metadata);

    consola.debug('[AuditArr] Validated metadata:\n' +
      `  topic: ${topic}\n` +
      `  validatedMetadata: ${JSON.stringify(validatedMetadata, null, 2)}`
    );

    // Insert message with all persisted metadata
    await db.insert(schema.messages).values({
      topic,
      message,
      title: validatedMetadata.title,
      priority: validatedMetadata.priority,
      tags: validatedMetadata.tags ? JSON.stringify(validatedMetadata.tags) : null,
      click: validatedMetadata.click,
      icon: validatedMetadata.icon,
      actions: validatedMetadata.actions ? JSON.stringify(validatedMetadata.actions) : null,
      metadata: validatedMetadata.metadata ? JSON.stringify(validatedMetadata.metadata) : null,
      event: 'message',
      createdAt: new Date(),
    });

    // Query the most recently inserted message for this topic
    const inserted = await db.select()
      .from(schema.messages)
      .where(eq(schema.messages.topic, topic))
      .orderBy(desc(schema.messages.id))
      .limit(1)
      .then(rows => rows[0]);

    if (!inserted) {
      setResponseStatus(event, 500);
      return { error: 'Failed to retrieve inserted message' };
    }

    return messageResponseSchema.parse(toMessageResponse(inserted));
  } catch (error) {
    console.error('Error saving message to database:', error);
    setResponseStatus(event, 500);
    return { error: 'Internal Server Error' };
  }
});
