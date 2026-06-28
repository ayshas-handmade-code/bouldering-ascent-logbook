import { ClimbingSession } from "./types";

// Firebase imports
import { User } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, query, setDoc, where } from 'firebase/firestore';

export function getLocations(currentUser) {
    const locRef = collection(db, 'locations');
    return query(locRef, where('userId', '==', currentUser?.uid));
}

// Callback handler: Create or Edit climbing session in Firestore
export const handleSaveSession = async (currentUser: User, savedSession: ClimbingSession) => {
    if (!currentUser) return;
    const path = `sessions/${savedSession.id}`;
    try {
        const docData = {
            ...savedSession,
            userId: currentUser.uid,
        };
        console.log("Saving session: ", docData);
        await setDoc(doc(db, 'sessions', savedSession.id), docData);
        console.log("Session saved successfully to db!")
    } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
    }
};