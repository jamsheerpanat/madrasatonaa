<?php

namespace App\Services;

use App\Models\PeriodTemplate;
use Illuminate\Validation\ValidationException;

class PeriodTemplateService
{
    public function getActiveTemplate(int $branchId)
    {
        return PeriodTemplate::where('branch_id', $branchId)
            ->where('is_active', true)
            ->latest()
            ->first();
    }

    public function upsertActiveTemplate(int $branchId, int $periodsPerDay, ?array $periodTimes = [])
    {
        if ($periodsPerDay < 1 || $periodsPerDay > 12) {
            throw ValidationException::withMessages(['periods_per_day' => 'Periods per day must be between 1 and 12']);
        }

        // Deactivate old active templates
        PeriodTemplate::where('branch_id', $branchId)
            ->update(['is_active' => false]);

        // Create new active template
        return PeriodTemplate::create([
            'branch_id' => $branchId,
            'periods_per_day' => $periodsPerDay,
            'period_times_json' => $periodTimes,
            'is_active' => true,
        ]);
    }
}
