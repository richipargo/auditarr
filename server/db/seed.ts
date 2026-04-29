import { db } from './index'
import { messages } from './schema'

// Seed data with realistic Sonarr/Radarr notifications including rich metadata
const exampleMessages = [
  // Sonarr - Episode Downloaded with rich metadata
  {
    messageId: `${Date.now()}-sonarr1`,
    topic: 'sonarr',
    message: `Young Sheldon S06E05 "A Resident Advisor and the Word 'Sketchy'" has been downloaded and imported.`,
    title: 'Episode Downloaded: Young Sheldon',
    priority: 3,
    tags: JSON.stringify(['tv', 'download', '✅']),
    click: 'https://sonarr.local/series/young-sheldon',
    icon: null,
    actions: null,
    metadata: JSON.stringify({
      seriesName: 'Young Sheldon',
      episodeTitle: "A Resident Advisor and the Word 'Sketchy'",
      episodeNumber: '5',
      seasonNumber: '6',
      quality: 'WEBDL-1080p',
      size: '1.34 GB',
      releaseGroup: 'GLHF',
      indexer: '1337x',
      source: 'Prowlarr',
      downloadClient: 'SABnzbd'
    }),
    event: 'message',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },

  // Sonarr - Episode Grabbed with rich metadata
  {
    messageId: `${Date.now()}-sonarr2`,
    topic: 'sonarr',
    message: `Breaking Bad S05E14 "Ozymandias" has been grabbed and is queued for download.`,
    title: '📺 Episode Grabbed: Breaking Bad',
    priority: 4,
    tags: JSON.stringify(['tv', 'grab', '⬇️']),
    click: null,
    icon: null,
    actions: null,
    metadata: JSON.stringify({
      seriesName: 'Breaking Bad',
      episodeTitle: 'Ozymandias',
      episodeNumber: '14',
      seasonNumber: '5',
      quality: 'Bluray-1080p',
      indexer: 'NZBgeek',
      downloadClient: 'SABnzbd'
    }),
    event: 'message',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },

  // Radarr - Movie Downloaded with rich metadata
  {
    messageId: `${Date.now()}-radarr1`,
    topic: 'radarr',
    message: `The Shawshank Redemption (1994) has been downloaded and added to your library.`,
    title: '🎬 Movie Downloaded: The Shawshank Redemption',
    priority: 3,
    tags: JSON.stringify(['movie', 'download', '✅', '1994']),
    click: 'https://radarr.local/movie/the-shawshank-redemption-1994',
    icon: null,
    actions: null,
    metadata: JSON.stringify({
      movieTitle: 'The Shawshank Redemption',
      movieYear: '1994',
      quality: 'Bluray-1080p',
      size: '8.5 GB',
      releaseGroup: 'SPARKS',
      customFormat: 'Bluray-1080p',
      customFormatScore: 150
    }),
    event: 'message',
    createdAt: new Date(Date.now() - 10800000).toISOString()
  },

  // Radarr - Movie Grabbed with rich metadata
  {
    messageId: `${Date.now()}-radarr2`,
    topic: 'radarr',
    message: `Inception (2010) has been grabbed and sent to qBittorrent.`,
    title: 'Movie Grabbed: Inception',
    priority: 4,
    tags: JSON.stringify(['movie', 'grab', '4K', 'HDR']),
    click: null,
    icon: null,
    actions: null,
    metadata: JSON.stringify({
      movieTitle: 'Inception',
      movieYear: '2010',
      quality: 'WEBDL-2160p HDR',
      size: '25.3 GB',
      indexer: 'RARBG',
      downloadClient: 'qBittorrent',
      customFormatScore: 200
    }),
    event: 'message',
    createdAt: new Date(Date.now() - 14400000).toISOString()
  },

  // Sonarr - Health Issue
  {
    messageId: `${Date.now()}-sonarr3`,
    topic: 'sonarr',
    message: `Health check warning: Download client qBittorrent is unavailable.

Unable to connect to download client. Check that qBittorrent is running and accessible.`,
    title: '⚠️ Sonarr Health Warning',
    priority: 4,
    tags: JSON.stringify(['health', 'warning', '⚠️']),
    click: null,
    icon: null,
    actions: null,
    event: 'message',
    createdAt: new Date(Date.now() - 18000000).toISOString()
  },

  // Radarr - Upgrade Downloaded
  {
    messageId: `${Date.now()}-radarr3`,
    topic: 'radarr',
    message: `The Dark Knight (2008) has been upgraded from WEBDL-1080p to Bluray-1080p.

Previous: WEBDL-1080p (3.2 GB)
New: Bluray-1080p (8.1 GB)
Release Group: FGT`,
    title: '⬆️ Movie Upgraded: The Dark Knight',
    priority: 3,
    tags: JSON.stringify(['movie', 'upgrade', '✅']),
    click: 'https://radarr.local/movie/the-dark-knight-2008',
    icon: null,
    actions: null,
    event: 'message',
    createdAt: new Date(Date.now() - 21600000).toISOString()
  },

  // Sonarr - Series Added
  {
    messageId: `${Date.now()}-sonarr4`,
    topic: 'sonarr',
    message: `The Last of Us (2023) has been added to your series library.

Seasons: 1
Episodes: 9
Quality Profile: HD-1080p
Monitor: All Episodes`,
    title: '➕ New Series Added: The Last of Us',
    priority: 2,
    tags: JSON.stringify(['tv', 'new-series', '2023']),
    click: null,
    icon: null,
    actions: null,
    event: 'message',
    createdAt: new Date(Date.now() - 25200000).toISOString()
  },

  // Radarr - Missing Movie
  {
    messageId: `${Date.now()}-radarr4`,
    topic: 'radarr',
    message: `Interstellar (2014) could not be found on any indexers.

Searched 12 indexers with no results.
Check that the movie title is correct or try again later.`,
    title: '❌ Movie Not Found: Interstellar',
    priority: 2,
    tags: JSON.stringify(['movie', 'missing', '🔍']),
    click: null,
    icon: null,
    actions: null,
    event: 'message',
    createdAt: new Date(Date.now() - 28800000).toISOString()
  },

  // Sonarr - Rename Complete
  {
    messageId: `${Date.now()}-sonarr5`,
    topic: 'sonarr',
    message: `File rename completed for Game of Thrones Season 8.

10 files renamed to match naming convention.`,
    title: 'Files Renamed: Game of Thrones',
    priority: 2,
    tags: JSON.stringify(['tv', 'rename', '📝']),
    click: null,
    icon: null,
    actions: null,
    event: 'message',
    createdAt: new Date(Date.now() - 32400000).toISOString()
  },

  // Radarr - Import Failed
  {
    messageId: `${Date.now()}-radarr5`,
    topic: 'radarr',
    message: `Failed to import: Blade.Runner.2049.2017.1080p.BluRay.x264-SPARKS.mkv

Error: Unable to parse movie title from filename.
Please check the file and try importing manually.`,
    title: '❌ Import Failed',
    priority: 5,
    tags: JSON.stringify(['movie', 'error', '⚠️']),
    click: null,
    icon: null,
    actions: null,
    event: 'message',
    createdAt: new Date(Date.now() - 36000000).toISOString()
  },

  // General System Message
  {
    messageId: `${Date.now()}-system1`,
    topic: 'system',
    message: `Backup completed successfully.

Database backup saved to: /backups/auditarr-2024-02-14.db
Size: 45.2 MB`,
    title: '💾 Backup Complete',
    priority: 2,
    tags: JSON.stringify(['system', 'backup', '✅']),
    click: null,
    icon: null,
    actions: null,
    event: 'message',
    createdAt: new Date(Date.now() - 39600000).toISOString()
  },

  // Test notification with actions
  {
    messageId: `${Date.now()}-test1`,
    topic: 'test',
    message: 'This is a test notification with interactive actions.',
    title: '🧪 Test Notification',
    priority: 3,
    tags: JSON.stringify(['test', 'example']),
    click: null,
    icon: null,
    actions: JSON.stringify([
      { action: 'view', label: 'View Details', url: 'https://example.com/details' },
      { action: 'http', label: 'Acknowledge', url: 'https://example.com/ack' }
    ]),
    event: 'message',
    createdAt: new Date(Date.now() - 43200000).toISOString()
  }
]

async function seed() {
  console.log('Seeding database with example messages...\n')

  try {
    // Insert all example messages
    await db.insert(messages).values(exampleMessages)

    console.log(`Successfully seeded ${exampleMessages.length} messages`)
    console.log('\nTopics seeded:')
    console.log('  - sonarr (5 messages)')
    console.log('  - radarr (5 messages)')
    console.log('  - system (1 message)')
    console.log('  - test (1 message)')
    console.log('\nSeeding complete!')

  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }

  process.exit(0)
}

seed()

