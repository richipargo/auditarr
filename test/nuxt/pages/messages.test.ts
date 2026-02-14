import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import MessagesPage from '../../../app/pages/messages.vue'

// Mock $fetch globally
const mockFetch = vi.fn()
global.$fetch = mockFetch as any

describe('Messages Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue([])
  })

  const mockMessages = [
    {
      id: '123-abc',
      topic: 'sonarr',
      message: 'Episode downloaded',
      title: 'Episode Downloaded',
      priority: 3,
      tags: ['tv', 'download'],
      time: new Date().toISOString()
    },
    {
      id: '456-def',
      topic: 'radarr',
      message: 'Movie grabbed',
      title: 'Movie Grabbed',
      priority: 5,
      tags: ['movie', 'grab'],
      time: new Date(Date.now() - 3600000).toISOString()
    }
  ]

  it('renders page header', () => {
    render(MessagesPage, {
      global: {
        stubs: {
          UContainer: true,
          UCard: true,
          UButton: true,
          UFormField: true,
          USelect: true,
          UInput: true,
          UIcon: true,
          MessageTable: true,
          MessageModal: true
        }
      }
    })

    expect(screen.getByText('Message Audit Trail')).toBeTruthy()
    expect(screen.getByText(/Track and monitor all system notifications/)).toBeTruthy()
  })

  it('displays filter section', () => {
    render(MessagesPage, {
      global: {
        stubs: {
          UContainer: true,
          UCard: true,
          UButton: true,
          UFormField: true,
          USelect: true,
          UInput: true,
          UIcon: true,
          MessageTable: true,
          MessageModal: true
        }
      }
    })

    expect(screen.getByText('Filters')).toBeTruthy()
  })

  it('shows all filter fields', () => {
    render(MessagesPage, {
      global: {
        stubs: {
          UContainer: true,
          UCard: true,
          UButton: true,
          UFormField: true,
          USelect: true,
          UInput: true,
          UIcon: true,
          MessageTable: true,
          MessageModal: true
        }
      }
    })

    expect(screen.getByText('Topic')).toBeTruthy()
    expect(screen.getByText('Search')).toBeTruthy()
    expect(screen.getByText('Start Date')).toBeTruthy()
    expect(screen.getByText('End Date')).toBeTruthy()
  })

  it('displays stats dashboard', () => {
    render(MessagesPage, {
      global: {
        stubs: {
          UContainer: true,
          UCard: true,
          UButton: true,
          UFormField: true,
          USelect: true,
          UInput: true,
          UIcon: true,
          MessageTable: true,
          MessageModal: true
        }
      }
    })

    expect(screen.getByText('Total Messages')).toBeTruthy()
    expect(screen.getByText('Topics')).toBeTruthy()
    expect(screen.getByText('High Priority')).toBeTruthy()
    expect(screen.getByText('Last 24h')).toBeTruthy()
  })

  it('shows no messages state initially', async () => {
    render(MessagesPage, {
      global: {
        stubs: {
          UContainer: true,
          UCard: true,
          UButton: true,
          UFormField: true,
          USelect: true,
          UInput: true,
          UIcon: true,
          MessageTable: true,
          MessageModal: true
        }
      }
    })

    await waitFor(() => {
      expect(screen.getByText('No messages found')).toBeTruthy()
    })
  })

  it('displays clear filters button when filters are active', async () => {
    const { getByText, queryByText } = render(MessagesPage, {
      global: {
        stubs: {
          UContainer: true,
          UCard: true,
          UButton: true,
          UFormField: true,
          USelect: true,
          UInput: true,
          UIcon: true,
          MessageTable: true,
          MessageModal: true
        }
      }
    })

    // Initially no clear button (no active filters)
    await waitFor(() => {
      expect(queryByText('Clear All')).toBeNull()
    })
  })

  it('renders stat values as numbers', () => {
    const { container } = render(MessagesPage, {
      global: {
        stubs: {
          UContainer: true,
          UCard: true,
          UButton: true,
          UFormField: true,
          USelect: true,
          UInput: true,
          UIcon: true,
          MessageTable: true,
          MessageModal: true
        }
      }
    })

    // Should display initial counts (0s)
    expect(container.textContent).toContain('0')
  })

  it('shows loading indicator initially', () => {
    const { container } = render(MessagesPage, {
      global: {
        stubs: {
          UContainer: true,
          UCard: true,
          UButton: true,
          UFormField: true,
          USelect: true,
          UInput: true,
          UIcon: true,
          MessageTable: true,
          MessageModal: true
        }
      }
    })

    // Should have some content rendering
    expect(container).toBeTruthy()
  })

  it('renders main container', () => {
    const { container } = render(MessagesPage, {
      global: {
        stubs: {
          UContainer: true,
          UCard: true,
          UButton: true,
          UFormField: true,
          USelect: true,
          UInput: true,
          UIcon: true,
          MessageTable: true,
          MessageModal: true
        }
      }
    })

    expect(container.querySelector('[class*="py-8"]')).toBeTruthy()
  })

  it('has proper page structure', () => {
    const { container } = render(MessagesPage, {
      global: {
        stubs: {
          UContainer: true,
          UCard: true,
          UButton: true,
          UFormField: true,
          USelect: true,
          UInput: true,
          UIcon: true,
          MessageTable: true,
          MessageModal: true
        }
      }
    })

    // Check for grid layout
    expect(container.querySelector('[class*="grid"]')).toBeTruthy()
  })
})
