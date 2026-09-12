import { describe, expect, it } from 'vitest';
import { toMessageResponse, toMessageResponseList } from '../../server/utils/messages';
import { messagesArraySchema } from '../../server/schemas/message';
import type { Message } from '../../server/db/schema.sqlite';

describe('toMessageResponse', () => {
  const mockRow: Message = {
    id: 1,
    topic: 'sonarr',
    message: 'Episode downloaded',
    title: 'Episode Downloaded',
    priority: 3,
    tags: JSON.stringify(['tv', 'download']),
    click: 'https://example.com',
    icon: null,
    actions: null,
    metadata: null,
    event: 'message',
    createdAt: new Date('2024-01-15T10:00:00Z'),
  };

  it('transforms a database row into a MessageResponse', () => {
    const result = toMessageResponse(mockRow);

    expect(result.id).toBe('1');
    expect(result.topic).toBe('sonarr');
    expect(result.message).toBe('Episode downloaded');
    expect(result.title).toBe('Episode Downloaded');
    expect(result.priority).toBe(3);
    expect(result.event).toBe('message');
    expect(result.time).toBe(new Date('2024-01-15T10:00:00Z').toISOString());
  });

  it('parses JSON string fields into arrays and objects', () => {
    const rowWithJson: Message = {
      ...mockRow,
      tags: JSON.stringify(['warning', 'server']),
      actions: JSON.stringify([{ action: 'view', label: 'View', url: 'https://example.com/view' }]),
      metadata: JSON.stringify({ quality: 'WEBDL-1080p', size: '1.34 GB' }),
    };

    const result = toMessageResponse(rowWithJson);

    expect(result.tags).toEqual(['warning', 'server']);
    expect(result.actions).toEqual([{ action: 'view', label: 'View', url: 'https://example.com/view' }]);
    expect(result.metadata).toEqual({ quality: 'WEBDL-1080p', size: '1.34 GB' });
  });

  it('returns undefined for null JSON fields', () => {
    const rowWithNulls: Message = {
      ...mockRow,
      tags: null,
      actions: null,
      metadata: null,
      icon: null,
    };

    const result = toMessageResponse(rowWithNulls);

    expect(result.tags).toBeUndefined();
    expect(result.actions).toBeUndefined();
    expect(result.metadata).toBeUndefined();
    expect(result.icon).toBeUndefined();
  });

  it('returns undefined for invalid JSON strings', () => {
    const rowWithBadJson: Message = {
      ...mockRow,
      tags: 'not valid json',
      actions: '{broken',
    };

    const result = toMessageResponse(rowWithBadJson);

    expect(result.tags).toBeUndefined();
    expect(result.actions).toBeUndefined();
  });
});

describe('toMessageResponseList', () => {
  it('transforms an array of database rows', () => {
    const rows: Message[] = [
      {
        id: 1,
        topic: 'sonarr',
        message: 'Message 1',
        title: null,
        priority: 3,
        tags: null,
        click: null,
        icon: null,
        actions: null,
        metadata: null,
        event: 'message',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 2,
        topic: 'radarr',
        message: 'Message 2',
        title: 'Movie Grabbed',
        priority: 4,
        tags: JSON.stringify(['movie']),
        click: null,
        icon: null,
        actions: null,
        metadata: null,
        event: 'message',
        createdAt: new Date('2024-01-15T09:00:00Z'),
      },
    ];

    const results = toMessageResponseList(rows);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('1');
    expect(results[0].topic).toBe('sonarr');
    expect(results[1].id).toBe('2');
    expect(results[1].topic).toBe('radarr');
    expect(results[1].title).toBe('Movie Grabbed');
    expect(results[1].tags).toEqual(['movie']);
  });

  it('produces results that pass messagesArraySchema validation', () => {
    const rows: Message[] = [
      {
        id: 1,
        topic: 'test',
        message: 'Test message',
        title: 'Test Title',
        priority: 3,
        tags: JSON.stringify(['tag1', 'tag2']),
        click: null,
        icon: null,
        actions: null,
        metadata: null,
        event: 'message',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
    ];

    const results = toMessageResponseList(rows);
    const validated = messagesArraySchema.parse(results);

    expect(validated).toHaveLength(1);
    expect(validated[0].id).toBe('1');
    expect(validated[0].topic).toBe('test');
    expect(validated[0].tags).toEqual(['tag1', 'tag2']);
  });
});
