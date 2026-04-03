/**
 * Network State Detection & Management
 * Provides real-time network state detection and recovery strategies
 */

import { addBreadcrumb } from './sentryConfig';

export interface NetworkStateChangeEvent {
  online: boolean;
  type: 'online' | 'offline';
  timestamp: number;
  connection?: Connection;
}

export interface Connection {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

type NetworkStateListener = (event: NetworkStateChangeEvent) => void;

class NetworkStateManager {
  private online: boolean = navigator.onLine ?? true;
  private listeners: Set<NetworkStateListener> = new Set();
  private connection: Connection | null = null;
  private isInitialized = false;

  /**
   * Initialize network state monitoring
   */
  init(): void {
    if (this.isInitialized) return;
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

    this.isInitialized = true;
    this.online = navigator.onLine ?? true;
    this.detectConnection();

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Listen for connection changes if available
    const navigator_ = navigator as any;
    if (navigator_.connection) {
      navigator_.connection.addEventListener('change', () => {
        this.detectConnection();
        this.notifyListeners();
      });
    }

    addBreadcrumb(
      `Network state initialized - online: ${this.online}`,
      'info',
      'network',
      { online: this.online }
    );
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.online = true;
    this.detectConnection();
    addBreadcrumb(
      'Device came online',
      'info',
      'network',
      { connection: this.connection }
    );
    this.notifyListeners();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.online = false;
    addBreadcrumb(
      'Device went offline',
      'warning',
      'network'
    );
    this.notifyListeners();
  }

  /**
   * Detect connection type and speed
   */
  private detectConnection(): void {
    const navigator_ = navigator as any;
    if (navigator_.connection) {
      this.connection = {
        effectiveType: navigator_.connection.effectiveType || '4g',
        downlink: navigator_.connection.downlink,
        rtt: navigator_.connection.rtt,
        saveData: navigator_.connection.saveData ?? false,
      };
    }
  }

  /**
   * Subscribe to network state changes
   */
  subscribe(listener: NetworkStateListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const event: NetworkStateChangeEvent = {
      online: this.online,
      type: this.online ? 'online' : 'offline',
      timestamp: Date.now(),
      connection: this.connection || undefined,
    };

    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        addBreadcrumb(
          'Network state listener error',
          'error',
          'network',
          { error: String(error) }
        );
      }
    });
  }

  /**
   * Get current online status
   */
  isOnline(): boolean {
    return this.online;
  }

  /**
   * Get current connection info
   */
  getConnection(): Connection | null {
    return this.connection;
  }

  /**
   * Check if connection is slow (2g or 3g)
   */
  isSlowConnection(): boolean {
    if (!this.connection) return false;
    return this.connection.effectiveType === '2g' ||
           this.connection.effectiveType === '3g' ||
           this.connection.effectiveType === 'slow-2g';
  }

  /**
   * Check if data saver is enabled
   */
  isDataSaverEnabled(): boolean {
    return this.connection?.saveData ?? false;
  }

  /**
   * Wait for online state (with optional timeout)
   */
  async waitForOnline(timeoutMs: number = 30000): Promise<boolean> {
    if (this.online) return true;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        addBreadcrumb(
          'Wait for online timed out',
          'warning',
          'network'
        );
        resolve(false);
      }, timeoutMs);

      const unsubscribe = this.subscribe((event) => {
        if (event.online) {
          clearTimeout(timeout);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  /**
   * Get network state summary
   */
  getSummary() {
    return {
      online: this.online,
      connection: this.connection,
      isSlowConnection: this.isSlowConnection(),
      isDataSaverEnabled: this.isDataSaverEnabled(),
    };
  }
}

// Create singleton instance
const networkStateManager = new NetworkStateManager();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  networkStateManager.init();
}

export default networkStateManager;
