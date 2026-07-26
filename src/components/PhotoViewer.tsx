/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getPhoto } from '../photoStore';
import { Camera, Image as ImageIcon, ZoomIn, X } from 'lucide-react';

interface PhotoViewerProps {
  photoId: string;
  className?: string;
  thumbnail?: boolean;
}

export default function PhotoViewer({ photoId, className = 'w-12 h-12 rounded-lg object-cover', thumbnail = true }: PhotoViewerProps) {
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPhoto(photoId)
      .then(data => {
        if (active) {
          setPhotoData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error loading photo from Store:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [photoId]);

  if (loading) {
    return (
      <div id={`loader-${photoId}`} className={`${className} bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center`}>
        <Camera className="w-4 h-4 text-slate-400" />
      </div>
    );
  }

  if (!photoData) {
    return null; // Don't show anything if no photo data exists
  }

  return (
    <>
      {thumbnail ? (
        <div
          id={`photo-thumb-${photoId}`}
          className={`relative group cursor-pointer ${className} overflow-hidden shadow-sm hover:ring-2 hover:ring-accent transition-all`}
          onClick={() => setIsOpen(true)}
        >
          <img
            src={photoData}
            alt="Climbing route"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <ZoomIn className="w-4 h-4 text-accent" />
          </div>
        </div>
      ) : (
        <img
          id={`photo-img-${photoId}`}
          src={photoData}
          alt="Climbing route"
          className={`${className} cursor-pointer`}
          onClick={() => setIsOpen(true)}
          referrerPolicy="no-referrer"
        />
      )}

      {/* Modal Lightbox */}
      {isOpen && (
        <div
          id={`lightbox-${photoId}`}
          className=" flex flex-col items-start justify-start fixed inset-0 bg-choco-dark/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        >
          <button
            id={`close-lightbox-${photoId}`}
            className="absolute top-6 right-6 p-2 bg-cream-card border border-rose-border hover:bg-cream-base text-choco-medium hover:text-choco-dark rounded-full transition-all shadow-md cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-3xl max-h-[85vh] overflow-hidden rounded-[32px] border border-rose-border bg-cream-card shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <img
              src={photoData}
              alt="Climbing route fullscreen"
              className="max-w-full max-h-[80vh] object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="bg-cream-base text-choco-dark py-3 px-4 text-center text-[11px] font-display font-bold uppercase tracking-normal flex items-center justify-center gap-2 border-t border-rose-border/40">
              <ImageIcon className="w-4 h-4 text-accent" />
              Logged Ascent Attachment 🌸
            </div>
          </div>
        </div>
      )}
    </>
  );
}
