import React, { useState, useEffect, useCallback } from 'react';
import { Settings, BarChart3, MessageSquare, Image as ImageIcon, Percent, LogOut, Mail, Phone } from 'lucide-react';
import type { VenueManager, VenueManagerDashboardData } from '../types/venueManager';
import '../styles/VenueManagerPortal.css';

interface VenueManagerPortalProps {
  venueId: string;
  onClose: () => void;
}

type TabType = 'overview' | 'analytics' | 'reviews' | 'photos' | 'offers' | 'settings';

export const VenueManagerPortal: React.FC<VenueManagerPortalProps> = ({ venueId, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [manager, setManager] = useState<VenueManager | null>(null);
  const [dashboardData, setDashboardData] = useState<VenueManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadManagerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load manager data from localStorage for demo
      const savedManager = localStorage.getItem(`venue_manager_${venueId}`);
      if (savedManager) {
        const manager = JSON.parse(savedManager);
        setManager(manager);
        setIsAuthenticated(true);

        // Generate mock dashboard data
        const mockData: VenueManagerDashboardData = {
          manager,
          venue: {
            id: venueId,
            name: 'Sample Venue',
            category: 'park',
            address: 'Taipei, Taiwan',
            rating: 4.5,
            reviewCount: 128
          },
          analytics: {
            venueId,
            period: 'week',
            views: 1243,
            searches: 456,
            clicks: 892,
            favorites: 167,
            reviews: 23,
            avgRating: 4.5,
            topSearchQueries: ['family friendly', 'playground', 'stroller accessible'],
            trafficByHour: {
              8: 45, 9: 78, 10: 156, 11: 234, 12: 189, 13: 156, 14: 245, 15: 267
            }
          },
          recentReviews: [
            {
              id: 'r1',
              rating: 5,
              comment: 'Great place for kids!',
              author: 'Parent A',
              createdAt: Date.now() - 86400000,
              hasResponse: true
            },
            {
              id: 'r2',
              rating: 4,
              comment: 'Good facilities, could be cleaner',
              author: 'Parent B',
              createdAt: Date.now() - 172800000,
              hasResponse: false
            }
          ],
          photos: [
            {
              id: 'p1',
              venueId,
              url: 'https://via.placeholder.com/300x200?text=Exterior',
              caption: 'Main entrance',
              uploadedBy: 'manager',
              uploadedAt: Date.now() - 604800000,
              isApproved: true,
              category: 'exterior',
              order: 1
            }
          ],
          offers: [
            {
              id: 'o1',
              venueId,
              title: 'Weekend Family Special',
              description: '20% off for families on weekends',
              discountPercentage: 20,
              validFrom: Date.now(),
              validUntil: Date.now() + 2592000000,
              maxUses: 100,
              usedCount: 23,
              conditions: 'Valid for up to 4 people, valid on Saturdays and Sundays'
            }
          ],
          unreadMessages: 3
        };

        setDashboardData(mockData);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError('Failed to load manager data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    loadManagerData();
  }, [loadManagerData]);

   
  const handleLogin = (email: string, _password: string) => {
    const newManager: VenueManager = {
      id: 'mgr_' + Math.random().toString(36).substr(2, 9),
      venueId,
      userId: 'u_manager_1',
      name: 'Manager Name',
      email,
      phoneNumber: '+886-2-XXXX-XXXX',
      role: 'owner',
      permissions: [
        'view_analytics',
        'edit_basic_info',
        'edit_amenities',
        'manage_photos',
        'respond_to_reviews',
        'manage_events'
      ],
      claimedAt: Date.now(),
      verifiedAt: Date.now(),
      verificationStatus: 'verified'
    };

    localStorage.setItem(`venue_manager_${venueId}`, JSON.stringify(newManager));
    setManager(newManager);
    setIsAuthenticated(true);
    loadManagerData();
  };

  const handleLogout = () => {
    localStorage.removeItem(`venue_manager_${venueId}`);
    setManager(null);
    setIsAuthenticated(false);
    setDashboardData(null);
  };

  if (!isAuthenticated) {
    return <ManagerLoginForm venueId={venueId} onLogin={handleLogin} onClose={onClose} />;
  }

  if (loading) {
    return (
      <div className="venue-manager-loading">
        <div className="spinner" />
        <p>Loading venue management dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="venue-manager-error">
        <p>{error}</p>
        <button onClick={loadManagerData}>Retry</button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="venue-manager-portal">
      <div className="vm-header">
        <div className="vm-header-content">
          <h1>🏢 Venue Manager Portal</h1>
          <p className="vm-venue-name">{dashboardData?.venue.name}</p>
        </div>
        <button className="vm-logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={20} />
        </button>
        <button className="vm-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="vm-tabs">
        <TabButton
          icon={<BarChart3 size={18} />}
          label="Overview"
          isActive={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        />
        <TabButton
          icon={<BarChart3 size={18} />}
          label="Analytics"
          isActive={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
        />
        <TabButton
          icon={<MessageSquare size={18} />}
          label="Reviews"
          isActive={activeTab === 'reviews'}
          onClick={() => setActiveTab('reviews')}
          badge={dashboardData?.recentReviews.filter(r => !r.hasResponse).length || 0}
        />
        <TabButton
          icon={<ImageIcon size={18} />}
          label="Photos"
          isActive={activeTab === 'photos'}
          onClick={() => setActiveTab('photos')}
        />
        <TabButton
          icon={<Percent size={18} />}
          label="Offers"
          isActive={activeTab === 'offers'}
          onClick={() => setActiveTab('offers')}
        />
        <TabButton
          icon={<Settings size={18} />}
          label="Settings"
          isActive={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />
      </div>

      <div className="vm-content">
        {activeTab === 'overview' && dashboardData && <OverviewTab data={dashboardData} />}
        {activeTab === 'analytics' && dashboardData && <AnalyticsTab data={dashboardData} />}
        {activeTab === 'reviews' && dashboardData && <ReviewsTab data={dashboardData} />}
        {activeTab === 'photos' && dashboardData && <PhotosTab data={dashboardData} />}
        {activeTab === 'offers' && dashboardData && <OffersTab data={dashboardData} />}
        {activeTab === 'settings' && manager && <SettingsTab manager={manager} />}
      </div>
    </div>
  );
};

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick, badge }) => (
  <button
    className={`vm-tab-button ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
    {badge && badge > 0 && <span className="vm-badge">{badge}</span>}
  </button>
);

interface ManagerLoginFormProps {
  venueId: string;
  onLogin: (email: string, password: string) => void;
  onClose: () => void;
}

const ManagerLoginForm: React.FC<ManagerLoginFormProps> = ({ onLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="vm-login-form">
      <div className="vm-login-card">
        <h2>🏢 Venue Manager Login</h2>
        <p>Manage your venue information and analytics</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@venue.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="vm-login-button">
            Login to Manager Portal
          </button>
        </form>

        <div className="vm-login-help">
          <p>Demo: Use any email/password to test</p>
        </div>

        <button onClick={onClose} className="vm-login-close">
          ✕ Close
        </button>
      </div>
    </div>
  );
};

interface OverviewTabProps {
  data: VenueManagerDashboardData;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ data }) => (
  <div className="vm-tab-content">
    <div className="vm-grid">
      <StatCard
        title="This Week Views"
        value={data.analytics.views.toLocaleString()}
        icon="👁️"
        trend="+12%"
      />
      <StatCard
        title="Searches Found Your Venue"
        value={data.analytics.searches.toLocaleString()}
        icon="🔍"
        trend="+8%"
      />
      <StatCard
        title="People Clicked 'Go'"
        value={data.analytics.clicks.toLocaleString()}
        icon="👆"
        trend="+15%"
      />
      <StatCard
        title="Added to Favorites"
        value={data.analytics.favorites.toLocaleString()}
        icon="❤️"
        trend="+5%"
      />
    </div>

    <div className="vm-section">
      <h3>Recent Reviews</h3>
      <div className="vm-reviews-list">
        {data.recentReviews.slice(0, 3).map((review) => (
          <div key={review.id} className="vm-review-item">
            <div className="vm-review-header">
              <span className="vm-rating">{'⭐'.repeat(review.rating)}</span>
              <span className="vm-author">{review.author}</span>
            </div>
            <p className="vm-review-text">{review.comment}</p>
            <span className={`vm-response-status ${review.hasResponse ? 'responded' : 'pending'}`}>
              {review.hasResponse ? '✓ Responded' : '⚠ No response yet'}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface AnalyticsTabProps {
  data: VenueManagerDashboardData;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ data }) => (
  <div className="vm-tab-content">
    <div className="vm-analytics-container">
      <h3>Weekly Traffic Pattern</h3>
      <div className="vm-chart">
        <div className="vm-chart-bars">
          {Object.entries(data.analytics.trafficByHour || {}).map(([hour, count]) => (
            <div key={hour} className="vm-chart-bar">
              <div
                className="vm-bar"
                style={{
                  height: `${(count as number) / 3}%`
                }}
                title={`${hour}:00 - ${count} views`}
              />
              <span className="vm-bar-label">{hour}h</span>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ marginTop: '2rem' }}>Top Search Queries</h3>
      <div className="vm-search-queries">
        {data.analytics.topSearchQueries.map((query, idx) => (
          <div key={idx} className="vm-query-item">
            <span className="vm-query-rank">#{idx + 1}</span>
            <span className="vm-query-text">{query}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface ReviewsTabProps {
  data: VenueManagerDashboardData;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ data }) => (
  <div className="vm-tab-content">
    <div className="vm-reviews-container">
      <h3>Manage Reviews</h3>
      <div className="vm-reviews-summary">
        <div className="vm-summary-item">
          <span className="vm-summary-label">Average Rating</span>
          <span className="vm-summary-value">⭐ {data.venue.rating}</span>
        </div>
        <div className="vm-summary-item">
          <span className="vm-summary-label">Total Reviews</span>
          <span className="vm-summary-value">{data.venue.reviewCount}</span>
        </div>
        <div className="vm-summary-item">
          <span className="vm-summary-label">Needs Response</span>
          <span className="vm-summary-value">
            {data.recentReviews.filter(r => !r.hasResponse).length}
          </span>
        </div>
      </div>

      <div className="vm-reviews-list">
        {data.recentReviews.map((review) => (
          <div key={review.id} className="vm-review-full">
            <div className="vm-review-full-header">
              <div>
                <span className="vm-rating">{'⭐'.repeat(review.rating)}</span>
                <strong>{review.author}</strong>
              </div>
              <span className="vm-review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="vm-review-text">{review.comment}</p>
            {!review.hasResponse && (
              <button className="vm-respond-btn">
                ✉️ Write Response
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface PhotosTabProps {
  data: VenueManagerDashboardData;
}

const PhotosTab: React.FC<PhotosTabProps> = ({ data }) => (
  <div className="vm-tab-content">
    <div className="vm-photos-container">
      <div className="vm-photos-header">
        <h3>Manage Photos</h3>
        <button className="vm-upload-btn">📤 Upload New Photo</button>
      </div>

      <div className="vm-photos-grid">
        {data.photos.map((photo) => (
          <div key={photo.id} className="vm-photo-card">
            <img src={photo.url} alt={photo.caption} />
            <div className="vm-photo-info">
              <p className="vm-photo-caption">{photo.caption}</p>
              <span className="vm-photo-category">{photo.category}</span>
              {!photo.isApproved && (
                <span className="vm-photo-pending">⏳ Pending Approval</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface OffersTabProps {
  data: VenueManagerDashboardData;
}

const OffersTab: React.FC<OffersTabProps> = ({ data }) => (
  <div className="vm-tab-content">
    <div className="vm-offers-container">
      <div className="vm-offers-header">
        <h3>Manage Special Offers</h3>
        <button className="vm-add-offer-btn">➕ Create New Offer</button>
      </div>

      <div className="vm-offers-list">
        {data.offers.map((offer) => (
          <div key={offer.id} className="vm-offer-card">
            <div className="vm-offer-header">
              <h4>{offer.title}</h4>
              <span className="vm-offer-discount">
                {offer.discountPercentage ? `${offer.discountPercentage}% off` : 'Special'}
              </span>
            </div>
            <p className="vm-offer-description">{offer.description}</p>
            <div className="vm-offer-stats">
              <span>Uses: {offer.usedCount}/{offer.maxUses || '∞'}</span>
              <span>
                Valid until {new Date(offer.validUntil).toLocaleDateString()}
              </span>
            </div>
            <div className="vm-offer-actions">
              <button className="vm-edit-offer">Edit</button>
              <button className="vm-delete-offer">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface SettingsTabProps {
  manager: VenueManager;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ manager }) => (
  <div className="vm-tab-content">
    <div className="vm-settings-container">
      <h3>Account Settings</h3>

      <div className="vm-settings-section">
        <h4>Manager Information</h4>
        <div className="vm-setting-item">
          <label>Name</label>
          <p>{manager.name}</p>
        </div>
        <div className="vm-setting-item">
          <label>Email</label>
          <div className="vm-setting-with-icon">
            <Mail size={16} />
            <p>{manager.email}</p>
          </div>
        </div>
        <div className="vm-setting-item">
          <label>Phone</label>
          <div className="vm-setting-with-icon">
            <Phone size={16} />
            <p>{manager.phoneNumber}</p>
          </div>
        </div>
      </div>

      <div className="vm-settings-section">
        <h4>Permissions</h4>
        <div className="vm-permissions-list">
          {manager.permissions.map((perm) => (
            <div key={perm} className="vm-permission">
              <input type="checkbox" checked disabled />
              <label>{perm.replace(/_/g, ' ')}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="vm-settings-section">
        <h4>Account Status</h4>
        <div className="vm-status-info">
          <span className={`vm-status-badge ${manager.verificationStatus}`}>
            {manager.verificationStatus === 'verified' ? '✓ Verified' : 'Pending Verification'}
          </span>
          <p>Account created: {new Date(manager.claimedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  </div>
);

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => (
  <div className="vm-stat-card">
    <div className="vm-stat-icon">{icon}</div>
    <div className="vm-stat-info">
      <p className="vm-stat-title">{title}</p>
      <p className="vm-stat-value">{value}</p>
      <p className="vm-stat-trend">{trend}</p>
    </div>
  </div>
);
