<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'storage_disk',
        'bucket',
        'object_key',
        'original_name',
        'mime_type',
        'size_bytes',
        'checksum_sha256',
        'uploaded_by_user_id',
        'visibility'
    ];

    public function links()
    {
        return $this->hasMany(FileLink::class);
    }
}
