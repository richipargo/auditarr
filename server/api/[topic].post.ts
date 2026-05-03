import { db, schema } from '@nuxthub/db';
import { messageMetadataSchema, messageResponseSchema, type RichMetadata } from '../schemas/message';
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import type { H3Event } from 'h3';

// Extract ntfy.sh-style headers from request
async function extractMetadata(event: H3Event): Promise<MessageMetadata> {
  const headers = getHeaders(event);

  // ntfy.sh supports multiple header formats (X-Title, Title, etc.)
  const getHeader = (names: string[]) => {
    for (const name of names) {
      const value = headers[name.toLowerCase()];
      if (value) return value;
    }
    return undefined;
  };

  const metadata: MessageMetadata = {};
  const richMetadata: RichMetadata = {};

  // Extract title
  const title = getHeader(['x-title', 'title', 't', 'ti']);
  if (title) metadata.title = title;

  // Extract priority (1-5, or named: min, low, default, high, urgent/max)
  const priorityStr = getHeader(['x-priority', 'priority', 'p', 'prio']);
  if (priorityStr) {
    const priorityMap: Record<string, number> = {
      min: 1, low: 2, default: 3, high: 4, urgent: 5, max: 5,
    };
    metadata.priority = priorityMap[priorityStr.toLowerCase()] || parseInt(priorityStr) || 3;
  }

  // Extract tags (comma-separated)
  const tagsStr = getHeader(['x-tags', 'tags', 'tag', 'ta']);
  if (tagsStr) {
    metadata.tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  // Extract click URL
  const click = getHeader(['x-click', 'click']);
  if (click) metadata.click = click;

  // Extract icon URL
  const icon = getHeader(['x-icon', 'icon']);
  if (icon) metadata.icon = icon;

  // Extract actions (JSON array)
  const actionsStr = getHeader(['x-actions', 'actions', 'action']);
  if (actionsStr) {
    try {
      metadata.actions = JSON.parse(actionsStr);
    }
    catch (e) {
      console.error('Failed to parse actions JSON:', e);
    }
  }

  // Extract ntfy.sh metadata
  const attach = getHeader(['x-attach', 'attach']);
  if (attach) richMetadata.attach = attach;

  const filename = getHeader(['x-filename', 'filename']);
  if (filename) richMetadata.filename = filename;

  const line = getHeader(['x-line', 'line']);
  if (line) richMetadata.line = line;

  const timestamp = getHeader(['x-timestamp', 'timestamp']);
  if (timestamp) richMetadata.timestamp = timestamp;

  // Extract Radarr/Sonarr rich metadata
  // Quality (e.g., WEBDL-1080p, Bluray-1080p)
  const quality = getHeader(['x-quality', 'quality']);
  if (quality) richMetadata.quality = quality;

  // Size (e.g., "1.34 GB", "8.5 GB")
  const size = getHeader(['x-size', 'size']);
  if (size) richMetadata.size = size;

  // Release group (e.g., GLHF, SPARKS, FGT)
  const releaseGroup = getHeader(['x-releasegroup', 'x-release-group', 'releasegroup', 'release-group']);
  if (releaseGroup) richMetadata.releaseGroup = releaseGroup;

  // Indexer (e.g., 1337x, NZBgeek, RARBG)
  const indexer = getHeader(['x-indexer', 'indexer']);
  if (indexer) richMetadata.indexer = indexer;

  // Download client (e.g., SABnzbd, qBittorrent)
  const downloadClient = getHeader(['x-downloadclient', 'x-download-client', 'downloadclient', 'download-client']);
  if (downloadClient) richMetadata.downloadClient = downloadClient;

  // Source (e.g., Prowlarr)
  const source = getHeader(['x-source', 'source']);
  if (source) richMetadata.source = source;

  // Custom format
  const customFormat = getHeader(['x-customformat', 'x-custom-format', 'customformat', 'custom-format']);
  if (customFormat) richMetadata.customFormat = customFormat;

  // Custom format score
  const customFormatScore = getHeader(['x-customformatscore', 'x-custom-format-score', 'customformatscore', 'custom-format-score']);
  if (customFormatScore) {
    const score = parseInt(customFormatScore);
    if (!isNaN(score)) richMetadata.customFormatScore = score;
  }

  // Series name
  const seriesName = getHeader(['x-seriesname', 'x-series-name', 'seriesname', 'series-name']);
  if (seriesName) richMetadata.seriesName = seriesName;

  // Episode title
  const episodeTitle = getHeader(['x-episodetitle', 'x-episode-title', 'episodetitle', 'episode-title']);
  if (episodeTitle) richMetadata.episodeTitle = episodeTitle;

  // Episode number
  const episodeNumber = getHeader(['x-episodenumber', 'x-episode-number', 'episodenumber', 'episode-number']);
  if (episodeNumber) richMetadata.episodeNumber = episodeNumber;

  // Season number
  const seasonNumber = getHeader(['x-seasonnumber', 'x-season-number', 'seasonnumber', 'season-number']);
  if (seasonNumber) richMetadata.seasonNumber = seasonNumber;

  // Movie title
  const movieTitle = getHeader(['x-movietitle', 'x-movie-title', 'movietitle', 'movie-title']);
  if (movieTitle) richMetadata.movieTitle = movieTitle;

  // Movie year
  const movieYear = getHeader(['x-movieyear', 'x-movie-year', 'movieyear', 'movie-year']);
  if (movieYear) richMetadata.movieYear = movieYear;

  // File name
  const fileName = getHeader(['x-filename', 'filename']);
  if (fileName) richMetadata.fileName = fileName;

  // File path
  const filePath = getHeader(['x-filepath', 'x-file-path', 'filepath']);
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

    const { dbPath } = useRuntimeConfig();
    const body = await readRawBody(event);
    const headers = getHeaders(event);

    const logDir = dirname(dbPath);
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    // TODO: check path
    const logFilePath = join(logDir, 'post-requests.log');
    appendFileSync(logFilePath, `[${new Date().toISOString()}] Headers: ${JSON.stringify(headers)}\nBody: ${body?.toString() || ''}\n\n`);

    const message = body?.toString() || '';

    // Extract ntfy.sh headers
    const metadata = extractMetadata(event);

    // Validate metadata with Zod
    const validatedMetadata = messageMetadataSchema.parse(metadata);

    console.log(`[${new Date().toISOString()}] Publishing to topic "${topic}":`, {
      message: message.substring(0, 100),
      metadata: validatedMetadata,
    });

    // TODO: remember to dismiss if no content
    const result = await db.insert(schema.messages).values({
      topic,
      message,
      event: 'asdfsf',
      // validatedMetadata,
    });

    // Validate response with Zod
    return messageResponseSchema.parse(result);
  } catch (error) {
    console.error('Error saving message to database:', error);
    setResponseStatus(event, 500);
    return { error: 'Internal Server Error' };
  }
});
