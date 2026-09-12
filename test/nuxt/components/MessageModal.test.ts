import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/vue';
import { MessageModal } from '#components';
import type { MessageResponse } from '~/utils/api';

describe('MessageModal', () => {
  const mockMessage: MessageResponse = {
    id: '123-abc',
    topic: 'sonarr',
    message: 'Test message content',
    title: 'Test Title',
    priority: 4,
    tags: ['tv', 'download', '✅'],
    click: 'https://example.com',
    icon: undefined,
    actions: [
      { action: 'view', label: 'View', url: 'https://example.com/view' }
    ],
    event: 'message',
    time: new Date('2024-01-15T10:00:00Z').toISOString()
  };

  async function renderModal(overrides: Partial<MessageResponse> = {}) {
    const message = { ...mockMessage, ...overrides };
    render(MessageModal, {
      props: { message, modelValue: true }
    });
    // Wait for the modal content to be teleported and rendered
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  it('renders modal with message title', async () => {
    await renderModal();
    expect(screen.getAllByText('Test Title').length).toBeGreaterThan(0);
  });

  it('displays message content', async () => {
    await renderModal();
    expect(screen.getAllByText('Test message content').length).toBeGreaterThan(0);
  });

  it('shows topic badge', async () => {
    await renderModal();
    expect(screen.getAllByText('sonarr').length).toBeGreaterThan(0);
  });

  it('displays priority badge for high priority messages', async () => {
    await renderModal();
    expect(screen.getAllByText('High').length).toBeGreaterThan(0);
  });

  it('does not show priority badge for default priority', async () => {
    await renderModal({ priority: 3 });
    // Priority badge only shows when priority !== 3
    // "Default" appears only inside "Default (3/5)" in the Details section, not as a standalone badge
    expect(screen.queryAllByText('Default', { exact: true })).toHaveLength(0);
    // But the Details section should still show the priority label
    expect(screen.getAllByText(/Default \(3\/5\)/).length).toBeGreaterThan(0);
  });

  it('displays all tags', async () => {
    await renderModal();
    expect(screen.getAllByText('tv').length).toBeGreaterThan(0);
    expect(screen.getAllByText('download').length).toBeGreaterThan(0);
    expect(screen.getAllByText('✅').length).toBeGreaterThan(0);
  });

  it('shows details section with message ID', async () => {
    await renderModal();
    expect(screen.getAllByText('Details').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Message ID').length).toBeGreaterThan(0);
    expect(screen.getAllByText('123-abc').length).toBeGreaterThan(0);
  });

  it('displays priority in details', async () => {
    await renderModal();
    expect(screen.getAllByText(/High \(4\/5\)/).length).toBeGreaterThan(0);
  });

  it('shows action buttons when present', async () => {
    await renderModal();
    expect(screen.getAllByText('View Details').length).toBeGreaterThan(0);
    expect(screen.getAllByText('View').length).toBeGreaterThan(0);
  });

  it('displays different priority levels correctly', async () => {
    const priorities = [
      { priority: 1, label: 'Min' },
      { priority: 2, label: 'Low' },
      { priority: 4, label: 'High' },
      { priority: 5, label: 'Urgent' }
    ];

    for (const { priority, label } of priorities) {
      const { unmount } = render(MessageModal, {
        props: {
          message: { ...mockMessage, priority },
          modelValue: true
        }
      });
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
      unmount();
    }
  });

  it('shows images section when images are present', async () => {
    await renderModal({
      message: 'Check this image: https://example.com/image.jpg',
      icon: 'https://example.com/icon.png'
    });
    expect(screen.getAllByText('Images').length).toBeGreaterThan(0);
  });

  it('displays tags section header', async () => {
    await renderModal();
    expect(screen.getAllByText('Tags').length).toBeGreaterThan(0);
  });

  it('shows actions section when actions exist', async () => {
    await renderModal();
    expect(screen.getAllByText('Actions').length).toBeGreaterThan(0);
  });

  it('handles message without title', async () => {
    await renderModal({ title: undefined });
    expect(screen.getAllByText('Untitled Message').length).toBeGreaterThan(0);
  });

  it('displays sent timestamp in details', async () => {
    await renderModal();
    expect(screen.getAllByText('Sent').length).toBeGreaterThan(0);
  });
});
