<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Ujian;

class UjianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Add a sample Ujian
        $ujian = Ujian::create([
            'nama_ujian' => 'Ujian Try Out SNBT 2026',
            'kode_ujian' => 'TOSNBT2026',
            'deskripsi' => 'Ini adalah ujian try out untuk SNBT 2026.',
            'waktu_mulai' => now(),
            'waktu_selesai' => now()->addMinutes(120),
            'durasi' => 120,
        ]);

        // Add Soal Ujians
        $soals = [
            [
                'pertanyaan' => 'PENYAKIT : PANTOLOGI = ... : CUACA',
                'pilihan_a' => 'Meteorologi',
                'pilihan_b' => 'Klimatologi',
                'pilihan_c' => 'Hidrologi',
                'pilihan_d' => 'Oseanografi',
                'pilihan_e' => 'Geomorfologi',
                'jawaban_benar' => 'A',
                'bobot_nilai' => 20,
            ],
            [
                'pertanyaan' => 'KOMPETISI : KOPERSI = ... : RIVAL',
                'pilihan_a' => 'Lama',
                'pilihan_b' => 'Musuh',
                'pilihan_c' => 'Kawan',
                'pilihan_d' => 'Dagang',
                'pilihan_e' => 'Lawan',
                'jawaban_benar' => 'C',
                'bobot_nilai' => 20,
            ],
            [
                'pertanyaan' => 'GELAP = ...',
                'pilihan_a' => 'Terang',
                'pilihan_b' => 'Malam',
                'pilihan_c' => 'Kelam',
                'pilihan_d' => 'Mendung',
                'pilihan_e' => 'Suram',
                'jawaban_benar' => 'C',
                'bobot_nilai' => 20,
            ],
            [
                'pertanyaan' => 'ADAPTASI = ...',
                'pilihan_a' => 'Penyesuaian',
                'pilihan_b' => 'Perubahan',
                'pilihan_c' => 'Kecocokan',
                'pilihan_d' => 'Kesesuaian',
                'pilihan_e' => 'Keduanya B dan D bisa digunakan',
                'jawaban_benar' => 'A',
                'bobot_nilai' => 20,
            ],
            [
                'pertanyaan' => '100, 95, 85, 70, 50, ...',
                'pilihan_a' => '30',
                'pilihan_b' => '25',
                'pilihan_c' => '20',
                'pilihan_d' => '15',
                'pilihan_e' => '10',
                'jawaban_benar' => 'B',
                'bobot_nilai' => 20,
            ],
        ];

        foreach ($soals as $soal) {
            $ujian->soalUjians()->create($soal);
        }
    }
}
