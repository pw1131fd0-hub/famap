/**
 * Deployment Rollback Strategy
 * Handles automatic rollback on deployment failures
 */

export interface DeploymentVersion {
  version: string;
  timestamp: string;
  healthy: boolean;
  bundleHash: string;
}

export interface RollbackConfig {
  maxVersionsToKeep: number;
  healthCheckInterval: number;
  autoRollbackThreshold: number; // Number of failed health checks before rollback
}

const DEPLOYMENT_KEY = '__famap_deployment_versions';
const CURRENT_VERSION_KEY = '__famap_current_version';
const HEALTH_CHECK_KEY = '__famap_health_check_failures';

/**
 * Records current deployment version
 */
export function recordDeploymentVersion(version: string, bundleHash: string): void {
  const deployment: DeploymentVersion = {
    version,
    timestamp: new Date().toISOString(),
    healthy: true,
    bundleHash,
  };

  localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(deployment));

  // Keep version history
  const versions = getAllVersions();
  versions.unshift(deployment);

  // Keep only recent versions
  const maxVersions = 10;
  if (versions.length > maxVersions) {
    versions.pop();
  }

  localStorage.setItem(DEPLOYMENT_KEY, JSON.stringify(versions));
}

/**
 * Gets all recorded deployment versions
 */
export function getAllVersions(): DeploymentVersion[] {
  try {
    const stored = localStorage.getItem(DEPLOYMENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Gets current deployment version
 */
export function getCurrentVersion(): DeploymentVersion | null {
  try {
    const stored = localStorage.getItem(CURRENT_VERSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Gets previous healthy version
 */
export function getPreviousHealthyVersion(): DeploymentVersion | null {
  const versions = getAllVersions();
  const current = getCurrentVersion();

  return (
    versions.find(
      (v) => v.healthy && v.version !== current?.version && v.bundleHash !== current?.bundleHash
    ) || null
  );
}

/**
 * Records health check failure
 */
export function recordHealthCheckFailure(): void {
  const failures = getHealthCheckFailures();
  const current = getCurrentVersion();

  if (!current) return;

  const newFailures = {
    ...failures,
    [current.version]: (failures[current.version] || 0) + 1,
  };

  localStorage.setItem(HEALTH_CHECK_KEY, JSON.stringify(newFailures));
}

/**
 * Gets health check failure counts
 */
export function getHealthCheckFailures(): Record<string, number> {
  try {
    const stored = localStorage.getItem(HEALTH_CHECK_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Checks if rollback is needed based on health check failures
 */
export function shouldRollback(threshold: number = 3): boolean {
  const failures = getHealthCheckFailures();
  const current = getCurrentVersion();

  if (!current) return false;

  const failureCount = failures[current.version] || 0;
  return failureCount >= threshold;
}

/**
 * Performs rollback to previous version
 */
export function performRollback(): boolean {
  const previous = getPreviousHealthyVersion();

  if (!previous) {
    console.error('No previous healthy version available for rollback');
    return false;
  }

  console.warn(`🔄 Rolling back to version ${previous.version}`);

  // Record the rollback
  localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(previous));

  // Reset health check failures for the new current version
  const failures = getHealthCheckFailures();
  delete failures[previous.version];
  localStorage.setItem(HEALTH_CHECK_KEY, JSON.stringify(failures));

  // Suggest page reload to load previous version
  console.log('⚠️  Rollback successful. Please reload the page to apply the changes.');

  return true;
}

/**
 * Marks version as unhealthy
 */
export function markVersionUnhealthy(version: string): void {
  const versions = getAllVersions();
  const updated = versions.map((v) => (v.version === version ? { ...v, healthy: false } : v));
  localStorage.setItem(DEPLOYMENT_KEY, JSON.stringify(updated));

  const current = getCurrentVersion();
  if (current && current.version === version) {
    current.healthy = false;
    localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(current));
  }
}

/**
 * Marks version as healthy
 */
export function markVersionHealthy(version: string): void {
  const versions = getAllVersions();
  const updated = versions.map((v) => (v.version === version ? { ...v, healthy: true } : v));
  localStorage.setItem(DEPLOYMENT_KEY, JSON.stringify(updated));

  const current = getCurrentVersion();
  if (current && current.version === version) {
    current.healthy = true;
    localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(current));
  }

  // Clear health check failures for healthy version
  const failures = getHealthCheckFailures();
  delete failures[version];
  localStorage.setItem(HEALTH_CHECK_KEY, JSON.stringify(failures));
}

/**
 * Clears deployment history
 */
export function clearDeploymentHistory(): void {
  localStorage.removeItem(DEPLOYMENT_KEY);
  localStorage.removeItem(CURRENT_VERSION_KEY);
  localStorage.removeItem(HEALTH_CHECK_KEY);
}

/**
 * Gets deployment statistics
 */
export function getDeploymentStats() {
  const versions = getAllVersions();
  const healthyVersions = versions.filter((v) => v.healthy).length;
  const unhealthyVersions = versions.length - healthyVersions;
  const current = getCurrentVersion();

  return {
    totalVersions: versions.length,
    healthyVersions,
    unhealthyVersions,
    currentVersion: current?.version || 'unknown',
    currentHealthy: current?.healthy || false,
    lastDeployment: versions[0]?.timestamp || null,
    hasRollbackAvailable: getPreviousHealthyVersion() !== null,
  };
}

/**
 * Validates bundle integrity
 */
export function validateBundleIntegrity(expectedHash: string): boolean {
  const current = getCurrentVersion();

  if (!current) {
    console.warn('No current version recorded for bundle validation');
    return true; // Not critical on first load
  }

  if (current.bundleHash !== expectedHash) {
    console.error('Bundle hash mismatch - deployment may be corrupted');
    return false;
  }

  return true;
}

/**
 * Initializes deployment tracking
 */
export function initializeDeploymentTracking(version: string, bundleHash: string): void {
  // Record this version
  recordDeploymentVersion(version, bundleHash);

  // Validate bundle integrity
  if (!validateBundleIntegrity(bundleHash)) {
    console.error('Bundle validation failed');
    return;
  }

  // Log current stats
  const stats = getDeploymentStats();
  console.log('📦 Deployment Info:', stats);
}
