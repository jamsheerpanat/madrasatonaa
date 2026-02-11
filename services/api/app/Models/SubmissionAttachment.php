<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubmissionAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'file_url',
        'file_name',
        'mime_type'
    ];
}
