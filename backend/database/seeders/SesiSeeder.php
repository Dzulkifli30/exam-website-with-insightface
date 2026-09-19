<?php

namespace Database\Seeders;

use App\Models\Sesi;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SesiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 1; $i <= 4; $i++) {
            $waktu_mulai = ($i % 2 !== 0) ? '06:00:00' : '10:00:00';
            $waktu_selesai = ($i % 2 !== 0) ? '09:00:00' : '13:00:00';

            // Tanggal berubah setelah kelipatan 2 mulai dari 20 April 2026
            $dayOffset = ceil($i / 2) - 1;
            $tanggal_sesi = date('Y-m-d', strtotime("2026-04-20 + {$dayOffset} days"));

            Sesi::create([
                'nama_sesi' => 'Sesi ' . $i,
                'tanggal_sesi' => $tanggal_sesi,
                'waktu_mulai' => $waktu_mulai,
                'waktu_selesai' => $waktu_selesai,
            ]);
        }
    }
}
