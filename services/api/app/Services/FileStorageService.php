<?php

namespace App\Services;

use App\Models\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileStorageService
{
    protected $disk = 's3';

    public function initUpload(string $originalName, string $mimeType)
    {
        // Simple path strategy: YYYY/MM/uuid-original.ext
        $ext = pathinfo($originalName, PATHINFO_EXTENSION);
        $key = date('Y/m') . '/' . Str::uuid() . '.' . $ext;

        // Generate pre-signed URL for PUT
        // Note: For 's3' driver. Local driver doesn't support signed upload URLs easily without extra config.
        // Assuming S3 environment.
        // If local driver (dev), we might just return a direct route or mock?
        // Command requires S3 compatible.

        // In local/testing using 'local' driver, `temporaryUploadUrl` requires specific setup or won't work.
        // We'll trust the requested 'S3-compatible'.

        $client = Storage::disk($this->disk)->getClient();
        $bucket = config('filesystems.disks.s3.bucket');

        // Use standard Storage::temporaryUploadUrl if available in future Laravel versions or use adapter directly.
        // Or simpler: just constructing it if using AWS SDK.
        // Laravel doesn't have `temporaryUploadUrl` out of box for all drivers? 
        // Actually it does for S3.

        // Let's rely on Storage adapter if possible, or assume AWS SDK.
        // S3Client putObject command.
        $cmd = $client->getCommand('PutObject', [
            'Bucket' => $bucket,
            'Key' => $key,
            'ContentType' => $mimeType,
            // 'ACL' => 'private'
        ]);

        $request = $client->createPresignedRequest($cmd, '+20 minutes');
        $uploadUrl = (string) $request->getUri();

        return [
            'key' => $key,
            'upload_url' => $uploadUrl,
            'bucket' => $bucket
        ];
    }

    public function getDownloadUrl(File $file)
    {
        return Storage::disk($file->storage_disk)->temporaryUrl(
            $file->object_key,
            now()->addMinutes(10),
            [
                'ResponseContentDisposition' => 'attachment; filename="' . $file->original_name . '"'
            ]
        );
    }

    public function exists(string $key)
    {
        return Storage::disk($this->disk)->exists($key);
    }

    public function size(string $key)
    {
        return Storage::disk($this->disk)->size($key);
    }
}
