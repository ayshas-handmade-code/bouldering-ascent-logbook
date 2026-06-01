/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Location, ClimbingSession } from '../types';
import { MapPin, Star, Plus, Trash2, Building2, Trees, Search } from 'lucide-react';

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
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState<'gym' | 'outdoor'>('gym');
  const [newLocCity, setNewLocCity] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Count visits per location ID
  const getSessionCountForLocation = (locId: string) => {
    return sessions.filter(s => s.locationId === locId).length;
  };

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loc.city && loc.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) {
      setErrorMsg('Location name is required');
      return;
    }
    onAddLocation(newLocName.trim(), newLocType, newLocCity.trim() || undefined);
    setNewLocName('');
    setNewLocCity('');
    setIsAdding(false);
    setErrorMsg('');
  };

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
        <form 
          id="form-add-location"
          onSubmit={handleSubmit} 
          className="bg-cream-card p-6 rounded-[28px] border border-rose-border shadow-md space-y-4 animate-slide-up"
        >
          <h3 className="text-xs font-display font-bold text-choco-dark border-b border-rose-border pb-2 flex items-center gap-1.5">Register New Spot 🧸</h3>
          
          <div className="space-y-3 font-sans">
            <div>
              <label className="block text-[10px] font-display font-bold text-choco-medium mb-1.5 uppercase">Spot Name *</label>
              <input
                id="input-loc-name"
                type="text"
                placeholder="e.g. MISSION CLIFFS, MOVEMENT"
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                className="w-full text-xs px-4 py-2.5 rounded-full border border-rose-border outline-none focus:border-accent bg-cream-base transition-all font-display font-semibold text-choco-dark placeholder-choco-light/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-display font-bold text-choco-medium mb-1.5 uppercase">Type *</label>
                <div className="grid grid-cols-2 gap-2 bg-cream-base p-1 rounded-full border border-rose-border/60">
                  <button
                    id="btn-type-gym"
                    type="button"
                    onClick={() => setNewLocType('gym')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-display font-bold uppercase transition-all rounded-full ${
                      newLocType === 'gym'
                        ? 'bg-accent text-choco-dark shadow-3xs'
                        : 'text-choco-medium hover:text-choco-dark animate-fade-in'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> Gym
                  </button>
                  <button
                    id="btn-type-outdoor"
                    type="button"
                    onClick={() => setNewLocType('outdoor')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-display font-bold uppercase transition-all rounded-full ${
                      newLocType === 'outdoor'
                        ? 'bg-accent text-choco-dark shadow-3xs'
                        : 'text-choco-medium hover:text-choco-dark animate-fade-in'
                    }`}
                  >
                    <Trees className="w-3.5 h-3.5" /> Crag
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-display font-bold text-choco-medium mb-1.5 uppercase">Location City </label>
                <input
                  id="input-loc-city"
                  type="text"
                  placeholder="e.g. SAN FRANCISCO"
                  value={newLocCity}
                  onChange={(e) => setNewLocCity(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-full border border-rose-border outline-none focus:border-accent bg-cream-base transition-all font-display font-semibold text-choco-dark placeholder-choco-light/60"
                />
              </div>
            </div>
            {errorMsg && <p className="text-[11px] font-display font-bold text-red-500">{errorMsg}</p>}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              id="btn-loc-submit"
              type="submit"
              className="px-5 py-2.5 text-xs font-display font-bold bg-gradient-to-r from-accent to-accent-hover text-choco-dark rounded-full shadow-md shadow-accent/20 active:scale-95 transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Save Location
            </button>
          </div>
        </form>
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
        {filteredLocations.map((loc) => {
          const visits = getSessionCountForLocation(loc.id);
          return (
            <div
              id={`loc-card-${loc.id}`}
              key={loc.id}
              className="bg-cream-card p-4 rounded-[24px] border border-rose-border flex items-center justify-between hover:border-accent transition-all animate-fade-in shadow-xs hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full border border-rose-border/80 ${
                  loc.type === 'gym' 
                    ? 'bg-cream-base text-accent' 
                    : 'bg-cream-base text-sky-accent'
                }`}>
                  {loc.type === 'gym' ? <Building2 className="w-5 h-5 stroke-[2]" /> : <Trees className="w-5 h-5 stroke-[2]" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-choco-dark text-sm sm:text-base leading-tight">{loc.name}</h4>
                    {loc.isFavorite && (
                      <Star className="w-4 h-4 text-accent fill-accent shrink-0 animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-display font-bold text-choco-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-choco-medium" />
                      {loc.city || 'local area'}
                    </span>
                    <span className="bg-sky-accent/25 border border-sky-accent/50 px-2.5 py-1 rounded-full text-[9px] text-choco-dark font-display font-bold">
                      {visits} {visits === 1 ? 'visit 🍭' : 'visits 🍭'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id={`btn-fav-loc-${loc.id}`}
                  onClick={() => onToggleFavorite(loc.id)}
                  title={loc.isFavorite ? "Remove from Favorites" : "Mark as Favorite"}
                  className={`p-2 rounded-full transition-all border ${
                    loc.isFavorite 
                      ? 'bg-accent/20 border-accent/65 text-berry-accent shadow-3xs' 
                      : 'bg-cream-base border-rose-border/40 text-choco-light hover:bg-rose-border/20 shadow-3xs'
                  }`}
                >
                  <Star className={`w-4 h-4 ${loc.isFavorite ? 'fill-accent' : ''}`} />
                </button>

                {visits === 0 && (
                  <button
                    id={`btn-del-loc-${loc.id}`}
                    onClick={() => onDeleteLocation(loc.id)}
                    title="Delete Location"
                    className="p-2 bg-red-50 hover:bg-red-100/60 text-red-500 border border-red-200 rounded-full transition-all animate-fade-in shadow-3xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

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
