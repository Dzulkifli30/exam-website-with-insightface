<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ujian;
use App\Models\JawabanUjian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UjianController extends Controller
{
    public function index()
    {
        $ujians = Ujian::get();
        return response()->json([
            'status' => 'success',
            'data' => $ujians
        ]);
    }

    public function fpc()
    {
        $ujians = Ujian::where('id', '>=', 4)->get();
        return response()->json([
            'status' => 'success',
            'data' => $ujians
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_ujian' => 'required|string|max:255',
            'kode_ujian' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'waktu_mulai' => 'required|date',
            'waktu_selesai' => 'required|date|after:waktu_mulai',
            'durasi' => 'required|integer|min:1',
            'soal_ujians' => 'required|array|min:1',
            'soal_ujians.*.pertanyaan' => 'required|string',
            'soal_ujians.*.pilihan_a' => 'required|string',
            'soal_ujians.*.pilihan_b' => 'required|string',
            'soal_ujians.*.pilihan_c' => 'required|string',
            'soal_ujians.*.pilihan_d' => 'required|string',
            'soal_ujians.*.pilihan_e' => 'nullable|string',
            'soal_ujians.*.jawaban_benar' => 'required|string|max:1',
            'soal_ujians.*.bobot_nilai' => 'required|numeric',
        ]);

        try {
            DB::beginTransaction();

            $ujian = Ujian::create([
                'nama_ujian' => $request->nama_ujian,
                'kode_ujian' => $request->kode_ujian,
                'deskripsi' => $request->deskripsi,
                'waktu_mulai' => $request->waktu_mulai,
                'waktu_selesai' => $request->waktu_selesai,
                'durasi' => $request->durasi,
            ]);

            foreach ($request->soal_ujians as $soal) {
                $ujian->soalUjians()->create([
                    'pertanyaan' => $soal['pertanyaan'],
                    'pilihan_a' => $soal['pilihan_a'],
                    'pilihan_b' => $soal['pilihan_b'],
                    'pilihan_c' => $soal['pilihan_c'] ?? null,
                    'pilihan_d' => $soal['pilihan_d'] ?? null,
                    'pilihan_e' => $soal['pilihan_e'] ?? null,
                    'jawaban_benar' => strtoupper($soal['jawaban_benar']),
                    'bobot_nilai' => $soal['bobot_nilai'],
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Ujian dan soal berhasil dibuat',
                'data' => $ujian->load('soalUjians')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat ujian dan soal: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, string $id)
    {
        $ujian = Ujian::with(['soalUjians' => function ($query) {
            $query->inRandomOrder();
        }])
            ->findOrFail($id);

        // Hide correct answers if the user is not an admin
        if (!$request->user() || $request->user()->role !== 'admin') {
            $ujian->soalUjians->makeHidden(['jawaban_benar']);
        }

        return response()->json([
            'status' => 'success',
            'data' => $ujian
        ]);
    }

    public function storeSoal(Request $request, string $id)
    {
        $request->validate([
            'pertanyaan' => 'required|string',
            'pilihan_a' => 'required|string',
            'pilihan_b' => 'required|string',
            'pilihan_c' => 'nullable|string',
            'pilihan_d' => 'nullable|string',
            'pilihan_e' => 'nullable|string',
            'jawaban_benar' => 'required|string|max:1',
            'bobot_nilai' => 'required|numeric',
        ]);

        $ujian = Ujian::findOrFail($id);

        $soal = $ujian->soalUjians()->create([
            'pertanyaan' => $request->pertanyaan,
            'pilihan_a' => $request->pilihan_a,
            'pilihan_b' => $request->pilihan_b,
            'pilihan_c' => $request->pilihan_c,
            'pilihan_d' => $request->pilihan_d,
            'pilihan_e' => $request->pilihan_e,
            'jawaban_benar' => strtoupper($request->jawaban_benar),
            'bobot_nilai' => $request->bobot_nilai,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Soal ujian berhasil ditambahkan',
            'data' => $soal
        ], 201);
    }

    public function submitJawaban(Request $request, string $id)
    {
        $request->validate([
            'jawaban' => 'required|array',
            'jawaban.*.soal_ujian_id' => 'required|exists:soal_ujians,id',
            'jawaban.*.jawaban' => 'nullable|string|max:1',
        ]);

        $peserta = $request->user()->peserta;

        if (!$peserta) {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not a valid participant'
            ], 403);
        }

        $ujian = Ujian::with('soalUjians')->findOrFail($id);
        $soals = $ujian->soalUjians->keyBy('id');

        $totalSkor = 0;
        $maxSkor = $soals->sum('bobot_nilai');

        foreach ($request->jawaban as $item) {
            $soalId = $item['soal_ujian_id'];
            $jawabanPeserta = strtoupper($item['jawaban'] ?? '');

            $soal = $soals[$soalId] ?? null;
            if (!$soal) continue;

            $isCorrect = $soal->jawaban_benar === $jawabanPeserta;

            if ($isCorrect) {
                $totalSkor += $soal->bobot_nilai;
            }

            JawabanUjian::updateOrCreate(
                [
                    'soal_ujian_id' => $soalId,
                    'peserta_id' => $peserta->id,
                ],
                [
                    'jawaban' => $jawabanPeserta,
                    'is_correct' => $isCorrect,
                ]
            );
        }

        $nilaiAkhir = $maxSkor > 0 ? ($totalSkor / $maxSkor) * 100 : 0;

        return response()->json([
            'status' => 'success',
            'message' => 'Jawaban berhasil disimpan',
            'data' => [
                'total_skor' => $totalSkor,
                'max_skor' => $maxSkor,
                'nilai_akhir' => round($nilaiAkhir, 2)
            ]
        ]);
    }
}
