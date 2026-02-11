
import { apiClient } from './apiClient';

export interface FileData {
    file_id: number;
    object_key: string;
    upload_url: string;
}

export const fileService = {
    initUpload: async (file: File, purpose: string) => {
        const res = await apiClient('/files/init-upload', {
            method: 'POST',
            body: JSON.stringify({
                original_name: file.name,
                mime_type: file.type,
                size_bytes: file.size,
                purpose
            })
        });
        return await res.json() as FileData;
    },

    uploadToS3: async (uploadUrl: string, file: File) => {
        // Direct PUT to S3
        await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        });
    },

    finalize: async (fileId: number) => {
        await apiClient('/files/finalize', {
            method: 'POST',
            body: JSON.stringify({ file_id: fileId })
        });
    },

    getDownloadUrl: async (fileId: number) => {
        const res = await apiClient(`/files/${fileId}/download-url`);
        return await res.json();
    }
};
