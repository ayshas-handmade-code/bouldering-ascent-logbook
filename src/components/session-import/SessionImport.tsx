import { useRef } from "react";
import { Upload } from "lucide-react";
import { parseCSV } from "@/src/utils";

interface SessionImporterProps {
}

export default function SessionImporter({
}: SessionImporterProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    }

    const importSessions = async () => {
        const file = fileInputRef.current?.files[0];
        const fileContent = await file.text();
        const sessions = parseCSV(fileContent);
        console.log('Selected file:', sessions);
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