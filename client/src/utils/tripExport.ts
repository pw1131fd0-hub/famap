import type { Location } from '../types';

export interface TripData {
  id: string;
  name: string;
  date: string;
  budget: number;
  totalSpent: number;
  members: Array<{
    id: string;
    name: string;
    role: 'planner' | 'member';
  }>;
  suggestedLocations: Location[];
  finalLocations: Location[];
  notes: string;
  status: 'planning' | 'confirmed' | 'completed';
  createdAt: string;
}

/**
 * Generate iCalendar format for trip
 */
export function generateICalendar(trip: TripData): string {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const tripDate = new Date(trip.date);
  const nextDay = new Date(tripDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const locations = trip.finalLocations.length > 0 ? trip.finalLocations : trip.suggestedLocations;
  const locationList = locations
    .slice(0, 5)
    .map(loc => `- ${loc.name}`)
    .join('\\n');

  const description = `Family Trip: ${trip.name}\\nBudget: NT$${trip.budget}\\nMembers: ${trip.members.map(m => m.name).join(', ')}\\nLocations:\\n${locationList}\\n\\nNotes: ${trip.notes}`;

  const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FamMap//Family Trip Planner//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${trip.id}@fammap.local
DTSTAMP:${formatDate(trip.createdAt)}
DTSTART:${trip.date.replace(/-/g, '')}
DTEND:${nextDay.toISOString().split('T')[0].replace(/-/g, '')}
SUMMARY:${trip.name}
DESCRIPTION:${description}
LOCATION:${locations.slice(0, 2).map(l => l.address || l.name).join(' / ')}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  return ical;
}

/**
 * Download iCalendar file
 */
export function downloadICalendar(trip: TripData): void {
  const ical = generateICalendar(trip);
  const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${trip.name.replace(/\s+/g, '_')}_${trip.date}.ics`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Generate shareable trip summary as JSON
 */
export function generateTripShareData(trip: TripData): string {
  const shareData = {
    type: 'fammap-trip-share-v1',
    trip: {
      name: trip.name,
      date: trip.date,
      budget: trip.budget,
      members: trip.members,
      locations: (trip.finalLocations.length > 0 ? trip.finalLocations : trip.suggestedLocations).slice(0, 10),
      notes: trip.notes
    }
  };

  return btoa(JSON.stringify(shareData));
}

/**
 * Parse shared trip data
 */
export function parseShareData(encodedData: string): TripData | null {
  try {
    const data = JSON.parse(atob(encodedData));
    if (data.type === 'fammap-trip-share-v1') {
      return {
        id: `imported_${Date.now()}`,
        name: data.trip.name,
        date: data.trip.date,
        budget: data.trip.budget,
        totalSpent: 0,
        members: data.trip.members,
        suggestedLocations: [],
        finalLocations: data.trip.locations,
        notes: data.trip.notes,
        status: 'planning',
        createdAt: new Date().toISOString()
      };
    }
  } catch (_e) {
    // Invalid share data
  }
  return null;
}

/**
 * Generate HTML for trip printout
 */
export function generateTripHTML(trip: TripData, language: 'zh' | 'en'): string {
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      tripName: { zh: '旅行名稱', en: 'Trip Name' },
      date: { zh: '日期', en: 'Date' },
      budget: { zh: '預算', en: 'Budget' },
      spent: { zh: '已花費', en: 'Spent' },
      members: { zh: '成員', en: 'Members' },
      locations: { zh: '地點', en: 'Locations' },
      notes: { zh: '備註', en: 'Notes' },
      address: { zh: '地址', en: 'Address' },
      category: { zh: '類別', en: 'Category' },
      finalLocations: { zh: '已確認地點', en: 'Confirmed Locations' },
      suggestedLocations: { zh: '建議地點', en: 'Suggested Locations' }
    };
    return translations[key]?.[language] || key;
  };

  const locations = trip.finalLocations.length > 0 ? trip.finalLocations : trip.suggestedLocations;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${trip.name}</title>
      <style>
        body { font-family: 'Noto Sans TC', Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #A7C7E7; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin: 20px 0; }
        .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .info-row { display: flex; margin: 8px 0; }
        .info-label { width: 100px; font-weight: bold; color: #666; }
        .info-value { flex: 1; }
        .location-item { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .budget { color: #FF6F61; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #A7C7E7; color: white; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${t('tripName')}: ${trip.name}</h1>
        <p>${t('date')}: ${new Date(trip.date).toLocaleDateString()}</p>
      </div>

      <div class="section">
        <div class="section-title">${t('notes') || 'Information'}</div>
        <div class="info-row">
          <div class="info-label">${t('budget')}</div>
          <div class="info-value budget">NT$${trip.budget}</div>
        </div>
        <div class="info-row">
          <div class="info-label">${t('spent')}</div>
          <div class="info-value">NT$${trip.totalSpent}</div>
        </div>
        <div class="info-row">
          <div class="info-label">${t('members')}</div>
          <div class="info-value">${trip.members.map(m => m.name).join(', ')}</div>
        </div>
      </div>

      ${trip.notes ? `
        <div class="section">
          <div class="section-title">${t('notes')}</div>
          <p>${trip.notes}</p>
        </div>
      ` : ''}

      <div class="section">
        <div class="section-title">${locations === trip.finalLocations ? t('finalLocations') : t('suggestedLocations')}</div>
        ${locations.slice(0, 10).map(loc => `
          <div class="location-item">
            <h3>${loc.name}</h3>
            ${loc.category ? `<p><strong>${t('category')}</strong>: ${loc.category}</p>` : ''}
            ${loc.address ? `<p><strong>${t('address')}</strong>: ${loc.address}</p>` : ''}
          </div>
        `).join('')}
      </div>

      <p style="font-size: 12px; color: #999; margin-top: 40px;">Generated by FamMap Family Trip Planner - ${new Date().toLocaleDateString()}</p>
    </body>
    </html>
  `;
}

/**
 * Download trip as HTML (printable)
 */
export function downloadTripHTML(trip: TripData, language: 'zh' | 'en' = 'en'): void {
  const html = generateTripHTML(trip, language);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${trip.name.replace(/\s+/g, '_')}_${trip.date}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Generate CSV export
 */
export function generateTripCSV(trip: TripData, language: 'zh' | 'en' = 'en'): string {
  const headers = language === 'zh'
    ? ['旅行名稱', '日期', '預算', '已花費', '成員', '備註', '地點名稱', '地址', '類別']
    : ['Trip Name', 'Date', 'Budget', 'Spent', 'Members', 'Notes', 'Location', 'Address', 'Category'];

  const locations = trip.finalLocations.length > 0 ? trip.finalLocations : trip.suggestedLocations;
  const members = trip.members.map(m => m.name).join('; ');

  const rows = [headers];

  if (locations.length === 0) {
    rows.push([trip.name, trip.date, trip.budget.toString(), trip.totalSpent.toString(), members, trip.notes, '', '', '']);
  } else {
    locations.forEach((loc, idx) => {
      rows.push([
        idx === 0 ? trip.name : '',
        idx === 0 ? trip.date : '',
        idx === 0 ? trip.budget.toString() : '',
        idx === 0 ? trip.totalSpent.toString() : '',
        idx === 0 ? members : '',
        idx === 0 ? trip.notes : '',
        loc.name,
        loc.address || '',
        loc.category || ''
      ]);
    });
  }

  return rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
}

/**
 * Download trip as CSV
 */
export function downloadTripCSV(trip: TripData, language: 'zh' | 'en' = 'en'): void {
  const csv = generateTripCSV(trip, language);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${trip.name.replace(/\s+/g, '_')}_${trip.date}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Generate shareable URL (to be used with backend)
 */
export function generateShareLink(trip: TripData): string {
  const shareData = generateTripShareData(trip);
  const baseUrl = window.location.origin;
  return `${baseUrl}?sharedTrip=${shareData}`;
}
