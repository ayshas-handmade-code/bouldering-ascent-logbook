/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { processPhotoUpload } from '../../utils';
import { savePhoto, getPhoto } from '../../photoStore';
import { RouteLog } from '../../types';

interface PhotoUploaderProps {
  route: RouteLog;
  handleUpdateRouteField: <K extends keyof RouteLog>(
    routeId: string,
    field: K,
    value: RouteLog[K]
  ) => void;
}

export default function PhotoUploader({
  route,
  handleUpdateRouteField
}: PhotoUploaderProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    if (route.photoId) {
      getPhoto(route.photoId)
        .then((base64) => {
          if (active && base64) {
            setPhotoPreview(base64);
          }
        })
        .catch((err) => {
          console.error('Failed to load photo preview:', err);
        });
    } else {
      setPhotoPreview(null);
    }
    return () => {
      active = false;
    };
  }, [route.photoId]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const resizedBase64 = await processPhotoUpload(file);
      const photoId = `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Save directly to raw IndexedDB
      await savePhoto(photoId, resizedBase64);

      // Update routes state
      handleUpdateRouteField(route.id, 'photoId', photoId);
      setPhotoPreview(resizedBase64);
    } catch (err) {
      console.error('Failed to upload/compress photo:', err);
      alert('Error compressing climbing photo. Please try a different photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    handleUpdateRouteField(route.id, 'photoId', undefined);
    setPhotoPreview(null);
  };

  return (
    <div>
      <label className="block text-[10px] font-display font-semibold text-choco-medium uppercase tracking-wider mb-1.5">
        Attach Climb Photo 🌸
      </label>

      {photoPreview ? (
        <div className="flex items-center gap-2 bg-cream-base p-2 rounded-2xl border border-rose-border/50 font-sans shadow-3xs">
          <img
            src={photoPreview}
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
            <span className="text-[10px] tracking-wide uppercase">
              {loading ? 'Processing...' : 'Upload Photo 🌸'}
            </span>
            <input
              id={`file-upload-input-${route.id}`}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
