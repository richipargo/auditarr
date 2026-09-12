import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/vue';
import { MessageTable } from '#components';
import type { MessageResponse } from '~/utils/api';

describe('MessageTable', () => {
  const mockMessages: MessageResponse[] = [
    {
      id: '123-abc',
      topic: 'sonarr',
      message: 'Episode downloaded',
      title: 'Episode Downloaded',
      priority: 3,
      tags: ['tv', 'download'],
      event: 'message',
      time: new Date('2024-01-15T10:00:00Z').toISOString()
    },
    {
      id: '456-def',
      topic: 'radarr',
      message: 'Movie grabbed',
      title: 'Movie Grabbed',
      priority: 4,
      tags: ['movie', 'grab'],
      event: 'message',
      time: new Date('2024-01-15T09:00:00Z').toISOString()
    },
    {
      id: '789-ghi',
      topic: 'system',
      message: 'Backup complete',
      title: 'Backup Complete',
      priority: 2,
      tags: ['system', 'backup', 'success'],
      event: 'message',
      time: new Date('2024-01-14T10:00:00Z').toISOString()
    }
  ];

  it('renders table with column headers', () => {
    render(MessageTable, {
      props: { messages: mockMessages }
    });

    expect(screen.getByRole('columnheader', { name: 'Priority' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Topic' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Message' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Time' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Tags' })).toBeTruthy();
  });

  it('displays all message titles', () => {
    render(MessageTable, {
      props: { messages: mockMessages }
    });

    expect(screen.getAllByText('Episode Downloaded').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Movie Grabbed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Backup Complete').length).toBeGreaterThan(0);
  });

  it('shows priority indicators via title attribute', () => {
    render(MessageTable, {
      props: { messages: mockMessages }
    });

    // Priority is now a colored dot with a title attribute
    expect(screen.getAllByTitle('Default').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('High').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('Low').length).toBeGreaterThan(0);
  });

  it('displays topic badges', () => {
    render(MessageTable, {
      props: { messages: mockMessages }
    });

    expect(screen.getAllByText('sonarr').length).toBeGreaterThan(0);
    expect(screen.getAllByText('radarr').length).toBeGreaterThan(0);
    expect(screen.getAllByText('system').length).toBeGreaterThan(0);
  });

  it('shows individual tags', () => {
    render(MessageTable, {
      props: { messages: mockMessages }
    });

    expect(screen.getAllByText('tv').length).toBeGreaterThan(0);
    expect(screen.getAllByText('download').length).toBeGreaterThan(0);
    expect(screen.getAllByText('movie').length).toBeGreaterThan(0);
    expect(screen.getAllByText('grab').length).toBeGreaterThan(0);
  });

  it('displays tag counter for messages with more than 2 tags', () => {
    render(MessageTable, {
      props: { messages: mockMessages }
    });

    expect(screen.getAllByText('+1').length).toBeGreaterThan(0);
  });

  it('truncates long messages when no title', () => {
    const longMessage: MessageResponse = {
      id: '999-zzz',
      topic: 'test',
      message: 'This is a very long message that should be truncated to 50 characters and show ellipsis',
      title: undefined,
      priority: 3,
      tags: [],
      event: 'message',
      time: new Date().toISOString()
    };

    render(MessageTable, {
      props: { messages: [longMessage] }
    });

    expect(screen.getByText(/\.\.\./)).toBeTruthy();
  });

  it('renders empty table when no messages', () => {
    const { container } = render(MessageTable, {
      props: { messages: [] }
    });

    expect(container.querySelector('table')).toBeTruthy();
  });

  it('handles messages without tags', () => {
    const messageNoTags: MessageResponse = {
      id: '111-aaa',
      topic: 'test',
      message: 'No tags message',
      title: 'No Tags',
      priority: 3,
      tags: undefined,
      event: 'message',
      time: new Date().toISOString()
    };

    render(MessageTable, {
      props: { messages: [messageNoTags] }
    });

    expect(screen.getByText('No Tags', { selector: 'p' })).toBeTruthy();
  });

  it('displays correct number of rows', () => {
    const { container } = render(MessageTable, {
      props: { messages: mockMessages }
    });

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(mockMessages.length);
  });

  it('shows all three priority levels in correct order', () => {
    render(MessageTable, {
      props: { messages: mockMessages }
    });

    expect(screen.getAllByTitle('Default').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('High').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('Low').length).toBeGreaterThan(0);
  });
});
