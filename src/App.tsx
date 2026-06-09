/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClimbingSession, Location } from './types';
import { INITIAL_LOCATIONS, generateSampleSessions } from './data';
import DashboardTab from './components/dashboard-tab/DashboardTab';
import LogbookTab from './components/LogbookTab';
import LocationsTab from './components/locations-tab/LocationsTab';
import SessionForm from './components/SessionForm';
import {
  Trophy, History, MapPin, Compass, Plus,
  Info, Sparkles, LogOut, CheckSquare, Dumbbell
} from 'lucide-react';

// Firebase imports
import {
  db, auth, loginWithGoogle, logout,
  handleFirestoreError, OperationType
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection, query, where, onSnapshot,
  doc, setDoc, deleteDoc
} from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logbook' | 'locations'>('dashboard');
  const [sessions, setSessions] = useState<ClimbingSession[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Custom auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<ClimbingSession | null>(null);

  // Highlight/Expand requested session from Dashboard click
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // 1. Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Subscribe to Firestore Collections
  useEffect(() => {
    if (!currentUser) {
      setSessions([]);
      setLocations([]);
      return;
    }

    const uid = currentUser.uid;

    // A. Subscribe to locations
    const locRef = collection(db, 'locations');
    const locQuery = query(locRef, where('userId', '==', uid));

    const unsubscribeLocations = onSnapshot(locQuery, async (snapshot) => {
      const fetchedLocs = snapshot.docs.map(d => d.data() as Location);

      // If of course the user is brand new and has no locations, cozy-seed sample data automatically!
      const playedSeedKey = `seeded_v2_${uid}`;
      if (snapshot.empty && !localStorage.getItem(playedSeedKey)) {
        localStorage.setItem(playedSeedKey, 'true');
        await seedCozySampleData(uid);
        return;
      }

      fetchedLocs.sort((a, b) => a.name.localeCompare(b.name));
      setLocations(fetchedLocs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'locations');
    });

    // B. Subscribe to climbing sessions
    const sessRef = collection(db, 'sessions');
    const sessQuery = query(sessRef, where('userId', '==', uid));

    const unsubscribeSessions = onSnapshot(sessQuery, (snapshot) => {
      const fetchedSess = snapshot.docs.map(d => d.data() as ClimbingSession);
      fetchedSess.sort((a, b) => b.date.localeCompare(a.date));
      setSessions(fetchedSess);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sessions');
    });

    return () => {
      unsubscribeLocations();
      unsubscribeSessions();
    };
  }, [currentUser]);

  // Seeding helper for beautiful initial sandbox experience
  const seedCozySampleData = async (uid: string) => {
    try {
      // Create batch locations
      for (const loc of INITIAL_LOCATIONS) {
        await setDoc(doc(db, 'locations', loc.id), {
          ...loc,
          userId: uid,
        });
      }
      // Create batch sessions
      const sampleSessions = generateSampleSessions();
      for (const sess of sampleSessions) {
        await setDoc(doc(db, 'sessions', sess.id), {
          ...sess,
          userId: uid,
        });
      }
    } catch (err) {
      console.error('Cozy seeding failed:', err);
    }
  };

  // Callback handler: Create or Edit climbing session in Firestore
  const handleSaveSession = async (savedSession: ClimbingSession) => {
    if (!currentUser) return;
    const path = `sessions/${savedSession.id}`;
    try {
      const docData = {
        ...savedSession,
        userId: currentUser.uid,
      };
      await setDoc(doc(db, 'sessions', savedSession.id), docData);
      setIsFormOpen(false);
      setSessionToEdit(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // Callback handler: Delete session
  const handleDeleteSession = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm('Are you sure you want to delete this bouldering session? This action is irreversible.')) {
      const path = `sessions/${id}`;
      try {
        await deleteDoc(doc(db, 'sessions', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  // Callback handler: Toggle favorite route (inside session container)
  const handleToggleRouteFavorite = async (sessionId: string, routeId: string) => {
    if (!currentUser) return;
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const updatedRoutes = session.routes.map((route) => {
      if (route.id !== routeId) return route;
      return { ...route, isFavorite: !route.isFavorite };
    });

    const updatedSession = { ...session, routes: updatedRoutes };
    const path = `sessions/${sessionId}`;
    try {
      await setDoc(doc(db, 'sessions', sessionId), updatedSession);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // Callback handler: Toggle location favorite
  const handleToggleLocationFavorite = async (locId: string) => {
    if (!currentUser) return;
    const loc = locations.find((l) => l.id === locId);
    if (!loc) return;

    const updatedLoc = { ...loc, isFavorite: !loc.isFavorite };
    const path = `locations/${locId}`;
    try {
      await setDoc(doc(db, 'locations', locId), updatedLoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // Callback handler: Add new location
  const handleAddLocation = async (name: string, type: 'gym' | 'outdoor', city?: string) => {
    if (!currentUser) return;
    const id = `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newLoc: Location = {
      id,
      name,
      type,
      isFavorite: false,
      city: city || 'Local Area',
    };
    const path = `locations/${id}`;
    try {
      await setDoc(doc(db, 'locations', id), {
        ...newLoc,
        userId: currentUser.uid,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // Callback: Delete location
  const handleDeleteLocation = async (id: string) => {
    if (!currentUser) return;
    // Only allow deletion if no sessions exist for this location
    const matchedSessions = sessions.filter((s) => s.locationId === id);
    if (matchedSessions.length > 0) {
      alert('Cannot delete location because sessions are logged here.');
      return;
    }
    const path = `locations/${id}`;
    try {
      await deleteDoc(doc(db, 'locations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Direct trigger to edit form
  const handleEditSessionTrigger = (session: ClimbingSession) => {
    setSessionToEdit(session);
    setIsFormOpen(true);
  };

  // Dashboard link to go to a specific session log
  const handleSelectSessionFromDashboard = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActiveTab('logbook');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream-base flex flex-col items-center justify-center p-6 text-choco-dark relative overflow-hidden">
        {/* Subtle background grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#FFD3DC_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        <div className="w-full max-w-xs p-8 bg-cream-card rounded-[32px] border border-rose-border shadow-md text-center space-y-4 relative z-10">
          <div className="p-3 w-12 h-12 bg-accent rounded-full text-choco-dark flex items-center justify-center mx-auto animate-bounce">
            <Dumbbell className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="text-sm font-display font-bold">Waking up ClimbLog...</h2>
          <p className="text-[11px] text-choco-medium font-medium">Connecting to our sweet bouldering servers 🌸</p>
          <div className="w-12 h-1.5 bg-cream-base rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-accent w-1/2 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-cream-base flex flex-col items-center justify-center p-4 text-choco-dark relative overflow-hidden">
        {/* Subtle background grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#FFD3DC_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        <div className="w-full max-w-sm p-8 bg-cream-card rounded-[36px] border border-rose-border shadow-xl text-center space-y-6 relative z-10 transition-all">
          <div className="space-y-4">
            <div className="inline-block p-4 bg-gradient-to-tr from-accent to-accent-hover rounded-full text-choco-dark shadow-sm">
              <Dumbbell className="w-8 h-8 stroke-[2.2]" />
            </div>

            <span className="block text-[10px] bg-accent/20 border border-accent/40 w-fit mx-auto px-3 py-1 text-choco-medium font-display font-semibold rounded-full uppercase tracking-wider">
              CLIMBING JOURNEY SYNCED 🌸
            </span>

            <h1 className="text-2xl font-display font-extrabold text-choco-dark tracking-tight leading-none">
              Welcome to ClimbLog ✨
            </h1>

            <p className="text-xs text-choco-medium max-w-xs mx-auto leading-relaxed">
              Track your V-grade achievements, find wall style affinities, and share custom gyms in a cozy, beautiful personal climbing space.
            </p>
          </div>

          <div className="text-left p-4 bg-cookie-bg/60 rounded-2xl border border-rose-border/30 space-y-3">
            <div className="flex items-center gap-2.5 text-[11px] text-choco-medium font-medium">
              <span className="text-sm">☁️</span>
              <span>Fully synced cloud backup for your sessions</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-choco-medium font-medium">
              <span className="text-sm">🧗‍♀️</span>
              <span>Visualized grade spreads & style affinities</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-choco-medium font-medium">
              <span className="text-sm">⭐</span>
              <span>Star your favorite sends & gym coordinates</span>
            </div>
          </div>

          <button
            onClick={loginWithGoogle}
            className="w-full py-3.5 bg-gradient-to-r from-accent to-accent-hover active:scale-[0.98] text-choco-dark hover:text-choco-dark font-display font-bold rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-3 border border-rose-border/30 hover:shadow-lg text-xs"
          >
            <svg className="w-4.5 h-4.5 bg-white p-0.5 rounded-full shadow-3xs" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.3 1.5-1.14 2.76-2.4 3.6v3h3.9c2.26-2.08 3.56-5.14 3.56-8.43z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.72-2.1-6.66-4.9H1.4v3.1C3.37 22 7.42 24 12 24z" />
              <path fill="#FBBC05" d="M5.34 14.3c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3V6.6H1.4C.5 8.4 0 10.15 0 12s.5 3.6 1.4 5.4l3.94-3.1z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.43-3.43C17.95 1.08 15.24 0 12 0 7.42 0 3.37 2 1.4 5.3l3.94 3.1c.94-2.8 3.56-4.9 6.66-4.9z" />
            </svg>
            Enter with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="applet-base" className="min-h-screen bg-cream-base flex justify-center text-choco-dark antialiased selection:bg-accent selection:text-choco-dark font-sans">

      {/* Container simulating a premium mobile web application frame */}
      <div id="mobile-app-shell" className="w-full max-w-lg min-h-screen bg-cream-base flex flex-col shadow-xl relative border-x border-rose-border">

        {/* TOP COMPONENT APP BAR */}
        <header id="app-topbar" className="sticky top-0 bg-cream-card/90 backdrop-blur-xl border-b-2 border-rose-border z-30 px-5 py-4 flex items-center justify-between shadow-xs rounded-b-[24px]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 w-10 h-10 bg-accent rounded-full shadow-xs text-choco-dark flex items-center justify-center bg-gradient-to-tr from-accent to-accent-hover">
              <Dumbbell className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-base font-display font-bold tracking-tight leading-none text-choco-dark flex items-center gap-1">
                ClimbLog <span className="text-[10px] bg-sky-accent/40 text-choco-dark font-display font-semibold px-2 py-0.5 rounded-full">sweet 🌸</span>
              </h1>
              <p className="text-[11px] text-choco-medium font-medium tracking-wide mt-1">boulder ascent logbook ✨</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick stats indicator */}
            <span className="hidden sm:flex text-[10px] bg-mint-accent/20 border border-mint-accent/50 font-display font-bold px-3 py-1 text-choco-dark rounded-full items-center gap-1">
              <span className="w-1.5 h-1.5 bg-mint-accent rounded-full animate-pulse" />
              {sessions.reduce((sum, s) => sum + s.routes.length, 0)} SENDS
            </span>

            {/* User Profile avatar + logout */}
            <div className="flex items-center gap-1.5 border-l border-rose-border/50 pl-2.5">
              <img
                src={currentUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.uid}`}
                alt="Profile"
                className="w-7 h-7 rounded-full border border-rose-border object-cover"
                referrerPolicy="no-referrer"
                title={currentUser.displayName || currentUser.email || 'Climber'}
              />
              <button
                onClick={logout}
                className="p-1 text-choco-light hover:text-accent hover:bg-cream-base rounded-full transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN BODY CONTROLLER */}
        <main id="app-main-content" className="flex-1 overflow-y-auto px-4 py-5 font-sans">
          {activeTab === 'dashboard' && (
            <DashboardTab
              sessions={sessions}
              locations={locations}
              onSelectSession={handleSelectSessionFromDashboard}
            />
          )}

          {activeTab === 'logbook' && (
            <LogbookTab
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              onAddSession={() => {
                setSessionToEdit(null);
                setIsFormOpen(true);
              }}
              onEditSession={handleEditSessionTrigger}
              onDeleteSession={handleDeleteSession}
              onToggleRouteFavorite={handleToggleRouteFavorite}
            />
          )}

          {activeTab === 'locations' && (
            <LocationsTab
              locations={locations}
              sessions={sessions}
              onToggleFavorite={handleToggleLocationFavorite}
              onAddLocation={handleAddLocation}
              onDeleteLocation={handleDeleteLocation}
            />
          )}
        </main>

        {/* BOTTOM FLOATING NAV BAR */}
        <nav id="app-bottom-navbar" className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-cream-card/95 backdrop-blur-md border-t-2 border-rose-border py-4 px-6 z-30 flex justify-between items-center shadow-lg rounded-t-[32px] text-sm font-sans">

          <button
            id="nav-btn-dashboard"
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedSessionId(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'dashboard'
                ? 'text-accent scale-105 font-display font-bold'
                : 'text-choco-light hover:text-choco-medium font-medium'
              }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-display">Climb Lab</span>
          </button>

          <button
            id="nav-btn-logbook"
            onClick={() => {
              setActiveTab('logbook');
              setSelectedSessionId(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'logbook'
                ? 'text-accent scale-105 font-display font-bold'
                : 'text-choco-light hover:text-choco-medium font-medium'
              }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-display">My Journal</span>
          </button>

          <button
            id="nav-btn-locations"
            onClick={() => {
              setActiveTab('locations');
              setSelectedSessionId(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'locations'
                ? 'text-accent scale-105 font-display font-bold'
                : 'text-choco-light hover:text-choco-medium font-medium'
              }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] font-display">Cute Gyms</span>
          </button>

          {/* Quick Center Actions */}
          <div className="h-8 border-r border-rose-border" />

          <button
            id="nav-btn-quick-log"
            onClick={() => {
              setSessionToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-choco-dark font-display font-bold rounded-full text-xs shadow-sm shadow-accent/40 hover:scale-105 active:scale-95 transition-all duration-150"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Log Ascent
          </button>

        </nav>

        {/* MODAL SHEET FOR SESSION CREATOR & EDITOR */}
        {isFormOpen && (
          <SessionForm
            locations={locations}
            sessionToEdit={sessionToEdit}
            onSave={handleSaveSession}
            onClose={() => {
              setIsFormOpen(false);
              setSessionToEdit(null);
            }}
          />
        )}

      </div>
    </div>
  );
}
