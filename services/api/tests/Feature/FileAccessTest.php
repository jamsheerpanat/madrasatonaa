<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\File;
use App\Models\FileLink;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FileAccessTest extends TestCase
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

    public function test_parent_cannot_access_others_files()
    {
        Storage::fake('s3');

        $p1 = User::factory()->create(['user_type' => 'PARENT']);
        $p1->roles()->attach(Role::where('name', 'Parent')->first()->id);

        $p2 = User::factory()->create(['user_type' => 'PARENT']);
        $p2->roles()->attach(Role::where('name', 'Parent')->first()->id);

        $file = File::create([
            'storage_disk' => 's3',
            'bucket' => 'test',
            'object_key' => 'k1',
            'original_name' => 'f1.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 100,
            'uploaded_by_user_id' => $p1->id
        ]);

        // P2 tries to access P1's file (no links yet, relying on uploader check or fail)
        // Access Policy defaults to false unless uploader or linked.
        $res = $this->actingAs($p2)->getJson("/api/v1/files/{$file->id}/download-url");
        $res->assertStatus(403);

        // P1 accesses own file
        $res = $this->actingAs($p1)->getJson("/api/v1/files/{$file->id}/download-url");
        $res->assertStatus(200);
    }

    public function test_linked_access()
    {
        Storage::fake('s3');
        $parent = User::factory()->create(['user_type' => 'PARENT']);

        // Ticket created by Parent
        $ticket = \App\Models\Ticket::create([
            'ticket_code' => 'T1',
            'category_id' => 1,
            'branch_id' => 1,
            'created_by_user_id' => $parent->id,
            'status' => 'OPEN',
            'subject' => 'S1'
        ]);

        $msg = \App\Models\TicketMessage::create(['ticket_id' => $ticket->id, 'sender_user_id' => $parent->id, 'message_text' => 'Hi']);

        $file = File::create([
            'storage_disk' => 's3',
            'bucket' => 'test',
            'object_key' => 'k2',
            'original_name' => 'f2.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 100,
            'uploaded_by_user_id' => $parent->id
        ]);

        FileLink::create([
            'file_id' => $file->id,
            'entity_type' => \App\Models\TicketMessage::class,
            'entity_id' => $msg->id,
            'purpose' => 'TICKET_ATTACHMENT'
        ]);

        // Staff Access
        $staff = User::factory()->create(['user_type' => 'STAFF']);
        $staff->roles()->attach(Role::where('name', 'Teacher')->first()->id, ['branch_id' => 1]);

        $res = $this->actingAs($staff)->getJson("/api/v1/files/{$file->id}/download-url");
        $res->assertStatus(200);

        // Other Staff
        $staff2 = User::factory()->create(['user_type' => 'STAFF']);
        $branch2 = \App\Models\Branch::create(['name' => 'B2', 'code' => 'B2', 'is_main' => false]);
        $staff2->roles()->attach(Role::where('name', 'Teacher')->first()->id, ['branch_id' => $branch2->id]);

        $res = $this->actingAs($staff2)->getJson("/api/v1/files/{$file->id}/download-url");
        $res->assertStatus(403);
    }
}
