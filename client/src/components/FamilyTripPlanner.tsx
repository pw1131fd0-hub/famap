import { useState, useEffect } from 'react';
import {
  Users, Plus, Trash2, DollarSign, Download, X, ChevronDown, Calendar
} from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { TripExportPanel } from './TripExportPanel';
import type { Location } from '../types';
import '../styles/FamilyTripPlanner.css';

interface FamilyMember {
  id: string;
  name: string;
  role: 'planner' | 'member';
  avatar?: string;
}

interface TripVote {
  memberId: string;
  locationId: string;
  vote: 'yes' | 'maybe' | 'no';
  comment?: string;
}

interface FamilyTrip {
  id: string;
  name: string;
  date: string;
  budget: number;
  totalSpent: number;
  members: FamilyMember[];
  suggestedLocations: Location[];
  finalLocations: Location[];
  notes: string;
  votes: TripVote[];
  status: 'planning' | 'confirmed' | 'completed';
  createdAt: string;
  createdBy: string;
}

interface Props {
  darkMode: boolean;
}

export function FamilyTripPlanner({ darkMode }: Props) {
  const { language } = useTranslation();
  const [trips, setTrips] = useState<FamilyTrip[]>([]);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<FamilyTrip | null>(null);
  const [exportTrip, setExportTrip] = useState<FamilyTrip | null>(null);
  const [currentUser] = useState({ id: 'u1', name: 'Parent' });
  const [tripForm, setTripForm] = useState({
    name: '',
    date: '',
    budget: 1000,
    notes: ''
  });

  // Load trips from localStorage
  useEffect(() => {
    const savedTrips = localStorage.getItem('familyTrips');
    if (savedTrips) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrips(JSON.parse(savedTrips));
    }
  }, []);

  // Save trips to localStorage
  useEffect(() => {
    localStorage.setItem('familyTrips', JSON.stringify(trips));
  }, [trips]);

  const createTrip = () => {
    if (!tripForm.name || !tripForm.date) return;

    const newTrip: FamilyTrip = {
      id: `trip_${Date.now()}`,
      name: tripForm.name,
      date: tripForm.date,
      budget: tripForm.budget,
      totalSpent: 0,
      members: [
        { id: currentUser.id, name: currentUser.name, role: 'planner' }
      ],
      suggestedLocations: [],
      finalLocations: [],
      notes: tripForm.notes,
      votes: [],
      status: 'planning',
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id
    };

    setTrips([...trips, newTrip]);
    setTripForm({ name: '', date: '', budget: 1000, notes: '' });
    setShowCreateTrip(false);
    setSelectedTrip(newTrip);
  };

  const deleteTrip = (tripId: string) => {
    setTrips(trips.filter(t => t.id !== tripId));
    if (selectedTrip?.id === tripId) {
      setSelectedTrip(null);
    }
  };

  // Future feature: Add members to collaborative planning
  // const addMember = (tripId: string, memberName: string) => {
  //   setTrips(trips.map(trip => {
  //     if (trip.id === tripId) {
  //       const newMember: FamilyMember = {
  //         id: `member_${Date.now()}`,
  //         name: memberName,
  //         role: 'member'
  //       };
  //       const updatedTrip = {
  //         ...trip,
  //         members: [...trip.members, newMember]
  //       };
  //       if (selectedTrip?.id === tripId) {
  //         setSelectedTrip(updatedTrip);
  //       }
  //       return updatedTrip;
  //     }
  //     return trip;
  //   }));
  // };

  const updateTripStatus = (tripId: string, status: FamilyTrip['status']) => {
    setTrips(trips.map(trip => {
      if (trip.id === tripId) {
        const updatedTrip = { ...trip, status };
        if (selectedTrip?.id === tripId) {
          setSelectedTrip(updatedTrip);
        }
        return updatedTrip;
      }
      return trip;
    }));
  };

  // Future feature: Vote on locations for collaborative planning
  // const addLocationVote = (
  //   tripId: string,
  //   location: Location,
  //   memberId: string,
  //   vote: 'yes' | 'maybe' | 'no'
  // ) => { ... };

  // Future feature: Calculate voting statistics for location proposals
  // const getVoteStats = (trip: FamilyTrip, location: Location) => { ... };

  const handleExportTrip = (trip: FamilyTrip) => {
    setExportTrip(trip);
  };

  const handleCloseExport = () => {
    setExportTrip(null);
  };

  return (
    <div className={`family-trip-planner ${darkMode ? 'dark-mode' : ''}`}>
      <div className="ftp-header">
        <div className="ftp-title">
          <Users size={24} />
          <h2>
            {language === 'zh' ? '家庭出遊規劃' : 'Family Trip Planner'}
          </h2>
        </div>
        <button
          className="ftp-btn-primary"
          onClick={() => setShowCreateTrip(true)}
        >
          <Plus size={18} />
          {language === 'zh' ? '建立出遊' : 'New Trip'}
        </button>
      </div>

      {showCreateTrip && (
        <div className="ftp-modal-overlay">
          <div className="ftp-modal">
            <div className="ftp-modal-header">
              <h3>{language === 'zh' ? '建立新出遊計畫' : 'Create New Trip'}</h3>
              <button
                className="ftp-btn-close"
                onClick={() => setShowCreateTrip(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="ftp-form">
              <input
                type="text"
                placeholder={language === 'zh' ? '出遊名稱' : 'Trip Name'}
                value={tripForm.name}
                onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
              />
              <input
                type="date"
                value={tripForm.date}
                onChange={(e) => setTripForm({ ...tripForm, date: e.target.value })}
              />
              <div className="ftp-budget-input">
                <label>{language === 'zh' ? '預算' : 'Budget'}</label>
                <input
                  type="number"
                  value={tripForm.budget}
                  onChange={(e) => setTripForm({ ...tripForm, budget: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <textarea
                placeholder={language === 'zh' ? '備註' : 'Notes'}
                value={tripForm.notes}
                onChange={(e) => setTripForm({ ...tripForm, notes: e.target.value })}
                rows={3}
              />
              <button
                className="ftp-btn-primary"
                onClick={createTrip}
              >
                {language === 'zh' ? '建立' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ftp-trips-list">
        {trips.length === 0 ? (
          <div className="ftp-empty-state">
            <Calendar size={48} />
            <p>{language === 'zh' ? '還沒有出遊計畫' : 'No trips planned yet'}</p>
          </div>
        ) : (
          trips.map(trip => (
            <div key={trip.id} className={`ftp-trip-card ${trip.status}`}>
              <div className="ftp-trip-header">
                <div className="ftp-trip-info">
                  <h3>{trip.name}</h3>
                  <div className="ftp-trip-meta">
                    <span className="ftp-date">
                      <Calendar size={14} />
                      {new Date(trip.date).toLocaleDateString(
                        language === 'zh' ? 'zh-TW' : 'en-US'
                      )}
                    </span>
                    <span className="ftp-budget">
                      <DollarSign size={14} />
                      ${trip.budget}
                    </span>
                    <span className={`ftp-status ${trip.status}`}>
                      {language === 'zh'
                        ? trip.status === 'planning'
                          ? '規劃中'
                          : trip.status === 'confirmed'
                            ? '已確認'
                            : '已完成'
                        : trip.status}
                    </span>
                  </div>
                </div>
                <div className="ftp-trip-actions">
                  <button
                    className="ftp-btn-icon"
                    onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}
                  >
                    <ChevronDown size={20} />
                  </button>
                  <button
                    className="ftp-btn-icon"
                    onClick={() => handleExportTrip(trip)}
                    title={language === 'zh' ? '匯出計畫' : 'Export'}
                  >
                    <Download size={20} />
                  </button>
                  <button
                    className="ftp-btn-icon danger"
                    onClick={() => deleteTrip(trip.id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {selectedTrip?.id === trip.id && (
                <div className="ftp-trip-details">
                  <div className="ftp-section">
                    <h4>{language === 'zh' ? '家庭成員' : 'Family Members'}</h4>
                    <div className="ftp-members">
                      {trip.members.map(member => (
                        <div key={member.id} className="ftp-member">
                          <div className="ftp-member-avatar">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ftp-member-info">
                            <div>{member.name}</div>
                            <small>{member.role === 'planner' ? '規劃者' : '成員'}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ftp-section">
                    <h4>{language === 'zh' ? '狀態' : 'Status'}</h4>
                    <div className="ftp-status-buttons">
                      {(['planning', 'confirmed', 'completed'] as const).map(status => (
                        <button
                          key={status}
                          className={`ftp-status-btn ${trip.status === status ? 'active' : ''}`}
                          onClick={() => updateTripStatus(trip.id, status)}
                        >
                          {status === 'planning'
                            ? language === 'zh'
                              ? '規劃中'
                              : 'Planning'
                            : status === 'confirmed'
                              ? language === 'zh'
                                ? '已確認'
                                : 'Confirmed'
                              : language === 'zh'
                                ? '已完成'
                                : 'Completed'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {trip.notes && (
                    <div className="ftp-section">
                      <h4>{language === 'zh' ? '備註' : 'Notes'}</h4>
                      <p className="ftp-notes">{trip.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {exportTrip && (
        <div className="ftp-modal-overlay">
          <TripExportPanel
            trip={exportTrip}
            onClose={handleCloseExport}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
}

export default FamilyTripPlanner;
