import { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, DollarSign, TrendingUp, Share2, Download, X } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import {
  optimizeMultiVenueTrip,
  encodeTrip,
  type OptimizedTrip,
} from '../utils/multiVenueOptimizer';
import type { Location } from '../types';
import styles from './MultiVenueOptimizer.module.css';

interface MultiVenueOptimizerProps {
  selectedLocations: Location[];
  onClose: () => void;
  familySize?: number;
  childAges?: number[];
}

export function MultiVenueOptimizer({
  selectedLocations,
  onClose,
  familySize = 1,
  childAges = [],
}: MultiVenueOptimizerProps) {
  const { language } = useTranslation();
  const [optimizedTrip, setOptimizedTrip] = useState<OptimizedTrip | null>(null);
  const [expandedStop, setExpandedStop] = useState<number | null>(null);
  const [showShared, setShowShared] = useState(false);

  // Use ref to avoid infinite loop from childAges default [] creating new reference each render
  const childAgesRef = useRef(childAges);
  childAgesRef.current = childAges;
  const childAgesKey = JSON.stringify(childAges);

  useEffect(() => {
    if (selectedLocations.length > 0) {
      const trip = optimizeMultiVenueTrip(
        selectedLocations,
        new Date(),
        familySize,
        childAgesRef.current
      );
      setOptimizedTrip(trip);
    }
     
  }, [selectedLocations, familySize, childAgesKey]);

  const handleShare = () => {
    if (!optimizedTrip) return;
    const encoded = encodeTrip(optimizedTrip);
    const url = `${window.location.origin}?trip=${encoded}`;
    setShowShared(true);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  const handleExportCalendar = () => {
    if (!optimizedTrip) return;

    let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FamMap//Multi-Venue Trip//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Multi-Venue Trip
X-WR-TIMEZONE:Asia/Taipei
X-WR-CALDESC:Multi-venue family trip optimized itinerary`;

    optimizedTrip.stops.forEach((stop) => {
      const startTime = stop.arrivalTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endTime = stop.departureTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const title = language === 'zh' ? stop.location.name.zh : stop.location.name.en;
      const location = language === 'zh' ? stop.location.address.zh : stop.location.address.en;

      icalContent += `
BEGIN:VEVENT
UID:fammap-${stop.location.id}-${stop.order}@fammap.io
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${title}
DESCRIPTION:Visit duration: ${stop.visitDuration} minutes
LOCATION:${location}
CATEGORIES:VENUE,FAMILY
END:VEVENT`;
    });

    icalContent += '\nEND:VCALENDAR';

    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'multi-venue-trip.ics';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!optimizedTrip) return;

    let csvContent = 'Order,Venue,Category,Address,Arrival,Departure,Duration (min),Travel Time (min)\n';

    let travelTime = 0;
    optimizedTrip.stops.forEach((stop, index) => {
      if (index > 0) {
        const prevDeparture = optimizedTrip.stops[index - 1].departureTime.getTime();
        travelTime = Math.round((stop.arrivalTime.getTime() - prevDeparture) / 60000);
      }

      const name = language === 'zh' ? stop.location.name.zh : stop.location.name.en;
      const address = language === 'zh' ? stop.location.address.zh : stop.location.address.en;
      const arrival = stop.arrivalTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const departure = stop.departureTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      csvContent += `${stop.order},"${name}","${stop.location.category}","${address}","${arrival}","${departure}",${stop.visitDuration},${travelTime}\n`;
    });

    csvContent += `\nSummary
Total Travel Time (min),${optimizedTrip.totalTravelTime}
Total Visit Time (min),${optimizedTrip.totalVisitTime}
Total Time (min),${optimizedTrip.totalTime}
Total Distance (km),${optimizedTrip.totalDistance.toFixed(2)}
Estimated Cost ($),${optimizedTrip.estimatedCost}
Route Efficiency (%),${optimizedTrip.routeEfficiency}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'multi-venue-trip.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!optimizedTrip || selectedLocations.length === 0) {
    return (
      <div className={`${styles.multiVenueOptimizer} ${styles.empty}`}>
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={20} />
        </button>
        <p>Select multiple venues to optimize route</p>
      </div>
    );
  }

  const hours = Math.floor(optimizedTrip.totalTime / 60);
  const minutes = optimizedTrip.totalTime % 60;

  return (
    <div className={styles.multiVenueOptimizer}>
      <div className={styles.header}>
        <h3>Multi-Venue Trip Optimizer</h3>
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={20} />
        </button>
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <Clock size={20} />
          <div>
            <p className={styles.label}>Total Time</p>
            <p className={styles.value}>
              {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <MapPin size={20} />
          <div>
            <p className={styles.label}>Distance</p>
            <p className={styles.value}>{optimizedTrip.totalDistance.toFixed(1)} km</p>
          </div>
        </div>

        <div className={styles.card}>
          <DollarSign size={20} />
          <div>
            <p className={styles.label}>Est. Cost</p>
            <p className={styles.value}>${optimizedTrip.estimatedCost}</p>
          </div>
        </div>

        <div className={styles.card}>
          <TrendingUp size={20} />
          <div>
            <p className={styles.label}>Route Efficiency</p>
            <p className={styles.value}>{optimizedTrip.routeEfficiency}%</p>
          </div>
        </div>
      </div>

      <div className={styles.itinerary}>
        <h4>Optimized Itinerary</h4>
        <div className={styles.stopsList}>
          {optimizedTrip.stops.map((stop, index) => (
            <div key={index} className={styles.stop}>
              <div
                className={styles.stopHeader}
                onClick={() =>
                  setExpandedStop(expandedStop === index ? null : index)
                }
              >
                <div className={styles.stopNumber}>{stop.order}</div>
                <div className={styles.stopInfo}>
                  <p className={styles.stopName}>
                    {language === 'zh' ? stop.location.name.zh : stop.location.name.en}
                  </p>
                  <p className={styles.stopTime}>
                    {stop.arrivalTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} - {stop.departureTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} ({stop.visitDuration} min)
                  </p>
                </div>
              </div>

              {expandedStop === index && (
                <div className={styles.stopDetails}>
                  <p>
                    <strong>Category:</strong> {stop.location.category}
                  </p>
                  <p>
                    <strong>Address:</strong>{' '}
                    {language === 'zh'
                      ? stop.location.address.zh
                      : stop.location.address.en}
                  </p>
                  <p>
                    <strong>Rating:</strong> {stop.location.averageRating} ⭐
                  </p>
                  {index < optimizedTrip.stops.length - 1 && (
                    <p className={styles.travelTime}>
                      Travel time to next: {Math.round(
                        (optimizedTrip.stops[index + 1].arrivalTime.getTime() -
                          stop.departureTime.getTime()) /
                          60000
                      )}{' '}
                      min
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.recommendations}>
        <h4>Recommendations</h4>
        <ul>
          {optimizedTrip.recommendations.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        <button onClick={handleShare} className={`${styles.btn} ${styles.btnSecondary}`}>
          <Share2 size={18} />
          Share Trip
        </button>
        <button onClick={handleExportCalendar} className={`${styles.btn} ${styles.btnSecondary}`}>
          <Download size={18} />
          Export Calendar
        </button>
        <button onClick={handleExportCSV} className={`${styles.btn} ${styles.btnSecondary}`}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {showShared && (
        <div className={styles.shareNotification}>
          <p>Trip URL copied to clipboard!</p>
          <button onClick={() => setShowShared(false)}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
