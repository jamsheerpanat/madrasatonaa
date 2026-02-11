<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'term_id',
        'student_id',
        'generated_at',
        'generated_by_user_id',
        'html_snapshot',
        'pdf_url'
    ];

    protected $casts = [
        'generated_at' => 'datetime'
    ];
}
