import { useState, useEffect } from 'react';
import { ClimbingSession } from "@/src/types";

// Firebase imports
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from "@/src/firebase";
import { doc, setDoc } from 'firebase/firestore';

// Callback handler: Create or Edit climbing session in Firestore
export default function useSaveSession() {
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

    const saveSession = async (session: ClimbingSession) => {
        if (!currentUser) return;
        const path = `sessions/${session.id}`;

        try {
            const docData = {
                ...session,
                userId: currentUser.uid,
            };
            await setDoc(doc(db, 'sessions', session.id), docData);
            return true;
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
        }
    }

    return { saveSession };
};