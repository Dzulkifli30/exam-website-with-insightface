<?php

namespace Database\Seeders;

use App\Models\Peserta;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;

class PesertaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        for ($i = 1; $i <= 10; $i++) {
            // for ($i = 1; $i <= 150; $i++) {
            // for ($i = 1; $i <= 500; $i++) {
            // for ($i = 1; $i <= 1500; $i++) {
            // for ($i = 1; $i <= 5000; $i++) {
            // for ($i = 1; $i <= 10000; $i++) {
            // for ($i = 1; $i <= 13000; $i++) {

            // Penentuan sesi
            $sesi = (($i - 1) % 4) + 1;

            $imageName = "foto_{$i}.jpg";
            $imagePath = public_path("storage/images/peserta/{$imageName}");

            if (!file_exists($imagePath)) {
                $imageName = "{$i}.jpg";
                $imagePath = public_path("storage/images/peserta/{$imageName}");
            }

            if (!file_exists($imagePath)) {
                continue;
            }

            $response = Http::attach(
                'image',
                file_get_contents($imagePath),
                $imageName
            )->post(env('INSIGHTFACE_URL') . '/embedding');

            if (!$response->successful()) {
                continue;
            }

            $embedding = $response->json('embedding');

            if (!$embedding) {
                continue;
            }

            Peserta::create([
                'name' => 'Peserta ' . $i,
                'nisn' => 100000 + $i,
                'tanggal_lahir' => '2005-01-' . str_pad(($i % 28) + 1, 2, '0', STR_PAD_LEFT),
                'asal_sekolah' => 'Sekolah ' . chr(64 + (($i % 5) + 1)),
                'lokasi_ujian' => match ($i % 4) {
                    0 => 'Jawa Barat',
                    1 => 'Jawa Tengah',
                    2 => 'Jawa Timur',
                    3 => 'Bali',
                },
                'image' => "images/peserta/{$imageName}",
                'embedding' => json_encode($embedding),
                'user_id' => $i + 1,
                'sesi_id' => $sesi,
            ]);
        }
    }
}
