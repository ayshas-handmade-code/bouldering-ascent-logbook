import { useRef, useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { parseCSV } from "@/src/utils";
import { handleSaveSession } from '@/src/firebase-utils'

// Firebase imports
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from "@/src/firebase";

import useSaveSession from '@/src/components/session-form/hooks/use-save-session';

interface SessionImporterProps {
}

export default function SessionImporter({
}: SessionImporterProps
) {
    const { saveSessionToDb } = useSaveSession();

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

    // file upload functions
    const fileInputRef = useRef<HTMLInputElement>(null);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    }

    const resetFileInput = () => {
        fileInputRef.current.value = '';
    }

    const importSessions = async () => {
        const file = fileInputRef.current?.files[0];
        const fileContent = await file.text();
        const sessions = parseCSV(fileContent);

        console.log('Selected file:', sessions);

        sessions.forEach(async (session) => {
            console.log('Importing Session', session);
            saveSessionToDb(session);
        });

        resetFileInput();
    }

    return (
        <div>
            {/* CSV Upload Action */}
            <button
                id="btn-import-csv"
                onClick={triggerFileInput}
                title="Upload CSV Backup"
                className="px-3 py-2.5 bg-sky-accent/20 hover:bg-sky-accent/30 text-choco-dark rounded-full border border-sky-accent/50 transition-all font-display font-bold text-[10px] flex items-center gap-1 active:scale-95 shadow-3xs"
            >
                <Upload className="w-3.5 h-3.5 text-choco-dark" />
                Import
            </button>
            <input type="file"
                id="fileInputField"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={importSessions}
                accept=".csv"
            />
        </div>
    );
}