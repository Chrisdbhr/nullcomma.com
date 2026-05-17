import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loader as loadHomePageData } from '../../pages/HomePage';

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

    const result = await loadHomePageData();

    expect(result.totalProjectsCount).toBe(5);

    // Latest: current year (2024) + future (2025)
    expect(result.latestProjects).toHaveLength(3);
    // Unreleased first, then current year descending
    expect(result.latestProjects[0].id).toBe(3); // 2025 (future)
    expect(result.latestProjects[1].id).toBe(4); // 2024-07-25
    expect(result.latestProjects[2].id).toBe(2); // 2024-03-15

    // Past projects grouped (excluding current year 2024)
    expect(result.groupedPastProjects['2023']).toHaveLength(2);
    expect(result.sortedYears).toEqual(['2023']);

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

    const result = await loadHomePageData();

    expect(result.totalProjectsCount).toBe(0);
    expect(result.latestProjects).toHaveLength(0);
    expect(result.groupedPastProjects).toEqual({});
    expect(result.uniqueProjectTypes).toHaveLength(0);
    expect(result.totalEngineStats).toHaveLength(0);

    consoleErrorSpy.mockRestore();
  });
});
