import { describe, it, expect } from 'vitest';

describe('Mobile Viewport & Responsive Computation Logic', () => {
  describe('Pagination windowing logic for compact mobile display', () => {
    function computePages(currentPage: number, totalPages: number) {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      const pages: (number | string)[] = [1];
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
      return pages;
    }

    it('should compute exact mobile page counter representation', () => {
      const currentPage = 3;
      const totalItems = 45;
      const pageSize = 10;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

      const mobileIndicator = `${currentPage} / ${totalPages}`;
      expect(totalPages).toBe(5);
      expect(mobileIndicator).toBe('3 / 5');
    });

    it('should clamp mobile page navigation boundaries cleanly', () => {
      const totalPages = 4;
      const canGoPrev = (current: number) => current > 1;
      const canGoNext = (current: number) => current < totalPages;

      expect(canGoPrev(1)).toBe(false);
      expect(canGoNext(1)).toBe(true);

      expect(canGoPrev(4)).toBe(true);
      expect(canGoNext(4)).toBe(false);

      expect(canGoPrev(2)).toBe(true);
      expect(canGoNext(2)).toBe(true);
    });

    it('should properly generate windowed page items for larger totals', () => {
      const pages = computePages(5, 10);
      expect(pages).toContain(1);
      expect(pages).toContain('...');
      expect(pages).toContain(4);
      expect(pages).toContain(5);
      expect(pages).toContain(6);
      expect(pages).toContain(10);
    });
  });

  describe('Compact mobile KPI and occupancy metrics formatting', () => {
    function calculateOccupancy(totalUnits: number, availableUnits: number): number {
      if (totalUnits === 0) return 0;
      const occupied = Math.max(0, totalUnits - availableUnits);
      return Math.round((occupied / totalUnits) * 100);
    }

    it('should calculate 0% occupancy when no units exist without division by zero', () => {
      expect(calculateOccupancy(0, 0)).toBe(0);
    });

    it('should calculate accurate percentage for partial occupancy', () => {
      expect(calculateOccupancy(10, 3)).toBe(70);
      expect(calculateOccupancy(20, 5)).toBe(75);
    });

    it('should calculate 100% occupancy when no available units remain', () => {
      expect(calculateOccupancy(12, 0)).toBe(100);
    });
  });

  describe('Home page quick-search filter card fill & query parameter mapping', () => {
    function mapQuickSearch(city: string, beds: string, budget: string) {
      const query: Record<string, string> = {};
      if (city) query.city = city;
      if (beds) query.bedrooms = beds;
      if (budget === 'under500') {
        query.maxRent = '500';
      } else if (budget === '500-1200') {
        query.minRent = '500';
        query.maxRent = '1200';
      } else if (budget === '1200plus') {
        query.minRent = '1200';
      }
      return query;
    }

    it('should correctly map empty quick search to empty query', () => {
      expect(mapQuickSearch('', '', '')).toEqual({});
    });

    it('should correctly map selected city and bedroom count', () => {
      const q = mapQuickSearch('Phnom Penh', '2', '');
      expect(q).toEqual({ city: 'Phnom Penh', bedrooms: '2' });
    });

    it('should correctly map budget presets into minRent and maxRent bounds', () => {
      expect(mapQuickSearch('', '', 'under500')).toEqual({ maxRent: '500' });
      expect(mapQuickSearch('', '', '500-1200')).toEqual({ minRent: '500', maxRent: '1200' });
      expect(mapQuickSearch('', '', '1200plus')).toEqual({ minRent: '1200' });
    });

    it('should map combined city, beds, and budget parameters into complete query', () => {
      const q = mapQuickSearch('Siem Reap', '1', 'under500');
      expect(q).toEqual({
        city: 'Siem Reap',
        bedrooms: '1',
        maxRent: '500',
      });
    });
  });
});
