<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mirip;
use App\Models\Peserta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MiripController extends Controller
{
    private function cosineSimilarity($a, $b)
    {
        $dot = 0;
        $normA = 0;
        $normB = 0;

        $len = count($a);

        for ($i = 0; $i < $len; $i++) {
            $dot += $a[$i] * $b[$i];
            $normA += $a[$i] * $a[$i];
            $normB += $b[$i] * $b[$i];
        }

        return $dot / (sqrt($normA) * sqrt($normB));
    }

    public function verifikasiUjian(Request $request)
    {
        $threshold = 0.6;

        if (!$request->hasFile('image')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gambar tidak ditemukan'
            ], 400);
        }

        $user = $request->user(); // atau ambil peserta sesuai sistem kamu
        $peserta = Peserta::where('user_id', $user->id)->first();

        if (!$peserta || !$peserta->embedding) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data embedding tidak ditemukan'
            ], 400);
        }

        $response = Http::attach(
            'image',
            file_get_contents($request->file('image')->getRealPath()),
            'image.jpg'
        )->post(env('INSIGHTFACE_URL') . '/embedding');

        if (!$response->successful()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses embedding'
            ], 500);
        }

        $data = $response->json();

        if (isset($data['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Wajah tidak terdeteksi'
            ]);
        }

        $embeddingBaru = $data['embedding'];
        $embeddingDatabase = json_decode($peserta->embedding, true);

        $similarity = $this->cosineSimilarity($embeddingBaru, $embeddingDatabase);

        if ($similarity >= $threshold) {
            return response()->json([
                'status' => 'success',
                'embedding_terverifikasi' => $embeddingBaru,
                'similarity' => $similarity
            ]);
        }

        return response()->json([
            'status' => 'failed',
            'similarity' => $similarity
        ]);
    }

    public function bandingSesiEmbedding()
    {
        $threshold = 0.5;
        $results = [];

        $pesertas = Peserta::whereNotNull('embedding')->get()->groupBy('sesi_id');
        $sesiIds = $pesertas->keys()->values();

        for ($i = 0; $i < $sesiIds->count(); $i++) {
            for ($j = $i + 1; $j < $sesiIds->count(); $j++) {

                $sesiA = $sesiIds[$i];
                $sesiB = $sesiIds[$j];

                foreach ($pesertas[$sesiA] as $pesertaA) {
                    foreach ($pesertas[$sesiB] as $pesertaB) {

                        $embeddingA = json_decode($pesertaA->embedding, true);
                        $embeddingB = json_decode($pesertaB->embedding, true);
                        if (
                            !is_array($embeddingA) ||
                            !is_array($embeddingB) ||
                            count($embeddingA) !== count($embeddingB)
                        ) {
                            continue;
                        }

                        $similarity = $this->cosineSimilarity($embeddingA, $embeddingB);

                        if ($similarity >= $threshold) {
                            $results[] = Mirip::create([
                                'peserta_1' => $pesertaA->id,
                                'peserta_2' => $pesertaB->id,
                                'similarity_score' => round($similarity, 4),
                                'sesi_1' => $sesiA,
                                'sesi_2' => $sesiB,
                            ]);
                        }
                    }
                }
            }
        }

        return response()->json([
            'status' => 'ok',
            'total_ditemukan' => count($results),
            'deteksi' => $results
        ]);
    }


    public function deteksiSemuaSesi()
    {
        // Mulai timer (dalam detik, presisi microseconds)
        $start = microtime(true);

        // Ambil semua sesi unik
        $sesiList = Peserta::select('sesi_id')->distinct()->pluck('sesi_id')->toArray();

        $hasil = [];

        // Loop sesi pertama → sesi berikutnya (tanpa ulang)
        for ($i = 0; $i < count($sesiList); $i++) {
            for ($j = $i + 1; $j < count($sesiList); $j++) {

                $sesiA = $sesiList[$i];
                $sesiB = $sesiList[$j];

                // Ambil peserta per sesi
                $pesertaA = Peserta::where('sesi_id', $sesiA)->get();
                $pesertaB = Peserta::where('sesi_id', $sesiB)->get();

                foreach ($pesertaA as $pa) {
                    foreach ($pesertaB as $pb) {

                        // Kirim gambar ke InsightFace API
                        $response = Http::attach(
                            'image1',
                            file_get_contents(storage_path('app/public/' . $pa->image)),
                            $pa->image
                        )->attach(
                            'image2',
                            file_get_contents(storage_path('app/public/' . $pb->image)),
                            $pb->image
                        )->post(env('INSIGHTFACE_URL') . '/compare');

                        $data = $response->json();

                        if (!$response->successful() || !isset($data['similarity'])) {
                            continue;
                        }

                        // Jika similarity > 0.5 → simpan
                        if ($data['similarity'] > 0.5) {
                            $hasil[] = Mirip::create([
                                'peserta_1' => $pa->id,
                                'peserta_2' => $pb->id,
                                'similarity_score' => $data['similarity'],
                                'sesi_1' => $sesiA,
                                'sesi_2' => $sesiB,
                            ]);
                        }
                    }
                }
            }
        }

        // Selesai → hitung waktu eksekusi
        $end = microtime(true);
        $durasi = $end - $start; // detik

        return response()->json([
            'status' => 'ok',
            'total_ditemukan' => count($hasil),
            'waktu_eksekusi_detik' => round($durasi, 3),
            'waktu_eksekusi_menit' => round($durasi / 60, 2),
            'deteksi' => $hasil
        ]);
    }
    public function index()
    {
        return Mirip::with([
            'peserta1',
            'peserta1.sesi',
            'peserta1.user:id,status',
            'peserta2',
            'peserta2.sesi',
            'peserta2.user:id,status'
        ])->latest()->get();
    }

    public function show($id)
    {
        return Mirip::with(['peserta1', 'peserta1.sesi', 'peserta1.user:id,status', 'peserta2', 'peserta2.sesi', 'peserta2.user:id,status'])->findOrFail($id);
    }

    public function deteksi($id)
    {
        $pesertaUtama = Peserta::findOrFail($id);
        $semuaPeserta = Peserta::where('id', '!=', $id)->get();
        $hasil = [];

        foreach ($semuaPeserta as $p) {

            $response = Http::attach(
                'image1',
                file_get_contents(storage_path('app/public/' . $pesertaUtama->image)),
                $pesertaUtama->image
            )->attach(
                'image2',
                file_get_contents(storage_path('app/public/' . $p->image)),
                $p->image
            )->post(env('INSIGHTFACE_URL') . '/compare');

            $data = $response->json();

            // Cek error dari InsightFace API
            if (!$response->successful() || isset($data['error'])) {
                continue;
            }

            // Pastikan similarity ada
            if (!isset($data['similarity'])) {
                continue;
            }

            // Cek threshold
            if ($data['similarity'] > 0.5) {
                $hasil[] = Mirip::create([
                    'peserta_1' => $pesertaUtama->id,
                    'peserta_2' => $p->id,
                    'similarity_score' => $data['similarity'],
                ]);
            }
        }

        return response()->json([
            'status' => 'ok',
            'deteksi' => $hasil
        ]);
    }

    public function deteksiKelas($id)
    {
        // Ambil peserta dalam kelas yang dipilih
        $pesertaKelas = Peserta::where('kelas_id', $id)->get();

        // Ambil peserta dari kelas lain
        $pesertaLain = Peserta::where('kelas_id', '!=', $id)->get();

        $hasil = [];

        foreach ($pesertaKelas as $pk) {
            foreach ($pesertaLain as $pl) {

                // Kirim gambar ke InsightFace API
                $response = Http::attach(
                    'image1',
                    file_get_contents(storage_path('app/public/' . $pk->image)),
                    $pk->image
                )->attach(
                    'image2',
                    file_get_contents(storage_path('app/public/' . $pl->image)),
                    $pl->image
                )->post(env('INSIGHTFACE_URL') . '/compare');

                $data = $response->json();

                // Skip kalau error
                if (!$response->successful() || isset($data['error'])) {
                    continue;
                }

                if (!isset($data['similarity'])) {
                    continue;
                }

                // Jika di atas threshold → simpan
                if ($data['similarity'] > 0.5) {
                    $hasil[] = Mirip::create([
                        'peserta_1' => $pk->id,
                        'peserta_2' => $pl->id,
                        'similarity_score' => $data['similarity'],
                    ]);
                }
            }
        }

        return response()->json([
            'status' => 'ok',
            'deteksi' => $hasil
        ]);
    }

    public function deteksiSemuaKelas()
    {
        // Ambil semua kelas unik
        $kelasList = Peserta::select('kelas_id')->distinct()->pluck('kelas_id')->toArray();

        $hasil = [];

        // Loop kelas pertama → kelas berikutnya (tanpa ulang)
        for ($i = 0; $i < count($kelasList); $i++) {
            for ($j = $i + 1; $j < count($kelasList); $j++) {

                $kelasA = $kelasList[$i];
                $kelasB = $kelasList[$j];

                // Ambil peserta per kelas
                $pesertaA = Peserta::where('kelas_id', $kelasA)->get();
                $pesertaB = Peserta::where('kelas_id', $kelasB)->get();

                foreach ($pesertaA as $pa) {
                    foreach ($pesertaB as $pb) {

                        // Kirim gambar ke InsightFace API
                        $response = Http::attach(
                            'image1',
                            file_get_contents(storage_path('app/public/' . $pa->image)),
                            $pa->image
                        )->attach(
                            'image2',
                            file_get_contents(storage_path('app/public/' . $pb->image)),
                            $pb->image
                        )->post(env('INSIGHTFACE_URL') . '/compare');

                        $data = $response->json();

                        if (!$response->successful() || !isset($data['similarity'])) {
                            continue;
                        }

                        // Jika similarity > 0.5 → simpan
                        if ($data['similarity'] > 0.5) {
                            $hasil[] = Mirip::create([
                                'peserta_1' => $pa->id,
                                'peserta_2' => $pb->id,
                                'similarity_score' => $data['similarity'],
                                'kelas_1' => $kelasA,
                                'kelas_2' => $kelasB,
                            ]);
                        }
                    }
                }
            }
        }

        return response()->json([
            'status' => 'ok',
            'deteksi' => $hasil
        ]);
    }



    public function tesEmbedding(Request $request)
    {
        // dd($request->all());
        $response = Http::attach(
            'image',
            file_get_contents($request->file('image')->getRealPath()),
            $request->file('image')->getClientOriginalName()
        )->post(env('INSIGHTFACE_URL') . '/embedding');

        // dd($response->json());
        $data = $response->json();

        return response()->json([
            'status' => 'ok',
            'embedding' => $data,
        ]);
    }

    public function deteksiEmbeddingSesi()
    {
        $sesiList = Peserta::select('sesi_id')->distinct()->pluck('sesi_id')->toArray();
        $hasil = [];
    }


    public function deteksisemua()
    {
        $semuaPeserta = Peserta::all();
        $hasil = [];

        foreach ($semuaPeserta as $pesertaUtama) {
            foreach ($semuaPeserta as $p) {
                if ($pesertaUtama->id == $p->id) {
                    continue;
                }

                $response = Http::attach(
                    'image1',
                    file_get_contents(storage_path('app/public/' . $pesertaUtama->image)),
                    $pesertaUtama->image
                )->attach(
                    'image2',
                    file_get_contents(storage_path('app/public/' . $p->image)),
                    $p->image
                )->post(env('INSIGHTFACE_URL') . '/compare');

                $data = $response->json();

                // Cek error dari InsightFace API
                if (!$response->successful() || isset($data['error'])) {
                    continue;
                }

                // Pastikan similarity ada
                if (!isset($data['similarity'])) {
                    continue;
                }

                // Cek threshold
                if ($data['similarity'] > 0.5) {
                    $hasil[] = Mirip::create([
                        'peserta_1' => $pesertaUtama->id,
                        'peserta_2' => $p->id,
                        'similarity_score' => $data['similarity'],
                    ]);
                }
            }
        }

        return response()->json([
            'status' => 'ok',
            'deteksi' => $hasil
        ]);
    }

    function deleteAll()
    {
        Mirip::truncate();
        return response()->json([
            'status' => 'ok',
            'message' => 'Semua data mirip telah dihapus'
        ]);
    }
}
