/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClimbingSession, ClimbingStats, RouteLog } from './types';
import { BOULDERING_GRADES_V, getGradeIndex } from './data';
import { collection, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';
import { getLocations } from './firebase-utils';

// Computes aggregations over all climbing sessions
export function computeStats(sessions: ClimbingSession[], gradeSystem: string[] = BOULDERING_GRADES_V): ClimbingStats {
  let totalSessions = sessions.length;
  let totalAttempts = 0;
  let totalSends = 0;
  let totalFlashes = 0;
  let maxGradeIdx = -1;
  let maxGrade = 'N/A';

  sessions.forEach(session => {
    session.routes.forEach(route => {
      totalAttempts += route.attempts;
      totalSends += route.sends;
      totalFlashes += route.flashes;

      if (route.sends > 0) {
        const idx = getGradeIndex(route.grade, gradeSystem);
        if (idx > maxGradeIdx) {
          maxGradeIdx = idx;
          maxGrade = route.grade;
        }
      }
    });
  });

  const totalRoutes = sessions.reduce((sum, s) => sum + s.routes.length, 0);
  const flashRate = totalRoutes > 0 ? (totalFlashes / totalRoutes) * 100 : 0;
  const successRate = totalAttempts > 0 ? (totalSends / totalAttempts) * 100 : 0;

  return {
    totalSessions,
    totalAttempts,
    totalSends,
    totalFlashes,
    maxGrade,
    flashRate: Math.round(flashRate * 10) / 10,
    successRate: Math.round(successRate * 10) / 10,
  };
}

// Generates lists for grade distribution visualizers
export function getGradeBreakdown(sessions: ClimbingSession[], gradeSystem: string[] = BOULDERING_GRADES_V) {
  const counts: Record<string, { attempts: number; sends: number; flashes: number }> = {};

  gradeSystem.forEach(g => {
    counts[g] = { attempts: 0, sends: 0, flashes: 0 };
  });

  sessions.forEach(s => {
    s.routes.forEach(r => {
      const g = r.grade;
      if (!counts[g]) {
        counts[g] = { attempts: 0, sends: 0, flashes: 0 };
      }
      counts[g].attempts += r.attempts;
      counts[g].sends += r.sends;
      counts[g].flashes += r.flashes;
    });
  });

  return gradeSystem
    .map(grade => ({
      grade,
      attempts: counts[grade]?.attempts || 0,
      sends: counts[grade]?.sends || 0,
      flashes: counts[grade]?.flashes || 0,
    }))
    .filter(item => item.attempts > 0 || item.sends > 0); // show only used grades
}

// Hold type distribution for statistics bento
export function getHoldTypeBreakdown(sessions: ClimbingSession[]): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  sessions.forEach(s => {
    s.routes.forEach(r => {
      r.holdsType.forEach(hold => {
        counts[hold] = (counts[hold] || 0) + (r.sends > 0 ? r.sends : r.attempts ? 1 : 0);
      });
    });
  });

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Route type/style distribution for statistics bento
export function getRouteTypeBreakdown(sessions: ClimbingSession[]): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  sessions.forEach(s => {
    s.routes.forEach(r => {
      r.routeType.forEach(type => {
        counts[type] = (counts[type] || 0) + (r.sends > 0 ? r.sends : r.attempts ? 1 : 0);
      });
    });
  });

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Export logbook as CSV format
export function exportLogToCSV(sessions: ClimbingSession[]): string {
  const headers = [
    'Session Date',
    'Location Name',
    'Location Type',
    'Grade',
    'Color',
    'Wall Location',
    'Holds Type',
    'Route Style',
    'Attempts',
    'Sends',
    'Flashes',
    'Route Favorite',
    'Session Notes',
    'Hand Placements',
    'Foot Placements',
  ];

  const rows: string[][] = [];

  sessions.forEach(session => {
    session.routes.forEach(route => {
      rows.push([
        `"${session.date}"`,
        `"${session.locationName.replace(/"/g, '""')}"`,
        `"${session.locationType}"`,
        `"${route.grade}"`,
        `"${route.color}"`,
        `"${route.wallLocation.replace(/"/g, '""')}"`,
        `"${route.holdsType.join(', ')}"`,
        `"${route.routeType.join(', ')}"`,
        `"${route.attempts.toString()}"`,
        `"${route.sends.toString()}"`,
        `"${route.flashes.toString()}"`,
        `"${route.isFavorite ? 'Yes' : 'No'}"`,
        `"${session.notes ? session.notes.replace(/\n/g, ' ').replace(/"/g, '""') : ''}"`,
        `"${route.handPlacements.join(', ')}"`,
        `"${route.footPlacements.join(', ')}"`
      ]);
    });
  });

  const csvContent = [
    headers.join('|'),
    ...rows.map(row => row.join('|'))
  ].join('\n');

  return csvContent;
}

// Utility to download a file in browser
export function downloadCSVFile(csvContent: string, fileName = 'bouldering_logbook.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Resize and compress files (photos) for faster performance
export function processPhotoUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // compress with 0.8 quality
        } else {
          resolve(event.target?.result as string); // fallback to raw base64
        }
      };
      img.onerror = () => reject(new Error('Failed to load image structure.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

function stripQuotes(input: any) {
  return typeof input === 'string' ? input.replace(/^"|"$/g, '') : input;
}

export function parseCSV(csvContent: string) {
  const rows = csvContent?.split('\n').map(row => row.split('|'));
  const locations = extractLocation(rows);
  const routes = rows.slice(1).map(row => {
    const location = locations[row[1]];

    return {
      date: stripQuotes(row[0]),
      locationId: stripQuotes(location.id),
      locationName: stripQuotes(location.name),
      locationType: stripQuotes(location.type),
      grade: stripQuotes(row[3]),
      color: stripQuotes(row[4]),
      wallLocation: stripQuotes(row[5]),
      holdsType: stripQuotes(row[6]).split(','),
      routeType: stripQuotes(row[7]).split(','),
      attempts: parseInt(stripQuotes(row[8])) || 0,
      sends: parseInt(stripQuotes(row[9])) || 0,
      flashes: parseInt(stripQuotes(row[10])) || 0,
      isFavorite: stripQuotes(row[11]) === 'Yes',
      notes: stripQuotes(row[12] || ""),
    }
  });

  const routesByDate = Object.groupBy(routes, (route) => route.date);
  const sessions = extractSession(routesByDate);
  return sessions;
}


function extractLocation(rows) {
  let locations = {};
  rows.slice(1).forEach(row => {
    const locationName = row[1];

    if (!locations[locationName]) {
      locations[locationName] = {
        id: "loc-" + crypto.randomUUID(),
        name: locationName,
        type: row[2],
      }
    }
  });
  return locations;
}

function extractSession(routes) {
  const sessions = Object.values(routes);

  return sessions.map((routeData: any) => {
    const sessionData = routeData[0];

    return {
      id: "sess-" + crypto.randomUUID(),
      date: sessionData.date,
      climbsCount: routeData.length,
      locationId: sessionData.locationId,
      locationName: sessionData.locationName,
      locationType: sessionData.locationType,
      notes: sessionData.notes,
      routes: routeData.map(route => {
        return {
          id: crypto.randomUUID(),
          grade: route.grade,
          color: route.color,
          wallLocation: route.wallLocation,
          holdsType: route.holdsType,
          routeType: route.routeType,
          attempts: route.attempts,
          sends: route.sends,
          flashes: route.flashes,
          isFavorite: route.isFavorite,
        } as RouteLog
      })
    } as ClimbingSession
  });

}
