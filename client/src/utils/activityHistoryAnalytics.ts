/**
 * Activity History Tracker & Analytics
 * Tracks family visit history and provides smart insights for better trip planning
 * Addresses family needs: "哪裡去過最多次?" (Where have we been most?), "花了多少錢?" (How much did we spend?)
 */

interface VisitRecord {
  locationId: string;
  locationName: string;
  category: string;
  visitDate: Date;
  duration: number; // minutes
  cost: number;
  familySize: number;
  satisfaction: 1 | 2 | 3 | 4 | 5; // 1-5 rating
  notes?: string;
}

interface LocationFrequency {
  locationId: string;
  locationName: string;
  visitCount: number;
  totalCost: number;
  averageCost: number;
  averageDuration: number;
  averageSatisfaction: number;
  lastVisit: Date;
}

interface TimeBasedAnalytics {
  timeOfDay: {
    morning: { visits: number; avgSatisfaction: number };
    afternoon: { visits: number; avgSatisfaction: number };
    evening: { visits: number; avgSatisfaction: number };
  };
  dayOfWeek: {
    weekday: { visits: number; avgSatisfaction: number };
    weekend: { visits: number; avgSatisfaction: number };
  };
  monthlySpending: Record<string, number>;
}

interface FamilyInsights {
  totalVisits: number;
  totalSpending: number;
  averageCostPerVisit: number;
  favoriteLocation: LocationFrequency | null;
  mostSatisfyingCategory: string;
  bestTimeToVisit: string;
  estimatedAnnualBudget: number;
  savingOpportunities: string[];
  trends: {
    spendingTrend: 'increasing' | 'decreasing' | 'stable';
    satisfactionTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

class ActivityHistoryTracker {
  private visits: VisitRecord[] = [];
  private storageKey = 'fammap_visit_history';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Record a new visit
   */
  recordVisit(record: VisitRecord): void {
    this.visits.push({
      ...record,
      visitDate: new Date(record.visitDate),
    });
    this.saveToStorage();
  }

  /**
   * Get location frequency analysis
   */
  getLocationFrequency(): LocationFrequency[] {
    const frequency: Record<string, LocationFrequency> = {};

    this.visits.forEach((visit) => {
      if (!frequency[visit.locationId]) {
        frequency[visit.locationId] = {
          locationId: visit.locationId,
          locationName: visit.locationName,
          visitCount: 0,
          totalCost: 0,
          averageCost: 0,
          averageDuration: 0,
          averageSatisfaction: 0,
          lastVisit: visit.visitDate,
        };
      }

      const loc = frequency[visit.locationId];
      loc.visitCount += 1;
      loc.totalCost += visit.cost;
      loc.lastVisit = new Date(
        Math.max(
          loc.lastVisit.getTime(),
          visit.visitDate.getTime()
        )
      );
    });

    return Object.values(frequency)
      .map((loc) => ({
        ...loc,
        averageCost: loc.totalCost / loc.visitCount,
        averageDuration: this.calculateAverageDuration(loc.locationId),
        averageSatisfaction: this.calculateAverageSatisfaction(
          loc.locationId
        ),
      }))
      .sort((a, b) => b.visitCount - a.visitCount);
  }

  /**
   * Get time-based analytics
   */
  getTimeBasedAnalytics(): TimeBasedAnalytics {
    const analytics: TimeBasedAnalytics = {
      timeOfDay: {
        morning: { visits: 0, avgSatisfaction: 0 },
        afternoon: { visits: 0, avgSatisfaction: 0 },
        evening: { visits: 0, avgSatisfaction: 0 },
      },
      dayOfWeek: {
        weekday: { visits: 0, avgSatisfaction: 0 },
        weekend: { visits: 0, avgSatisfaction: 0 },
      },
      monthlySpending: {},
    };

    const timeSatisfactions = {
      morning: [] as number[],
      afternoon: [] as number[],
      evening: [] as number[],
    };

    const dayWeekSatisfactions = {
      weekday: [] as number[],
      weekend: [] as number[],
    };

    this.visits.forEach((visit) => {
      const hour = visit.visitDate.getHours();
      const dayOfWeek = visit.visitDate.getDay();

      // Time of day
      if (hour < 12) {
        analytics.timeOfDay.morning.visits += 1;
        timeSatisfactions.morning.push(visit.satisfaction);
      } else if (hour < 17) {
        analytics.timeOfDay.afternoon.visits += 1;
        timeSatisfactions.afternoon.push(visit.satisfaction);
      } else {
        analytics.timeOfDay.evening.visits += 1;
        timeSatisfactions.evening.push(visit.satisfaction);
      }

      // Day of week
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        analytics.dayOfWeek.weekend.visits += 1;
        dayWeekSatisfactions.weekend.push(visit.satisfaction);
      } else {
        analytics.dayOfWeek.weekday.visits += 1;
        dayWeekSatisfactions.weekday.push(visit.satisfaction);
      }

      // Monthly spending
      const monthKey = visit.visitDate.toISOString().substring(0, 7);
      analytics.monthlySpending[monthKey] =
        (analytics.monthlySpending[monthKey] || 0) + visit.cost;
    });

    // Calculate averages
    analytics.timeOfDay.morning.avgSatisfaction =
      this.calculateAverage(timeSatisfactions.morning);
    analytics.timeOfDay.afternoon.avgSatisfaction =
      this.calculateAverage(timeSatisfactions.afternoon);
    analytics.timeOfDay.evening.avgSatisfaction =
      this.calculateAverage(timeSatisfactions.evening);

    analytics.dayOfWeek.weekday.avgSatisfaction =
      this.calculateAverage(dayWeekSatisfactions.weekday);
    analytics.dayOfWeek.weekend.avgSatisfaction =
      this.calculateAverage(dayWeekSatisfactions.weekend);

    return analytics;
  }

  /**
   * Get comprehensive family insights
   */
  getFamilyInsights(): FamilyInsights {
    if (this.visits.length === 0) {
      return {
        totalVisits: 0,
        totalSpending: 0,
        averageCostPerVisit: 0,
        favoriteLocation: null,
        mostSatisfyingCategory: '',
        bestTimeToVisit: '下午' /* afternoon */,
        estimatedAnnualBudget: 0,
        savingOpportunities: [],
        trends: {
          spendingTrend: 'stable',
          satisfactionTrend: 'stable',
        },
      };
    }

    const totalSpending = this.visits.reduce(
      (sum, v) => sum + v.cost,
      0
    );
    const totalVisits = this.visits.length;
    const averageCostPerVisit = totalSpending / totalVisits;
    const frequencies = this.getLocationFrequency();
    const timeAnalytics = this.getTimeBasedAnalytics();

    const categoryStats = this.getCategoryStats();
    const mostSatisfyingCategory = Object.entries(categoryStats).sort(
      ([, a], [, b]) => b.avgSatisfaction - a.avgSatisfaction
    )[0]?.[0] || '';

    const bestTimeToVisit =
      timeAnalytics.timeOfDay.morning.avgSatisfaction >
      timeAnalytics.timeOfDay.afternoon.avgSatisfaction &&
      timeAnalytics.timeOfDay.morning.avgSatisfaction >
        timeAnalytics.timeOfDay.evening.avgSatisfaction
        ? '上午' /* morning */
        : timeAnalytics.timeOfDay.afternoon.avgSatisfaction >
            timeAnalytics.timeOfDay.evening.avgSatisfaction
          ? '下午' /* afternoon */
          : '傍晚' /* evening */;

    const savingOpportunities = this.identifySavingOpportunities(
      frequencies,
      categoryStats
    );

    const estimatedAnnualBudget = this.estimateAnnualBudget(
      totalSpending,
      totalVisits
    );

    const spendingTrend = this.analyzeTrend(
      this.visits.map((v) => v.cost)
    );
    const satisfactionTrend = this.analyzeTrend(
      this.visits.map((v) => v.satisfaction)
    );

    return {
      totalVisits,
      totalSpending,
      averageCostPerVisit: averageCostPerVisit,
      favoriteLocation: frequencies[0] || null,
      mostSatisfyingCategory,
      bestTimeToVisit,
      estimatedAnnualBudget,
      savingOpportunities,
      trends: {
        spendingTrend: spendingTrend,
        satisfactionTrend: satisfactionTrend,
      },
    };
  }

  /**
   * Get category statistics
   */
  private getCategoryStats(): Record<
    string,
    {
      count: number;
      totalCost: number;
      avgCost: number;
      avgSatisfaction: number;
    }
  > {
    const stats: Record<
      string,
      {
        count: number;
        totalCost: number;
        avgCost: number;
        avgSatisfaction: number;
        satisfactions: number[];
      }
    > = {};

    this.visits.forEach((visit) => {
      if (!stats[visit.category]) {
        stats[visit.category] = {
          count: 0,
          totalCost: 0,
          avgCost: 0,
          avgSatisfaction: 0,
          satisfactions: [],
        };
      }

      const cat = stats[visit.category];
      cat.count += 1;
      cat.totalCost += visit.cost;
      cat.satisfactions.push(visit.satisfaction);
    });

    const result: Record<
      string,
      {
        count: number;
        totalCost: number;
        avgCost: number;
        avgSatisfaction: number;
      }
    > = {};

    Object.entries(stats).forEach(([key, value]) => {
      result[key] = {
        count: value.count,
        totalCost: value.totalCost,
        avgCost: value.totalCost / value.count,
        avgSatisfaction: this.calculateAverage(value.satisfactions),
      };
    });

    return result;
  }

  /**
   * Identify saving opportunities
   */
  private identifySavingOpportunities(
    frequencies: LocationFrequency[],
    categoryStats: Record<
      string,
      {
        count: number;
        totalCost: number;
        avgCost: number;
        avgSatisfaction: number;
      }
    >
  ): string[] {
    const opportunities: string[] = [];

    // Find expensive locations with lower satisfaction
    frequencies.forEach((freq) => {
      if (
        freq.averageCost > 500 &&
        freq.averageSatisfaction < 3.5
      ) {
        opportunities.push(
          `${freq.locationName}的費用較高但滿意度偏低，可考慮減少訪問`
        );
      }
    });

    // Find cheaper alternatives with high satisfaction
    const byCategory = Object.entries(categoryStats).sort(
      ([, a], [, b]) => a.avgCost - b.avgCost
    );

    if (byCategory.length >= 2) {
      const cheapest = byCategory[0];
      const mostExpensive = byCategory[byCategory.length - 1];

      if (
        cheapest[1].avgSatisfaction >= mostExpensive[1].avgSatisfaction
      ) {
        opportunities.push(
          `${cheapest[0]}類景點平均費用較低且滿意度相近，可多加利用`
        );
      }
    }

    // Weekday vs weekend savings
    const timeAnalytics = this.getTimeBasedAnalytics();
    const weekdayAvg = this.calculateAverageFromAnalytics(
      timeAnalytics.dayOfWeek.weekday
    );
    const weekendAvg = this.calculateAverageFromAnalytics(
      timeAnalytics.dayOfWeek.weekend
    );

    if (weekdayAvg < weekendAvg * 0.8) {
      opportunities.push(
        `週間の訪問が週末より安い - 平日の計画で節約可能`
      );
    }

    return opportunities;
  }

  /**
   * Estimate annual budget based on visit history
   */
  private estimateAnnualBudget(
    totalSpending: number,
    totalVisits: number
  ): number {
    if (totalVisits === 0) return 0;

    // Get the date range
    const oldestVisit = new Date(
      Math.min(
        ...this.visits.map((v) => v.visitDate.getTime())
      )
    );
    const newestVisit = new Date(
      Math.max(
        ...this.visits.map((v) => v.visitDate.getTime())
      )
    );

    const daysOfData = Math.max(
      1,
      (newestVisit.getTime() - oldestVisit.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const visitsPerDay = totalVisits / daysOfData;
    const annualVisits = visitsPerDay * 365;
    const costPerVisit = totalSpending / totalVisits;

    return Math.round(annualVisits * costPerVisit);
  }

  /**
   * Analyze trend direction
   */
  private analyzeTrend(
    values: number[]
  ): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const recent = values.slice(-5);
    const earlier = values.slice(0, Math.max(1, values.length - 5));

    const recentAvg = this.calculateAverage(recent);
    const earlierAvg = this.calculateAverage(earlier);

    const percentChange = Math.abs(
      (recentAvg - earlierAvg) / earlierAvg
    );

    if (percentChange < 0.1) return 'stable';
    return recentAvg > earlierAvg ? 'increasing' : 'decreasing';
  }

  /**
   * Calculate average duration for a location
   */
  private calculateAverageDuration(locationId: string): number {
    const durations = this.visits
      .filter((v) => v.locationId === locationId)
      .map((v) => v.duration);

    return durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
  }

  /**
   * Calculate average satisfaction for a location
   */
  private calculateAverageSatisfaction(locationId: string): number {
    const satisfactions = this.visits
      .filter((v) => v.locationId === locationId)
      .map((v) => v.satisfaction);

    return satisfactions.length > 0
      ? satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length
      : 0;
  }

  /**
   * Calculate average from array
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Calculate average from time analytics object
   */
  private calculateAverageFromAnalytics(obj: {
    visits: number;
    avgSatisfaction: number;
  }): number {
    return obj.visits > 0 ? obj.avgSatisfaction : 0;
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.visits = [];
    this.saveToStorage();
  }

  /**
   * Get all visits
   */
  getVisits(): VisitRecord[] {
    return [...this.visits];
  }

  /**
   * Save to local storage
   */
  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify(this.visits)
        );
      }
    } catch (error) {
      console.error('Failed to save visit history:', error);
    }
  }

  /**
   * Load from local storage
   */
  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
          this.visits = JSON.parse(data).map(
            (v: VisitRecord) => ({
              ...v,
              visitDate: new Date(v.visitDate),
            })
          );
        }
      }
    } catch (error) {
      console.error('Failed to load visit history:', error);
      this.visits = [];
    }
  }
}

export { ActivityHistoryTracker };
export type {
  VisitRecord,
  LocationFrequency,
  TimeBasedAnalytics,
  FamilyInsights,
};
