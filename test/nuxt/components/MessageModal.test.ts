import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import MessageModal from '../../../app/components/MessageModal.vue'

describe('MessageModal', () => {
  const mockMessage = {
    id: '123-abc',
    topic: 'sonarr',
    message: 'Test message content',
    title: 'Test Title',
    priority: 4,
    tags: ['tv', 'download', '✅'],
    click: 'https://example.com',
    icon: null,
    actions: [
      { action: 'view', label: 'View', url: 'https://example.com/view' }
    ],
    time: new Date('2024-01-15T10:00:00Z').toISOString()
  }

  it('renders modal with message title', () => {
    render(MessageModal, {
      props: {
        message: mockMessage,
        modelValue: true
      }
    })

    expect(screen.getByText('Test Title')).toBeTruthy()
  })

  it('displays message content', () => {
    render(MessageModal, {
      props: {
        message: mockMessage,
        modelValue: true
      }
    })

    expect(screen.getByText('Test message content')).toBeTruthy()
  })

  it('shows topic badge', () => {
    render(MessageModal, {
      props: {
        message: mockMessage,
        modelValue: true
      }
    })

    expect(screen.getByText('sonarr')).toBeTruthy()
  })

  it('displays priority badge for high priority messages', () => {
    render(MessageModal, {
      props: {
        message: mockMessage,
        modelValue: true
      }
    })

    expect(screen.getByText('High')).toBeTruthy()
  })

  it('does not show priority badge for default priority', () => {
    render(MessageModal, {
      props: {
        message: { ...mockMessage, priority: 3 },
        modelValue: true
      }
    })

    expect(screen.queryByText('Default')).toBeNull()
  })

  it('displays all tags', () => {
    render(MessageModal, {
      props: {
        message: mockMessage,
        modelValue: true
      }
    })

    expect(screen.getByText('tv')).toBeTruthy()
    expect(screen.getByText('download')).toBeTruthy()
    expect(screen.getByText('✅')).toBeTruthy()
  })

  it('shows metadata section with message ID', () => {
    render(MessageModal, {
      props: {
        message: mockMessage,
        modelValue: true
      }
    })

    expect(screen.getByText('Metadata')).toBeTruthy()
    expect(screen.getByText('Message ID')).toBeTruthy()
    expect(screen.getByText('123-abc')).toBeTruthy()
  })

  it('displays priority in metadata', () => {
    render(MessageModal, {
      props: {
        message: mockMessage,
        modelValue: true
      }
    })

    expect(screen.getByText(/High \(4\/5\)/)).toBeTruthy()
  })

  it('shows action buttons when present', () => {
    render(MessageModal, {
      props: {
        message: mockMessage,
        modelValue: true
      }
    })

    expect(screen.getByText('View Details')).toBeTruthy()
    expect(screen.getByText('View')).toBeTruthy()
  })

  it('displays different priority levels correctly', () => {
    const priorities = [
      { priority: 1, label: 'Min' },
      { priority: 2, label: 'Low' },
      { priority: 4, label: 'High' },
      { priority: 5, label: 'Urgent' }
    ]

    priorities.forEach(({ priority, label }) => {
      const { getByText } = render(MessageModal, {
        props: {
          message: { ...mockMessage, priority },
          modelValue: true
        }
      })

      expect(getByText(label)).toBeTruthy()
    })
  })

  it('shows attachments section when images are present', () => {
    const messageWithImage = {
      ...mockMessage,
      message: 'Check this image: https://example.com/image.jpg',
      icon: 'https://example.com/icon.png'
    }

    render(MessageModal, {
      props: {
        message: messageWithImage,
        modelValue: true
      }
    })

    expect(screen.getByText('Attachments')).toBeTruthy()
  })

  it('displays tags section header', () => {
    render(MessageModal, {
      props: {
        message: mockMessage,
        modelValue: true
      }
    })

    expect(screen.getByText('Tags')).toBeTruthy()
  })

  it('shows actions section when actions exist', () => {
    render(MessageModal, {
      props: {
        message: mockMessage,
        modelValue: true
      }
    })

    expect(screen.getByText('Actions')).toBeTruthy()
  })

  it('handles message without title', () => {
    const messageNoTitle = {
      ...mockMessage,
      title: null
    }

    render(MessageModal, {
      props: {
        message: messageNoTitle,
        modelValue: true
      }
    })

    expect(screen.getByText('Message Details')).toBeTruthy()
  })

  it('displays timestamp section in metadata', () => {
    render(MessageModal, {
      props: {
        message: mockMessage,
        modelValue: true
      }
    })

    expect(screen.getByText('Timestamp')).toBeTruthy()
  })
})
