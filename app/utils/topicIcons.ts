// Map of homelab app topics to their brand icons.
// Uses simple-icons (brand logos) where available, falls back to heroicons/lucide.

export const topicIcons: Record<string, string> = {
  // Media managers — brand logos from simple-icons
  sonarr: 'i-simple-icons-sonarr',
  radarr: 'i-simple-icons-radarr',
  lidarr: 'i-heroicons-musical-note',
  readarr: 'i-heroicons-book-open',
  bazarr: 'i-heroicons-language',
  prowlarr: 'i-heroicons-magnifying-glass-circle',
  whisparr: 'i-heroicons-sparkles',
  overseerr: 'i-heroicons-film',
  jellyseerr: 'i-heroicons-film',
  notifiarr: 'i-heroicons-bell-snooze',

  // Media servers — brand logos from simple-icons
  jellyfin: 'i-simple-icons-jellyfin',
  plex: 'i-simple-icons-plex',
  emby: 'i-simple-icons-emby',
  kodi: 'i-simple-icons-kodi',
  navidrome: 'i-heroicons-musical-note',
  audiobookshelf: 'i-simple-icons-audiobookshelf',

  // Download clients — brand logos from simple-icons
  sabnzbd: 'i-heroicons-cloud-arrow-down',
  qbittorrent: 'i-simple-icons-qbittorrent',
  deluge: 'i-simple-icons-deluge',
  transmission: 'i-simple-icons-transmission',
  nzbget: 'i-heroicons-arrow-down-tray',
  nzbhydra: 'i-heroicons-magnifying-glass',

  // Indexers / search
  jackett: 'i-heroicons-magnifying-glass',

  // Request managers
  ombi: 'i-heroicons-hand-raised',

  // Automation
  unpackerr: 'i-heroicons-archive-box',
  kometa: 'i-heroicons-film',
  maintainerr: 'i-heroicons-wrench-screwdriver',
  automations: 'i-heroicons-cog',

  // System / general
  system: 'i-heroicons-cpu-chip',
  services: 'i-heroicons-server-stack',
  backup: 'i-heroicons-archive-box-arrow-down',
  health: 'i-lucide-heart-pulse',
  test: 'i-heroicons-beaker',
  ntfy: 'i-simple-icons-ntfy',

  // Fallback
  default: 'i-heroicons-bell'
}

export const topicColors: Record<string, string> = {
  // Media managers — brand-inspired colors
  sonarr: 'purple',
  radarr: 'yellow',
  lidarr: 'green',
  readarr: 'blue',
  bazarr: 'blue',
  prowlarr: 'orange',
  whisparr: 'pink',
  overseerr: 'blue',
  jellyseerr: 'blue',
  notifiarr: 'amber',

  // Media servers
  jellyfin: 'blue',
  plex: 'yellow',
  emby: 'green',
  kodi: 'orange',
  navidrome: 'green',
  audiobookshelf: 'orange',

  // Download clients
  sabnzbd: 'orange',
  qbittorrent: 'cyan',
  deluge: 'teal',
  transmission: 'indigo',
  nzbget: 'green',
  nzbhydra: 'purple',

  // Indexers
  jackett: 'red',

  // Request managers
  ombi: 'violet',

  // Automation
  unpackerr: 'gray',
  kometa: 'rose',
  maintainerr: 'slate',
  automations: 'gray',

  // System
  system: 'gray',
  services: 'slate',
  backup: 'sky',
  health: 'red',
  test: 'cyan',
  ntfy: 'primary',

  // Fallback
  default: 'primary'
}

// Get icon for a topic, falls back to default bell icon
export function getTopicIcon(topic: string): string {
  const normalized = topic.toLowerCase()
  return topicIcons[normalized] || topicIcons.default
}

// Get color for a topic, falls back to primary
export function getTopicColor(topic: string): string {
  const normalized = topic.toLowerCase()
  return topicColors[normalized] || topicColors.default
}
