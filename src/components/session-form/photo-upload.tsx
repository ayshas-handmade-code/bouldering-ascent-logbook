import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { RouteLog } from '@/src/types';

export default function PhotoUpload({
    activePhotoBase64,
    handleRemovePhoto,
    handlePhotoUpload,
    route
}: {
    activePhotoBase64: string;
    handleRemovePhoto: () => void;
    handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    route: RouteLog;
}) {
    return <div>
        <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-1.5">
            Attach Climb Photo 🌸
        </label>

        {activePhotoBase64 ? (
            <div className="flex items-center gap-2 bg-cream-base p-2 rounded-2xl border border-rose-border/50 font-sans shadow-3xs">
                <img
                    src={activePhotoBase64}
                    alt="Route Preview"
                    className="w-10 h-10 object-cover rounded-lg border border-rose-border shadow-xs"
                    referrerPolicy="no-referrer"
                />
                <div className="flex-1 text-[10px] font-display font-bold uppercase text-accent truncate">
                    photo saved ✓
                </div>
                <button
                    id={`btn-remove-photo-${route.id}`}
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-[10px] uppercase bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 px-3 py-1.5 rounded-full transition-all font-display font-bold cursor-pointer"
                >
                    remove
                </button>
            </div>
        ) : (
            <div className="relative group">
                <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-cream-base border border-dashed border-rose-border hover:border-accent rounded-full text-xs font-display font-semibold text-choco-medium cursor-pointer text-center transition-all shadow-3xs">
                    <Camera className="w-3.5 h-3.5 text-choco-light group-hover:text-accent" />
                    <span className="text-[10px] tracking-wide uppercase">Upload Photo 🌸</span>
                    <input
                        id={`file-upload-input-${route.id}`}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                    />
                </label>
            </div>
        )}
    </div>;
}

