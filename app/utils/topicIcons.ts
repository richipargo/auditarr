// Map of common homelab/api topics to icon names
// Icons use the Heroicons collection (i-heroicons-*)
// Available at: https://icones.js.org/collection/heroicons

export const topicIcons: Record<string, string> = {
  // Media server apps
  sonarr: 'i-heroicons-tv',
  radarr: 'i-heroicons-film',
  lidarr: 'i-heroicons-musical-note',
  readarr: 'i-heroicons-book-open',
  
  // Download clients
  sabnzbd: 'i-heroicons-cloud-arrow-down',
  qbittorrent: 'i-heroicons-arrow-down-tray',
  deluge: 'i-heroicons-arrow-down-tray',
  transmission: 'i-heroicons-arrow-down-tray',
  
  // Indexers
  prowlarr: 'i-heroicons-magnifying-glass-circle',
  
  // Notification regent
  notifiarr: 'i-heroicons-bell-snooze',
  
  // Automation
  automations: 'i-heroicons-cog',
  
  // System/General
  system: 'i-heroicons-cpu-chip',
  services: 'i-heroicons-server-stack',
  backup: 'i-heroicons-archive-box-arrow-down',
  health: 'i-heroicons-heart-pulse',
  
  // Generic fallback
  test: 'i-heroicons-beaker',
  default: 'i-heroicons-bell'
}

export const topicColors: Record<string, string> = {
  // Media server apps
  sonarr: 'purple',
  radarr: 'yellow',
  lidarr: 'green',
  readarr: 'blue',
  
  // Download clients
  sabnzbd: 'orange',
  qbittorrent: 'cyan',
  deluge: 'teal',
  transmission: 'indigo',
  
  // Indexers
  prowlarr: 'lime',
  
  // Notification
  notifiarr: 'amber',
  
  // System
  system: 'gray',
  services: 'slate',
  backup: 'sky',
  health: 'red',
  
  // Generic
  test: 'cyan',
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
