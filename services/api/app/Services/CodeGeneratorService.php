<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CodeGeneratorService
{
    /**
     * Generate a unique code for a given model and column.
     * 
     * @param string $model The model class name (e.g., \App\Models\StaffProfile::class)
     * @param string $prefix The prefix for the code (e.g., 'EMP')
     * @param string $column The column name to check for uniqueness (default: 'employee_code')
     * @param int $padding The number of digits to pad (default: 4)
     * @return string
     */
    public function generate(string $model, string $prefix, string $column = 'code', int $padding = 4): string
    {
        // Find the latest record to increment
        $latest = $model::where($column, 'like', "{$prefix}-%")
            ->orderByRaw("CAST(SUBSTRING($column, " . (strlen($prefix) + 2) . ") AS UNSIGNED) DESC")
            ->first();

        if (!$latest) {
            return $prefix . '-' . str_pad('1', $padding, '0', STR_PAD_LEFT);
        }

        // Extract the number part
        $lastCode = $latest->{$column};
        $parts = explode('-', $lastCode);
        $number = end($parts);

        $nextNumber = intval($number) + 1;

        return $prefix . '-' . str_pad((string) $nextNumber, $padding, '0', STR_PAD_LEFT);
    }
}
