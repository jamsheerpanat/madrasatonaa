
'use client';

import { useState } from 'react';
import { fileService } from '../../services/files';
import { Paperclip } from 'lucide-react';

export function FilePicker({ onFileUploaded, purpose }: { onFileUploaded: (fileId: number) => void, purpose: string }) {
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState('');

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        setUploading(true);

        try {
            // 1. Init
            const init = await fileService.initUpload(file, purpose);
            // 2. Upload
            await fileService.uploadToS3(init.upload_url, file);
            // 3. Finalize
            await fileService.finalize(init.file_id);

            setFileName(file.name);
            onFileUploaded(init.file_id);
        } catch (err) {
            alert('Upload failed');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded flex items-center gap-2 text-sm text-gray-700">
                <Paperclip size={16} />
                {uploading ? 'Uploading...' : 'Attach File'}
                <input type="file" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
            {fileName && <span className="text-sm text-green-600 truncate max-w-xs">{fileName} attached</span>}
        </div>
    );
}
