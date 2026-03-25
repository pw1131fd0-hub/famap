import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  recordDeploymentVersion,
  getAllVersions,
  getCurrentVersion,
  getPreviousHealthyVersion,
  recordHealthCheckFailure,
  getHealthCheckFailures,
  shouldRollback,
  performRollback,
  markVersionUnhealthy,
  markVersionHealthy,
  clearDeploymentHistory,
  getDeploymentStats,
  validateBundleIntegrity,
  initializeDeploymentTracking,
} from '../utils/deploymentRollback';

describe('deploymentRollback', () => {
  beforeEach(() => {
    clearDeploymentHistory();
    localStorage.clear();
  });

  describe('recordDeploymentVersion', () => {
    it('should record a new deployment version', () => {
      recordDeploymentVersion('v1.0.0', 'hash123');

      const current = getCurrentVersion();
      expect(current).toBeDefined();
      expect(current?.version).toBe('v1.0.0');
      expect(current?.bundleHash).toBe('hash123');
      expect(current?.healthy).toBe(true);
    });

    it('should record timestamp', () => {
      const before = new Date();
      recordDeploymentVersion('v1.0.0', 'hash123');
      const after = new Date();

      const current = getCurrentVersion();
      const timestamp = new Date(current?.timestamp || '');

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should maintain version history', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');
      recordDeploymentVersion('v1.0.2', 'hash3');

      const versions = getAllVersions();
      expect(versions.length).toBe(3);
      expect(versions[0].version).toBe('v1.0.2');
      expect(versions[1].version).toBe('v1.0.1');
      expect(versions[2].version).toBe('v1.0.0');
    });

    it('should limit version history', () => {
      for (let i = 0; i < 15; i++) {
        recordDeploymentVersion(`v1.0.${i}`, `hash${i}`);
      }

      const versions = getAllVersions();
      expect(versions.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getCurrentVersion', () => {
    it('should return null when no version recorded', () => {
      const current = getCurrentVersion();
      expect(current).toBeNull();
    });

    it('should return latest recorded version', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');

      const current = getCurrentVersion();
      expect(current?.version).toBe('v1.0.1');
    });
  });

  describe('getPreviousHealthyVersion', () => {
    it('should return previous healthy version', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');

      const previous = getPreviousHealthyVersion();
      expect(previous?.version).toBe('v1.0.0');
    });

    it('should skip unhealthy versions', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');
      recordDeploymentVersion('v1.0.2', 'hash3');

      markVersionUnhealthy('v1.0.1');

      const previous = getPreviousHealthyVersion();
      expect(previous?.version).toBe('v1.0.0');
      expect(previous?.healthy).toBe(true);
    });

    it('should return null when no previous healthy version', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      markVersionUnhealthy('v1.0.0');

      const previous = getPreviousHealthyVersion();
      expect(previous).toBeNull();
    });
  });

  describe('Health Check Failures', () => {
    it('should record health check failures', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordHealthCheckFailure();

      const failures = getHealthCheckFailures();
      expect(failures['v1.0.0']).toBe(1);
    });

    it('should increment failure count', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordHealthCheckFailure();
      recordHealthCheckFailure();
      recordHealthCheckFailure();

      const failures = getHealthCheckFailures();
      expect(failures['v1.0.0']).toBe(3);
    });

    it('should track failures separately for different versions', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordHealthCheckFailure();

      recordDeploymentVersion('v1.0.1', 'hash2');
      recordHealthCheckFailure();
      recordHealthCheckFailure();

      const failures = getHealthCheckFailures();
      expect(failures['v1.0.0']).toBe(1);
      expect(failures['v1.0.1']).toBe(2);
    });
  });

  describe('shouldRollback', () => {
    it('should return false with no failures', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');

      const should = shouldRollback(3);
      expect(should).toBe(false);
    });

    it('should return false below threshold', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordHealthCheckFailure();
      recordHealthCheckFailure();

      const should = shouldRollback(3);
      expect(should).toBe(false);
    });

    it('should return true at threshold', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordHealthCheckFailure();
      recordHealthCheckFailure();
      recordHealthCheckFailure();

      const should = shouldRollback(3);
      expect(should).toBe(true);
    });

    it('should return true above threshold', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordHealthCheckFailure();
      recordHealthCheckFailure();
      recordHealthCheckFailure();
      recordHealthCheckFailure();

      const should = shouldRollback(3);
      expect(should).toBe(true);
    });

    it('should return false with no current version', () => {
      const should = shouldRollback(3);
      expect(should).toBe(false);
    });
  });

  describe('performRollback', () => {
    it('should rollback to previous version', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');

      const result = performRollback();

      expect(result).toBe(true);
      const current = getCurrentVersion();
      expect(current?.version).toBe('v1.0.0');
    });

    it('should return false when no previous version', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');

      const result = performRollback();
      expect(result).toBe(false);
    });

    it('should clear health check failures for rolled-back version', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');
      recordHealthCheckFailure();
      recordHealthCheckFailure();

      performRollback();

      const failures = getHealthCheckFailures();
      expect(failures['v1.0.0']).toBeUndefined();
    });
  });

  describe('markVersionHealthy/Unhealthy', () => {
    it('should mark version as unhealthy', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');

      markVersionUnhealthy('v1.0.0');

      const version = getCurrentVersion();
      expect(version?.healthy).toBe(false);
    });

    it('should mark version as healthy', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      markVersionUnhealthy('v1.0.0');

      markVersionHealthy('v1.0.0');

      const version = getCurrentVersion();
      expect(version?.healthy).toBe(true);
    });

    it('should update version in history', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');

      markVersionUnhealthy('v1.0.0');

      const versions = getAllVersions();
      const v1 = versions.find((v) => v.version === 'v1.0.0');
      expect(v1?.healthy).toBe(false);
    });
  });

  describe('getDeploymentStats', () => {
    it('should return deployment statistics', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');

      const stats = getDeploymentStats();

      expect(stats.totalVersions).toBe(2);
      expect(stats.healthyVersions).toBe(2);
      expect(stats.unhealthyVersions).toBe(0);
      expect(stats.currentVersion).toBe('v1.0.1');
      expect(stats.currentHealthy).toBe(true);
    });

    it('should count unhealthy versions', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');
      markVersionUnhealthy('v1.0.1');

      const stats = getDeploymentStats();

      expect(stats.healthyVersions).toBe(1);
      expect(stats.unhealthyVersions).toBe(1);
      expect(stats.currentHealthy).toBe(false);
    });

    it('should indicate rollback availability', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');

      const stats = getDeploymentStats();

      expect(stats.hasRollbackAvailable).toBe(true);
    });
  });

  describe('validateBundleIntegrity', () => {
    it('should validate matching bundle hash', () => {
      recordDeploymentVersion('v1.0.0', 'hash123');

      const isValid = validateBundleIntegrity('hash123');
      expect(isValid).toBe(true);
    });

    it('should invalidate mismatched bundle hash', () => {
      recordDeploymentVersion('v1.0.0', 'hash123');

      const isValid = validateBundleIntegrity('hash456');
      expect(isValid).toBe(false);
    });

    it('should return true with no current version', () => {
      const isValid = validateBundleIntegrity('hash123');
      expect(isValid).toBe(true);
    });
  });

  describe('initializeDeploymentTracking', () => {
    it('should initialize deployment tracking', () => {
      initializeDeploymentTracking('v1.0.0', 'hash123');

      const current = getCurrentVersion();
      expect(current?.version).toBe('v1.0.0');
      expect(current?.bundleHash).toBe('hash123');
    });

    it('should handle bundle validation failure gracefully', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      initializeDeploymentTracking('v1.0.0', 'hash123');
      const current = getCurrentVersion();

      // Should still record the version even if validation has different expectations
      expect(current?.version).toBe('v1.0.0');

      spy.mockRestore();
    });

    it('should log deployment stats', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

      initializeDeploymentTracking('v1.0.0', 'hash123');

      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });

  describe('clearDeploymentHistory', () => {
    it('should clear all deployment data', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');

      clearDeploymentHistory();

      expect(getCurrentVersion()).toBeNull();
      expect(getAllVersions()).toEqual([]);
      expect(getHealthCheckFailures()).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('__famap_deployment_versions', 'invalid json');

      const versions = getAllVersions();
      expect(versions).toEqual([]);
    });

    it('should handle corrupted version data', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');

      // Corrupt the data
      localStorage.setItem('__famap_current_version', 'corrupted');

      const current = getCurrentVersion();
      expect(current).toBeNull();
    });

    it('should handle rollback scenarios', () => {
      recordDeploymentVersion('v1.0.0', 'hash1');
      recordDeploymentVersion('v1.0.1', 'hash2');
      recordDeploymentVersion('v1.0.2', 'hash3');

      // First rollback: from v1.0.2 to v1.0.1
      performRollback();
      const current = getCurrentVersion();
      expect(current?.version).toBe('v1.0.1');

      // Verify we can still access rollback capability
      expect(getPreviousHealthyVersion()).toBeDefined();
    });
  });
});
