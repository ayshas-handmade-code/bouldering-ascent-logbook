import { useState, useEffect } from 'react';

// Firebase imports
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from "@/src/firebase";
import { doc, deleteDoc } from 'firebase/firestore';

export default function useDeleteSession() {
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

    const deleteSessionFromDb = async (id: string) => {
        if (!currentUser) return;

        const path = `sessions/${id}`;
        try {
            await deleteDoc(doc(db, 'sessions', id));
            console.log("Session deleted successfully");
        } catch (error) {
            alert("⚠️ There was an error deleting your session")
            handleFirestoreError(error, OperationType.DELETE, path);
        }
    };

    return { deleteSessionFromDb };
};