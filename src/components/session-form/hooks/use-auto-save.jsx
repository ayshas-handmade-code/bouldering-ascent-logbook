import { useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function useAutoSave(handleSave) {
    useEffect(() => {
        // Skip saving on the initial mount if there's nothing to save
        // if (text === initialData) return;

        // 1. Debounce: Set a timer to save 2 seconds after the last keystroke
        const handler = setTimeout(async () => {
            console.log("Saving.....")

            try {
                await handleSave();
                console.log("Save Successful!")
            } catch (error) {
                console.error('Error saving document:', error);
            }
        }, 2000);
    }, []);

    return handler;
}