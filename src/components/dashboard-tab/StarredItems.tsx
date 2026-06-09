/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClimbingSession, Location } from '../../types';
import { Star } from 'lucide-react';

interface StarredItemsProps {
  sessions: ClimbingSession[];
  locations: Location[];
  onSelectSession: (id: string) => void;
}

export default function StarredItems({
  sessions,
  locations,
  onSelectSession,
}: StarredItemsProps) {
  // Favorite locations
  const favoriteLocations = locations.filter(loc => loc.isFavorite);

  // Collect favorite routes across all sessions
  const favoriteRoutes: { sessionDate: string; locationName: string; grade: string; color: string; wallLocation: string; id: string; sessionId: string }[] = [];
  sessions.forEach(sess => {
    sess.routes.forEach(route => {
      if (route.isFavorite) {
        favoriteRoutes.push({
          id: route.id,
          sessionId: sess.id,
          sessionDate: sess.date,
          locationName: sess.locationName,
          grade: route.grade,
          color: route.color,
          wallLocation: route.wallLocation,
        });
      }
    });
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Favorite Gyms */}
      <div className="bg-cream-card p-6 rounded-[28px] border border-rose-border shadow-xs">
        <h4 className="text-xs font-display font-bold text-choco-dark mb-3 flex items-center gap-1.5 leading-none">
          <Star className="w-4 h-4 text-accent fill-accent animate-pulse" /> Star Gyms ⭐ ({favoriteLocations.length})
        </h4>

        <div className="space-y-2 max-h-44 overflow-y-auto">
          {favoriteLocations.map(gym => (
            <div
              id={`fav-gym-widget-${gym.id}`}
              key={gym.id}
              className="flex items-center justify-between p-3 bg-cream-base/50 rounded-2xl border border-rose-border/50 text-choco-medium shadow-3xs hover:bg-cream-base transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-choco-medium text-[9px] font-display font-semibold bg-sky-accent/20 px-2 py-0.5 rounded-full border border-sky-accent/30 lowercase font-bold">
                  {gym.type === 'gym' ? 'indoor 🏢' : 'outdoor 🌲'}
                </span>
                <span className="text-xs font-display font-bold text-choco-dark truncate max-w-[140px]">{gym.name}</span>
              </div>
              <span className="text-[10px] text-choco-medium font-medium">{gym.city || 'Undef'}</span>
            </div>
          ))}

          {favoriteLocations.length === 0 && (
            <p className="text-xs text-choco-light italic py-4 text-center font-display font-medium">No cozy gyms starred yet 🌟</p>
          )}
        </div>
      </div>

      {/* Favorite Climbing Routes */}
      <div className="bg-cream-card p-6 rounded-[28px] border border-rose-border shadow-xs">
        <h4 className="text-xs font-display font-bold text-choco-dark mb-3 flex items-center gap-1.5 leading-none">
          <Star className="w-4 h-4 text-accent fill-accent animate-pulse" /> Star-Starred Climbs 🌸 ({favoriteRoutes.length})
        </h4>

        <div className="space-y-2 max-h-44 overflow-y-auto">
          {favoriteRoutes.map(fav => (
            <div
              id={`fav-route-widget-${fav.id}`}
              key={fav.id}
              onClick={() => onSelectSession(fav.sessionId)}
              className="flex items-center justify-between p-3 bg-cream-base/50 rounded-2xl border border-rose-border/50 hover:border-accent cursor-pointer text-choco-medium transition-all hover:translate-x-1 hover:bg-cream-card hover:shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-display font-bold text-choco-dark bg-accent/20 px-2.5 py-1 rounded-full border border-rose-border/40 shrink-0">
                  {fav.grade}
                </span>
                <p className="text-xs font-display font-semibold text-choco-medium truncate max-w-[150px]">
                  {fav.color} • {fav.wallLocation}
                </p>
              </div>
              <span className="text-[10px] font-display font-bold text-choco-light bg-cream-card/90 px-2.5 py-1 rounded-full border border-rose-border/30">
                {fav.sessionDate.split('-').slice(1).join('/')}
              </span>
            </div>
          ))}

          {favoriteRoutes.length === 0 && (
            <p className="text-xs text-choco-light italic py-4 text-center font-display font-medium">No climbs favorited yet 🌸</p>
          )}
        </div>
      </div>
    </div>
  );
}
