/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Building2, Trees, Plus } from 'lucide-react';

interface AddLocationFormProps {
  onAddLocation: (name: string, type: 'gym' | 'outdoor', city?: string) => void;
  onClose: () => void;
}

export default function AddLocationForm({
  onAddLocation,
  onClose,
}: AddLocationFormProps) {
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState<'gym' | 'outdoor'>('gym');
  const [newLocCity, setNewLocCity] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) {
      setErrorMsg('Location name is required');
      return;
    }
    onAddLocation(newLocName.trim(), newLocType, newLocCity.trim() || undefined);
    setNewLocName('');
    setNewLocCity('');
    onClose();
    setErrorMsg('');
  };

  return (
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
  );
}
