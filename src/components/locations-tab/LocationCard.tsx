/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Location } from '../../types';
import { MapPin, Star, Trash2, Building2, Trees, X } from 'lucide-react';
import styles from './LocationCard.module.css';

interface LocationCardProps {
  key?: React.Key | string | number;
  location: Location;
  visits: number;
  onToggleFavorite: (id: string) => void;
  onDeleteLocation: (id: string) => void;
  onUpdateLocation: (location: Location) => void;
}

export default function LocationCard({
  location,
  visits,
  onToggleFavorite,
  onDeleteLocation,
  onUpdateLocation,
}: LocationCardProps) {
  const [newWall, setNewWall] = useState('');

  // Default wall locations for gyms if undefined
  const walls = location.wallLocations !== undefined
    ? location.wallLocations
    : (location.type === 'gym' ? ['Slab', 'Overhang', 'Cave'] : []);

  const handleAddWall = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWall.trim();
    if (!trimmed) return;
    if (walls.some(w => w.toLowerCase() === trimmed.toLowerCase())) {
      alert('This wall location already exists.');
      return;
    }
    onUpdateLocation({
      ...location,
      wallLocations: [...walls, trimmed],
    });
    setNewWall('');
  };

  const handleRemoveWall = (wallToRemove: string) => {
    onUpdateLocation({
      ...location,
      wallLocations: walls.filter(w => w !== wallToRemove),
    });
  };

  return (
    <div
      id={`loc-card-${location.id}`}
      className={`${styles.container} bg-cream-card p-5 rounded-[24px] border border-rose-border hover:border-accent transition-all animate-fade-in shadow-xs hover:scale-[1.01]`}
    >
      {/* Top Row: Info & Main Actions */}
      <div className={`${styles.icon_title_container} flex items-center justify-between gap-4`}>
        {/* Left Side: Icon & Titles */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-3 rounded-full border border-rose-border/80 shrink-0 ${location.type === 'gym'
            ? 'bg-cream-base text-accent'
            : 'bg-cream-base text-sky-accent'
            }`}>
            {location.type === 'gym' ? <Building2 className="w-5 h-5 stroke-[2]" /> : <Trees className="w-5 h-5 stroke-[2]" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`${styles.icon_title} font-display font-bold text-choco-dark text-sm sm:text-base leading-tight truncate`}>
                {location.name}
              </h4>
              {location.isFavorite && (
                <Star className="w-4 h-4 text-accent fill-accent shrink-0 animate-pulse" />
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 text-[10px] font-display font-bold text-choco-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-choco-medium" />
                {location.city || 'local area'}
              </span>
              <span className="bg-sky-accent/25 border border-sky-accent/50 px-2.5 py-1 rounded-full text-[9px] text-choco-dark font-display font-bold">
                {visits} {visits === 1 ? 'visit 🍭' : 'visits 🍭'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id={`btn-fav-loc-${location.id}`}
            onClick={() => onToggleFavorite(location.id)}
            title={location.isFavorite ? "Remove from Favorites" : "Mark as Favorite"}
            className={`p-2 rounded-full transition-all border ${location.isFavorite
              ? 'bg-accent/20 border-accent/65 text-berry-accent shadow-3xs'
              : 'bg-cream-base border-rose-border/40 text-choco-light hover:bg-rose-border/20 shadow-3xs'
              }`}
          >
            <Star className={`w-4 h-4 ${location.isFavorite ? 'fill-accent' : ''}`} />
          </button>

          {visits === 0 && (
            <button
              id={`btn-del-loc-${location.id}`}
              onClick={() => onDeleteLocation(location.id)}
              title="Delete Location"
              className="p-2 bg-red-50 hover:bg-red-100/60 text-red-500 border border-red-200 rounded-full transition-all animate-fade-in shadow-3xs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Wall Locations (Only for Gyms) */}
      {location.type === 'gym' && (
        <div className="mt-4 pt-4 border-t border-rose-border/40 space-y-3">
          <div className="text-[10px] font-display font-bold uppercase tracking-wider text-choco-medium flex items-center justify-between">
            <span>Wall Zones / Locations 🧗‍♀️</span>
            {location.wallLocations === undefined && (
              <span className="text-[8px] text-accent/80 normal-case">showing defaults</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {walls.map((wall) => (
              <span
                key={wall}
                className="inline-flex items-center gap-1 text-[10px] bg-cream-base border border-rose-border/60 text-choco-dark font-display font-bold px-2.5 py-1.5 rounded-full"
              >
                {wall}
                <button
                  type="button"
                  onClick={() => handleRemoveWall(wall)}
                  className="text-choco-light hover:text-red-500 transition-colors ml-0.5 focus:outline-none"
                  title={`Remove ${wall}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {walls.length === 0 && (
              <span className="text-[10px] text-choco-light italic font-medium">No wall locations added yet 🧸</span>
            )}
          </div>

          <form onSubmit={handleAddWall} className={styles.wall_location_form}>
            <input
              type="text"
              placeholder="e.g. Roof, Comp Wall, slab..."
              value={newWall}
              onChange={(e) => setNewWall(e.target.value)}
              className={`${styles.wall_location_input} flex text-[11px] px-3.5 py-2 rounded-full border border-rose-border outline-none focus:border-accent bg-cream-base text-choco-dark font-display font-bold placeholder-choco-light/40`}
            />
            <button
              type="submit"
              className="px-4 py-2 text-[10px] font-display font-bold bg-gradient-to-r from-accent to-accent-hover text-choco-dark rounded-full active:scale-95 transition-all shadow-3xs flex items-center gap-0.5 cursor-pointer"
            >
              Add Wall
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
