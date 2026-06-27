import { useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

useEffect(() => {
    // Skip saving on the initial mount if there's nothing to save
    // if (text === initialData) return;

    // 1. Debounce: Set a timer to save 2 seconds after the last keystroke
    const handler = setTimeout(async () => {
        // setStatus('Saving...');

        try {
            // 2. Firebase operation: Update the document
            const docRef = doc(db, 'yourCollectionName', documentId);
            await setDoc(docRef, { content: text }, { merge: true });

            setStatus('Saved');
        } catch (error) {
            console.error('Error saving document:', error);
            setStatus('Error');
        }
    }, 2000);

    // 3. Cleanup: Clear timeout if user types again before 2 seconds
    return () => clearTimeout(handler);
}, [text, documentId, initialData]);