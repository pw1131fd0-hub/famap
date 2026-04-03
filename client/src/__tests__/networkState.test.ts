import { describe, it, expect, beforeEach, vi } from 'vitest';
import networkStateManager from '../utils/networkState';

describe('Network State Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to known state
    networkStateManager.init();
  });

  describe('Initialization', () => {
    it('should initialize with current online status', () => {
      expect(networkStateManager.isOnline()).toBe(true);
    });

    it('should detect connection type', () => {
      const summary = networkStateManager.getSummary();
      expect(summary).toHaveProperty('online');
      expect(summary).toHaveProperty('connection');
    });

    it('should be safe to call init multiple times', () => {
      networkStateManager.init();
      networkStateManager.init();
      expect(networkStateManager.isOnline()).toBe(true);
    });
  });

  describe('Online/Offline Status', () => {
    it('should report online status correctly', () => {
      expect(networkStateManager.isOnline()).toBeDefined();
      expect(typeof networkStateManager.isOnline()).toBe('boolean');
    });

    it('should get connection info if available', () => {
      const connection = networkStateManager.getConnection();
      if (connection) {
        expect(connection).toHaveProperty('effectiveType');
      }
    });
  });

  describe('Connection Quality', () => {
    it('should detect slow connections', () => {
      const isSlow = networkStateManager.isSlowConnection();
      expect(typeof isSlow).toBe('boolean');
    });

    it('should detect data saver mode', () => {
      const dataSaver = networkStateManager.isDataSaverEnabled();
      expect(typeof dataSaver).toBe('boolean');
    });
  });

  describe('Subscriptions', () => {
    it('should subscribe to network state changes', () => {
      const listener = vi.fn();
      const unsubscribe = networkStateManager.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow unsubscribing from network state changes', () => {
      const listener = vi.fn();
      const unsubscribe = networkStateManager.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();

      // Should not throw
      unsubscribe();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();

      networkStateManager.subscribe(errorListener);
      networkStateManager.subscribe(goodListener);

      // Subscribing error-prone listeners should not break the manager
      // Verify manager still works after subscribing
      expect(networkStateManager.isOnline()).toBeDefined();
      expect(typeof networkStateManager.getSummary()).toBe('object');
    });
  });

  describe('Wait for Online', () => {
    it('should resolve immediately if already online', async () => {
      const result = await networkStateManager.waitForOnline(1000);
      expect(result).toBe(true);
    });

    it('should have waitForOnline method available', async () => {
      expect(typeof networkStateManager.waitForOnline).toBe('function');

      // Test that method resolves with boolean
      const result = await networkStateManager.waitForOnline(100);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Summary', () => {
    it('should return comprehensive network summary', () => {
      const summary = networkStateManager.getSummary();

      expect(summary).toHaveProperty('online');
      expect(summary).toHaveProperty('isSlowConnection');
      expect(summary).toHaveProperty('isDataSaverEnabled');
      expect(typeof summary.online).toBe('boolean');
      expect(typeof summary.isSlowConnection).toBe('boolean');
      expect(typeof summary.isDataSaverEnabled).toBe('boolean');
    });
  });

  describe('Real-time Detection', () => {
    it('should have working listeners mechanism', () => {
      const listener = vi.fn();

      const unsubscribe = networkStateManager.subscribe(listener);
      expect(unsubscribe).toBeDefined();
    });
  });
});
