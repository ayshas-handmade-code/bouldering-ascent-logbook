/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Location } from '../../types';
import { MapPin, Star, Trash2, Building2, Trees } from 'lucide-react';

interface LocationCardProps {
  location: Location;
  visits: number;
  onToggleFavorite: (id: string) => void;
  onDeleteLocation: (id: string) => void;
}

export default function LocationCard({
  location,
  visits,
  onToggleFavorite,
  onDeleteLocation,
}: LocationCardProps) {
  return (
    <div
      id={`loc-card-${location.id}`}
      className="bg-cream-card p-4 rounded-[24px] border border-rose-border flex items-center justify-between hover:border-accent transition-all animate-fade-in shadow-xs hover:scale-[1.01]"
    >
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full border border-rose-border/80 ${
          location.type === 'gym' 
            ? 'bg-cream-base text-accent' 
            : 'bg-cream-base text-sky-accent'
        }`}>
          {location.type === 'gym' ? <Building2 className="w-5 h-5 stroke-[2]" /> : <Trees className="w-5 h-5 stroke-[2]" />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display font-bold text-choco-dark text-sm sm:text-base leading-tight">{location.name}</h4>
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

      <div className="flex items-center gap-1.5">
        <button
          id={`btn-fav-loc-${location.id}`}
          onClick={() => onToggleFavorite(location.id)}
          title={location.isFavorite ? "Remove from Favorites" : "Mark as Favorite"}
          className={`p-2 rounded-full transition-all border ${
            location.isFavorite 
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
  );
}
