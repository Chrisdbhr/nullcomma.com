import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loader as homePageLoader } from '../../pages/HomePage';

const mockProjects = [
  {
    id: 1,
    release_date: '2023-10-01',
    engine: 'Unity',
    project_type: 'game',
    translations: [], tags: [], card_image: null,
  },
  {
    id: 2,
    release_date: '2024-03-15',
    engine: 'Unreal Engine',
    project_type: 'tool',
    translations: [], tags: [], card_image: null,
  },
  {
    id: 3,
    release_date: '2025-06-20',
    engine: 'Unity',
    project_type: 'game',
    translations: [], tags: [], card_image: null,
  },
  {
    id: 4,
    release_date: '2024-07-25',
    engine: 'Construct 2',
    project_type: 'asset',
    translations: [], tags: [], card_image: null,
  },
  {
    id: 5,
    release_date: '2023-12-10',
    engine: 'Godot Engine',
    project_type: null,
    translations: [], tags: [], card_image: null,
  },
];

const mockNow = new Date('2024-08-01T12:00:00Z');

describe('HomePage Loader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should fetch projects, categorize, and group them correctly', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockProjects }),
      })
    );

    const result = await homePageLoader();

    expect(result.totalProjectsCount).toBe(5);

    expect(result.unreleasedProjects).toHaveLength(1);
    expect(result.unreleasedProjects[0].id).toBe(3);

    expect(result.groupedReleasedProjects['2024']).toHaveLength(2);
    expect(result.groupedReleasedProjects['2023']).toHaveLength(2);
    expect(result.sortedYears).toEqual(['2024', '2023']);

    expect(result.totalEngineStats).toEqual([
      ['Construct 2', 1],
      ['Godot', 1],
      ['Unity', 2],
      ['Unreal', 1]
    ]);

    expect(result.uniqueProjectTypes.sort()).toEqual(['asset', 'game', 'project', 'tool']);
  });

  it('should return empty lists on API error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    const result = await homePageLoader();

    expect(result.totalProjectsCount).toBe(0);
    expect(result.unreleasedProjects).toHaveLength(0);
    expect(result.groupedReleasedProjects).toEqual({});
    expect(result.uniqueProjectTypes).toHaveLength(0);
    expect(result.totalEngineStats).toHaveLength(0);

    consoleErrorSpy.mockRestore();
  });
});
