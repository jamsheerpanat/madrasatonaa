<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Services\FileStorageService;
use App\Services\FileAccessPolicy;
use App\Helpers\AuthContext;
use Illuminate\Http\Request;

class FileController extends Controller
{
    protected $storage;
    protected $policy;

    public function __construct(FileStorageService $storage, FileAccessPolicy $policy)
    {
        $this->storage = $storage;
        $this->policy = $policy;
    }

    public function initUpload(Request $request)
    {
        $data = $request->validate([
            'original_name' => 'required|string',
            'mime_type' => 'required|string',
            'size_bytes' => 'required|integer',
            'purpose' => 'required|string'
        ]);

        // Generate S3 params
        $meta = $this->storage->initUpload($data['original_name'], $data['mime_type']);

        // Create Pending File Record
        $file = File::create([
            'storage_disk' => 's3',
            'bucket' => $meta['bucket'],
            'object_key' => $meta['key'],
            'original_name' => $data['original_name'],
            'mime_type' => $data['mime_type'],
            'size_bytes' => $data['size_bytes'],
            'uploaded_by_user_id' => AuthContext::user()->id,
            'visibility' => 'PRIVATE'
        ]);

        return response()->json([
            'file_id' => $file->id,
            'object_key' => $meta['key'],
            'upload_url' => $meta['upload_url']
        ]);
    }

    public function finalize(Request $request)
    {
        $request->validate(['file_id' => 'required|exists:files,id']);
        $file = File::findOrFail($request->file_id);

        if ($file->uploaded_by_user_id !== AuthContext::user()->id)
            abort(403);

        // Verify existence
        if (!$this->storage->exists($file->object_key)) {
            return response()->json(['error' => 'not_found_in_storage'], 400);
        }

        // Update size checks if needed? 
        // For now assume trusted client flow MVP.

        return response()->json(['status' => 'ready', 'file' => $file]);
    }

    public function getDownloadUrl(int $id)
    {
        $file = File::findOrFail($id);

        // Policy Check
        if (!$this->policy->canAccess(AuthContext::user(), $file)) {
            abort(403, 'Access Denied');
        }

        return response()->json([
            'download_url' => $this->storage->getDownloadUrl($file)
        ]);
    }
}
