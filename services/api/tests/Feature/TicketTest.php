<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\SchoolSettingSeeder::class);
        $this->seed(\Database\Seeders\BranchSeeder::class);
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->seed(\Database\Seeders\PermissionSeeder::class);
    }

    public function test_parent_can_create_ticket()
    {
        $parent = User::factory()->create(['user_type' => 'PARENT']);
        $parent->roles()->attach(Role::where('name', 'Parent')->first()->id);
        // Link child
        $guardian = $parent->guardian()->create();
        $student = \App\Models\Student::create(['full_name' => 'Kid', 'student_code' => 'K']);
        $guardian->students()->attach($student->id, ['relationship' => 'FATHER']);

        // Create Category usually seeded
        \App\Models\TicketCategory::create(['name_en' => 'General']);

        $payload = [
            'category_id' => 1,
            'student_id' => $student->id,
            'subject' => 'Request',
            'message' => 'Help me',
            'priority' => 'MEDIUM'
        ];

        $res = $this->actingAs($parent)->postJson('/api/v1/tickets', $payload);
        $res->assertStatus(201);
        $this->assertDatabaseHas('tickets', ['subject' => 'Request', 'status' => 'OPEN']);
        $this->assertDatabaseHas('ticket_messages', ['message_text' => 'Help me']);
        $this->assertDatabaseHas('timeline_events', ['event_type' => 'TicketCreated']);
    }

    public function test_staff_access_rules()
    {
        // 1. Create Ticket by Parent
        $parent = User::factory()->create(['user_type' => 'PARENT']);
        $parent->roles()->attach(Role::where('name', 'Parent')->first()->id);
        $cat = \App\Models\TicketCategory::create(['name_en' => 'General']);

        $ticket = \App\Models\Ticket::create([
            'ticket_code' => 'T1',
            'category_id' => $cat->id,
            'branch_id' => 1,
            'created_by_user_id' => $parent->id,
            'status' => 'OPEN',
            'subject' => 'S1'
        ]);

        // 2. Staff in Branch 1
        $staff1 = User::factory()->create(['user_type' => 'STAFF']);
        $staff1->roles()->attach(Role::where('name', 'Teacher')->first()->id, ['branch_id' => 1]);

        $res = $this->actingAs($staff1)->getJson("/api/v1/tickets/{$ticket->id}");
        $res->assertStatus(200);

        // 3. Staff in Branch 2 -> Forbidden
        // Ensure Branch 2 exists first. BranchSeeder creates 2 typically? 
        // Let's create explicitly to be safe.
        $branch2 = \App\Models\Branch::create(['name' => 'B2', 'code' => 'B2', 'is_main' => false]);

        $staff2 = User::factory()->create(['user_type' => 'STAFF']);
        $staff2->roles()->attach(Role::where('name', 'Teacher')->first()->id, ['branch_id' => $branch2->id]);

        $res = $this->actingAs($staff2)->getJson("/api/v1/tickets/{$ticket->id}");
        $res->assertStatus(403);
    }

    public function test_resolve_flow()
    {
        $admin = User::factory()->create(['user_type' => 'STAFF']);
        $admin->roles()->attach(Role::where('name', 'OfficeAdmin')->first()->id, ['branch_id' => 1]);

        $cat = \App\Models\TicketCategory::create(['name_en' => 'General']);
        $ticket = \App\Models\Ticket::create([
            'ticket_code' => 'T1',
            'category_id' => $cat->id,
            'branch_id' => 1,
            'created_by_user_id' => $admin->id, // self created for ease
            'status' => 'OPEN',
            'subject' => 'S1'
        ]);

        $res = $this->actingAs($admin)->postJson("/api/v1/tickets/{$ticket->id}/status", ['status' => 'RESOLVED']);
        $res->assertStatus(200);

        $this->assertDatabaseHas('tickets', ['id' => $ticket->id, 'status' => 'RESOLVED']);
        $this->assertDatabaseHas('ticket_status_history', ['new_status' => 'RESOLVED']);
    }
}
