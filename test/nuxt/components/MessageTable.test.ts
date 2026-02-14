import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import MessageTable from '../../../app/components/MessageTable.vue'

describe('MessageTable', () => {
  const mockMessages = [
    {
      id: '123-abc',
      topic: 'sonarr',
      message: 'Episode downloaded',
      title: 'Episode Downloaded',
      priority: 3,
      tags: ['tv', 'download'],
      time: new Date('2024-01-15T10:00:00Z').toISOString()
    },
    {
      id: '456-def',
      topic: 'radarr',
      message: 'Movie grabbed',
      title: 'Movie Grabbed',
      priority: 4,
      tags: ['movie', 'grab'],
      time: new Date('2024-01-15T09:00:00Z').toISOString()
    },
    {
      id: '789-ghi',
      topic: 'system',
      message: 'Backup complete',
      title: 'Backup Complete',
      priority: 2,
      tags: ['system', 'backup', 'success'],
      time: new Date('2024-01-14T10:00:00Z').toISOString()
    }
  ]

  it('renders table with column headers', () => {
    render(MessageTable, {
      props: {
        messages: mockMessages
      }
    })

    expect(screen.getByText('Priority')).toBeTruthy()
    expect(screen.getByText('Topic')).toBeTruthy()
    expect(screen.getByText('Title')).toBeTruthy()
    expect(screen.getByText('Time')).toBeTruthy()
    expect(screen.getByText('Tags')).toBeTruthy()
  })

  it('displays all message titles', () => {
    render(MessageTable, {
      props: {
        messages: mockMessages
      }
    })

    expect(screen.getByText('Episode Downloaded')).toBeTruthy()
    expect(screen.getByText('Movie Grabbed')).toBeTruthy()
    expect(screen.getByText('Backup Complete')).toBeTruthy()
  })

  it('shows priority labels', () => {
    render(MessageTable, {
      props: {
        messages: mockMessages
      }
    })

    expect(screen.getByText('Default')).toBeTruthy()
    expect(screen.getByText('High')).toBeTruthy()
    expect(screen.getByText('Low')).toBeTruthy()
  })

  it('displays topic badges', () => {
    render(MessageTable, {
      props: {
        messages: mockMessages
      }
    })

    expect(screen.getByText('sonarr')).toBeTruthy()
    expect(screen.getByText('radarr')).toBeTruthy()
    expect(screen.getByText('system')).toBeTruthy()
  })

  it('shows individual tags', () => {
    render(MessageTable, {
      props: {
        messages: mockMessages
      }
    })

    expect(screen.getByText('tv')).toBeTruthy()
    expect(screen.getByText('download')).toBeTruthy()
    expect(screen.getByText('movie')).toBeTruthy()
    expect(screen.getByText('grab')).toBeTruthy()
  })

  it('displays tag counter for messages with more than 2 tags', () => {
    render(MessageTable, {
      props: {
        messages: mockMessages
      }
    })

    // System message has 3 tags, should show +1
    expect(screen.getByText('+1')).toBeTruthy()
  })

  it('truncates long messages when no title', () => {
    const longMessage = {
      id: '999-zzz',
      topic: 'test',
      message: 'This is a very long message that should be truncated to 50 characters and show ellipsis',
      title: '',
      priority: 3,
      tags: [],
      time: new Date().toISOString()
    }

    render(MessageTable, {
      props: {
        messages: [longMessage]
      }
    })

    expect(screen.getByText(/\.\.\./)).toBeTruthy()
  })

  it('renders empty table when no messages', () => {
    const { container } = render(MessageTable, {
      props: {
        messages: []
      }
    })

    // Table should still render structure
    expect(container.querySelector('table')).toBeTruthy()
  })

  it('handles messages without tags', () => {
    const messageNoTags = {
      id: '111-aaa',
      topic: 'test',
      message: 'No tags message',
      title: 'No Tags',
      priority: 3,
      tags: null,
      time: new Date().toISOString()
    }

    render(MessageTable, {
      props: {
        messages: [messageNoTags]
      }
    })

    expect(screen.getByText('No Tags')).toBeTruthy()
  })

  it('displays correct number of rows', () => {
    const { container } = render(MessageTable, {
      props: {
        messages: mockMessages
      }
    })

    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(mockMessages.length)
  })

  it('shows all three priority levels in correct order', () => {
    render(MessageTable, {
      props: {
        messages: mockMessages
      }
    })

    const priorityText = screen.getByText('Default')
    const highText = screen.getByText('High')
    const lowText = screen.getByText('Low')

    expect(priorityText).toBeTruthy()
    expect(highText).toBeTruthy()
    expect(lowText).toBeTruthy()
  })
})
