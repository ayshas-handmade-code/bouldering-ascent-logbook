/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Location, ClimbingSession } from './types';

export const INITIAL_LOCATIONS: Location[] = [
  { id: 'loc-1', name: 'Peak Performance Climbing Gym', type: 'gym', isFavorite: true, city: 'Seattle', wallLocations: ['Slab', 'Overhang', 'Cave', 'Main Overhang', 'The Cave', 'Comp Wall'] },
  { id: 'loc-2', name: 'The Stone Summit', type: 'gym', isFavorite: true, city: 'Atlanta', wallLocations: ['Slab', 'Overhang', 'Cave', 'The Slab', 'The Wave'] },
  { id: 'loc-3', name: 'Ironworks Bouldering Co.', type: 'gym', isFavorite: false, city: 'Berkeley', wallLocations: ['Slab', 'Overhang', 'Cave'] },
  { id: 'loc-4', name: 'Yosemite Camp 4 Boulders', type: 'outdoor', isFavorite: true, city: 'Yosemite' },
  { id: 'loc-5', name: 'The Sinks Crag (The Meadow)', type: 'outdoor', isFavorite: false, city: 'Lander' },
  { id: 'loc-6', name: 'Bishop - Buttermilks', type: 'outdoor', isFavorite: true, city: 'Bishop' },
];

export const BOULDERING_GRADES_V = [
  'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14'
];

export const BOULDERING_GRADES_FONT = [
  '4', '5A', '5B', '5C', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A', '8A+'
];

export const HOLD_TYPES = [
  'Jugs', 'Crimps', 'Slopers', 'Pinches', 'Pockets', 'Volumes', 'Underclings', 'Mantle'
];

export const ROUTE_TYPES = [
  'Overhang', 'Vertical', 'Slab', 'Roof', 'Arete', 'Chimney', 'Compression', 'Traverse', 'Dyno'
];

export const HAND_PLACEMENT = [
  'match', 'cross-through', 'palming', 'bump', ' gaston'
]

export const FOOT_PLACEMENT = [
  'smear', 'heel hook', 'toe hook', 'flag', 'edging', 'drop-knee', 'match',
  'back-stepping', 'back-flag', 'step-through'
]

export const CLIMB_COLORS = [
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Black', hex: '#18181b' },
  { name: 'White', hex: '#fafafa' },
  { name: 'Grey', hex: '#71717a' },
];

export const WALL_LOCATIONS = [
  'Slab Wall', 'Cave', 'Overhang', 'Topout Pillar', 'Wave', 'Roof'
];

// Helper to compare bouldering grades for math/scales
export function getGradeIndex(grade: string, list: string[] = BOULDERING_GRADES_V): number {
  return list.indexOf(grade);
}

export function generateSampleSessions(): ClimbingSession[] {
  // Let's seed 3 sample sessions spread across the past few weeks
  const today = new Date();
  const date1 = new Date(today);
  date1.setDate(today.getDate() - 2);
  const date2 = new Date(today);
  date2.setDate(today.getDate() - 6);
  const date3 = new Date(today);
  date3.setDate(today.getDate() - 12);

  return [
    {
      id: 'sess-1',
      date: date1.toISOString().split('T')[0],
      locationId: 'loc-1',
      locationName: 'Peak Performance Climbing Gym',
      locationType: 'gym',
      notes: 'Had an awesome session today! Projecting V4s. Finally sent the Blue Overhang route on my third attempt! Crimpy slopers felt sticky.',
      routes: [
        {
          id: 'route-1-1',
          grade: 'V3',
          color: 'Red',
          wallLocation: 'Main Overhang',
          holdsType: ['Jugs', 'Volumes'],
          routeType: ['Overhang', 'Dyno'],
          attempts: 1,
          sends: 1,
          flashes: 1,
          isFavorite: true,
        },
        {
          id: 'route-1-2',
          grade: 'V4',
          color: 'Blue',
          wallLocation: 'Main Overhang',
          holdsType: ['Crimps', 'Slopers'],
          routeType: ['Overhang', 'Compression'],
          attempts: 3,
          sends: 1,
          flashes: 0,
          isFavorite: true,
        },
        {
          id: 'route-1-3',
          grade: 'V3',
          color: 'Green',
          wallLocation: 'The Cave',
          holdsType: ['Pinches'],
          routeType: ['Vertical', 'Traverse'],
          attempts: 2,
          sends: 2,
          flashes: 0,
          isFavorite: false,
        },
        {
          id: 'route-1-4',
          grade: 'V5',
          color: 'Black',
          wallLocation: 'Comp Wall',
          holdsType: ['Crimps', 'Pockets'],
          routeType: ['Overhang'],
          attempts: 5,
          sends: 0,
          flashes: 0,
          isFavorite: false,
        }
      ]
    },
    {
      id: 'sess-2',
      date: date2.toISOString().split('T')[0],
      locationId: 'loc-4',
      locationName: 'Yosemite Camp 4 Boulders',
      locationType: 'outdoor',
      notes: 'Outdoor bouldering is tough! Bishop style crimps. Very high friction but sharp rock. Sent Midnight Lightning classic slab project V2!',
      routes: [
        {
          id: 'route-2-1',
          grade: 'V1',
          color: 'Grey',
          wallLocation: 'Columbia Boulder',
          holdsType: ['Jugs', 'Underclings'],
          routeType: ['Vertical'],
          attempts: 1,
          sends: 1,
          flashes: 1,
          isFavorite: false,
        },
        {
          id: 'route-2-2',
          grade: 'V2',
          color: 'Grey',
          wallLocation: 'Main Boulder',
          holdsType: ['Crimps', 'Pockets'],
          routeType: ['Slab', 'Arete'],
          attempts: 2,
          sends: 1,
          flashes: 0,
          isFavorite: true,
        },
        {
          id: 'route-2-3',
          grade: 'V3',
          color: 'Grey',
          wallLocation: 'Slab Wall',
          holdsType: ['Slopers', 'Volumes'],
          routeType: ['Slab', 'Compression'],
          attempts: 4,
          sends: 1,
          flashes: 0,
          isFavorite: false,
        }
      ]
    },
    {
      id: 'sess-3',
      date: date3.toISOString().split('T')[0],
      locationId: 'loc-2',
      locationName: 'The Stone Summit',
      locationType: 'gym',
      notes: 'Quick bouldering sessions to test out our endurance. Flashed two V2 routes on the slab arena! Felt fantastic.',
      routes: [
        {
          id: 'route-3-1',
          grade: 'V2',
          color: 'Yellow',
          wallLocation: 'The Slab',
          holdsType: ['Jugs', 'Volumes'],
          routeType: ['Slab'],
          attempts: 1,
          sends: 1,
          flashes: 1,
          isFavorite: false,
        },
        {
          id: 'route-3-2',
          grade: 'V2',
          color: 'Orange',
          wallLocation: 'The Slab',
          holdsType: ['Pinches'],
          routeType: ['Vertical'],
          attempts: 1,
          sends: 1,
          flashes: 1,
          isFavorite: false,
        },
        {
          id: 'route-3-3',
          grade: 'V3',
          color: 'Pink',
          wallLocation: 'The Wave',
          holdsType: ['Volumes', 'Slopers'],
          routeType: ['Compression', 'Dyno'],
          attempts: 3,
          sends: 0,
          flashes: 0,
          isFavorite: false,
        }
      ]
    }
  ];
}
