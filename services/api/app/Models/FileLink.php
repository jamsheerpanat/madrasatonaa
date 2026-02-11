<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FileLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_id',
        'entity_type',
        'entity_id',
        'purpose'
    ];

    public function file()
    {
        return $this->belongsTo(File::class);
    }

    public function entity()
    {
        return $this->morphTo();
    }
}
