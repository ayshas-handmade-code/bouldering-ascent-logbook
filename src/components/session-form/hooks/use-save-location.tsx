import { useState, useEffect } from 'react';
import { ClimbingSession, Location, LocationType } from "@/src/types";

// Firebase imports
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from "@/src/firebase";
import { doc, setDoc } from 'firebase/firestore';
import { getLocations } from '@/src/firebase-utils';

// Callback handler: Create or Edit climbing session in Firestore
export default function useLocation() {
  // firebase settings
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);


  const saveLocationToDb = async (location: Location) => {
    if (!currentUser) return;
    if (!location.id) return;

    const path = `locations/${location.id}`;
    console.log(path)
    try {
      const docData = {
        ...location,
        userId: currentUser.uid,
      };
      await setDoc(doc(db, 'locations', location.id), docData);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  return { saveLocationToDb };
};
