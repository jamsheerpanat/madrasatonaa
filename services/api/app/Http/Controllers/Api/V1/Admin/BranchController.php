<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Services\CodeGeneratorService;

class BranchController extends Controller
{
    protected $codeGenerator;

    public function __construct(CodeGeneratorService $codeGenerator)
    {
        $this->codeGenerator = $codeGenerator;
    }

    /**
     * Update an existing branch.
     */
    public function update(Request $request, int $branch): JsonResponse
    {
        $branchModel = Branch::findOrFail($branch);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|string|unique:branches,code,' . $branch,
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'is_active' => 'sometimes|boolean',
        ]);

        $branchModel->update($validated);

        return response()->json([
            'message' => 'Branch updated successfully',
            'branch' => $branchModel
        ]);
    }

    /**
     * Store a new branch.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|unique:branches,code',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['code'])) {
            $validated['code'] = $this->codeGenerator->generate(Branch::class, 'BR', 'code', 3);
        }

        $branch = Branch::create($validated);

        return response()->json([
            'message' => 'Branch created successfully',
            'branch' => $branch
        ], 201);
    }

    /**
     * Remove a branch.
     */
    public function destroy(int $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);

        // Check if branch has grades or subjects
        if ($branch->grades()->count() > 0 || $branch->subjects()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete branch with existing grades or subjects'
            ], 422);
        }

        $branch->delete();

        return response()->json([
            'message' => 'Branch deleted successfully'
        ]);
    }
}
