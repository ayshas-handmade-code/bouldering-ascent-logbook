/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Location, ClimbingSession } from '../../types';
import { Plus, Search, MapPin } from 'lucide-react';
import LocationCard from './LocationCard';
import AddLocationForm from './AddLocationForm';

interface LocationsTabProps {
  locations: Location[];
  sessions: ClimbingSession[];
  onToggleFavorite: (id: string) => void;
  onAddLocation: (name: string, type: 'gym' | 'outdoor', city?: string) => void;
  onDeleteLocation: (id: string) => void;
}

export default function LocationsTab({
  locations,
  sessions,
  onToggleFavorite,
  onAddLocation,
  onDeleteLocation,
}: LocationsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Count visits per location ID
  const getSessionCountForLocation = (locId: string) => {
    return sessions.filter(s => s.locationId === locId).length;
  };

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loc.city && loc.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div id="locations-tab-container" className="space-y-6 pb-24 animate-fade-in">
      {/* Header section */}
      <div className="flex justify-between items-center bg-cream-card p-5 rounded-[24px] border border-rose-border shadow-xs">
        <div>
          <h2 className="text-sm font-display font-bold text-choco-dark">Sweet Climbing Spots 🍓</h2>
          <p className="text-[11px] text-choco-medium font-medium mt-0.5 leading-none">Manage your gyms & outdoor spots</p>
        </div>
        <button
          id="btn-add-location-toggle"
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r select-none rounded-full text-[10px] font-display font-bold transition-all border ${
            isAdding 
              ? 'bg-red-50 text-red-500 border-red-200' 
              : 'from-accent to-accent-hover text-choco-dark border-accent/40 shadow-xs'
          }`}
        >
          {isAdding ? 'Cancel' : (
            <>
              <Plus className="w-4 h-4 stroke-[2.5]" /> Add Spot
            </>
          )}
        </button>
      </div>

      {/* Add New Location Form */}
      {isAdding && (
        <AddLocationForm 
          onAddLocation={onAddLocation}
          onClose={() => setIsAdding(false)}
        />
      )}

      {/* SEARCH BAR */}
      <div className="relative">
        <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-choco-light" />
        </span>
        <input
          id="search-locations"
          type="text"
          placeholder="Search bouldering spots... 🧸"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-11 pr-4 py-3 bg-cream-card border border-rose-border rounded-full text-choco-dark font-display font-bold tracking-normal placeholder:text-choco-light/50 focus:outline-none focus:border-accent transition-all shadow-xs"
        />
      </div>

      {/* LOCATIONS LIST */}
      <div className="grid gap-3">
        {filteredLocations.map((loc) => (
          <LocationCard
            key={loc.id}
            location={loc}
            visits={getSessionCountForLocation(loc.id)}
            onToggleFavorite={onToggleFavorite}
            onDeleteLocation={onDeleteLocation}
          />
        ))}

        {filteredLocations.length === 0 && (
          <div className="text-center py-12 bg-cream-card rounded-[28px] border-2 border-dashed border-rose-border shadow-sm">
            <MapPin className="w-8 h-8 text-rose-border mx-auto mb-2 animate-bounce" />
            <p className="text-xs font-display font-bold text-choco-medium">No locations match search 🧸</p>
          </div>
        )}
      </div>
    </div>
  );
}
