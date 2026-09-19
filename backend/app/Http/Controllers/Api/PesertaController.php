<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Peserta;
use App\Models\Sesi;
use App\Models\Mirip;
use App\Models\KecuranganPeserta;
use App\Models\Ujian;
use App\Models\JawabanUjian;
use App\Models\SoalUjian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PesertaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pesertas = Peserta::with('sesi', 'fotoPeserta', 'user:id,status')
            ->withCount(['kecuranganPesertas', 'miripsAsPeserta1', 'miripsAsPeserta2'])
            ->get()
            ->each(function ($peserta) {
                $peserta->total_mirip = $peserta->mirips_as_peserta1_count + $peserta->mirips_as_peserta2_count;
            })
            ->makeHidden(['embedding', 'mirips_as_peserta1_count', 'mirips_as_peserta2_count']);

        return response()->json($pesertas);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'nisn' => 'required|integer|unique:pesertas,nisn',
            'tanggal_lahir' => 'required|date',
            'asal_sekolah' => 'required|string',
            'image' => 'required|image|mimes:jpg,jpeg,png,gif|max:2048',
        ]);
        $data['user_id'] = $request->user()->id;

        $data['lokasi_ujian'] = match (rand(0, 3)) {
            0 => 'Jawa Barat',
            1 => 'Jawa Tengah',
            2 => 'Jawa Timur',
            3 => 'Bali',
        };

        $randomSesiId = Sesi::inRandomOrder()->value('id');
        $data['sesi_id'] = $randomSesiId;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images/peserta', 'public');
            $data['image'] = $path;
        }

        $response = Http::attach(
            'image',
            file_get_contents($request->file('image')),
            $request->file('image')->getClientOriginalName()
        )->post(env('INSIGHTFACE_URL') . '/embedding');

        if (!$response->successful() || !$response->json('embedding')) {
            return response()->json([
                'message' => 'Gagal memproses gambar: ' . ($response->json('error') ?? 'Tidak dapat menemukan wajah dari gambar, coba gunakan foto lain.')
            ], 400);
        }

        $embedding = $response->json('embedding');
        $data['embedding'] = json_encode($embedding);

        $peserta = Peserta::create($data);
        return response()->json([
            'message' => 'Peserta berhasil disimpan',
            'data' => $peserta
        ], 201);
    }

    public function storebatch(Request $request)
    {
        $dataArray = $request->input('pesertas');
        $createdPesertas = [];

        foreach ($dataArray as $data) {
            $validatedData = validator($data, [
                'name' => 'required|string',
                'email' => 'required|email|unique:pesertas,email',
                'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
            ])->validate();

            if (isset($data['image'])) {
                $imagePath = $data['image']->store('images/peserta', 'public');
                $validatedData['image'] = $imagePath;
            }

            $createdPesertas[] = Peserta::create($validatedData);
        }

        return response()->json([
            'message' => 'Pesertas berhasil disimpan',
            'data' => $createdPesertas
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $peserta = Peserta::with('sesi', 'user:id,status')->findOrFail($id)->makeHidden(['embedding']);

        $mirip = Mirip::where('peserta_1', $id)
            ->orWhere('peserta_2', $id)
            ->with(['peserta1.sesi', 'peserta2.sesi'])
            ->get()
            ->map(function ($item) use ($id) {
                $otherPeserta = $item->peserta_1 == $id ? $item->peserta2 : $item->peserta1;

                if ($otherPeserta) {
                    $otherPeserta->makeHidden(['embedding']);
                }

                return [
                    'id_mirip' => $item->id,
                    'similarity_score' => $item->similarity_score,
                    'peserta' => $otherPeserta,
                ];
            });

        $dataKecurangan = [
            'total_indikasi_kecurangan' => KecuranganPeserta::where('peserta_id', $id)->count(),
            'total_ujian_terdeteksi_kecurangan' => KecuranganPeserta::where('peserta_id', $id)->distinct('ujian_id')->count('ujian_id'),
            'rata_rata_persentase_similarity' => round(KecuranganPeserta::where('peserta_id', $id)->avg('similarity_score') ?? 0, 2),
        ];

        $ujianDilaksanakan = Ujian::where(function ($query) use ($id) {
            $query->whereHas('soalUjians.jawabanUjians', function ($q) use ($id) {
                $q->where('peserta_id', $id);
            })->orWhereHas('kecuranganPesertas', function ($q) use ($id) {
                $q->where('peserta_id', $id);
            });
        })->get()->map(function ($ujian) use ($id) {
            $ujian->jumlah_kecurangan = KecuranganPeserta::where('peserta_id', $id)
                ->where('ujian_id', $ujian->id)
                ->count();

            $ujian->nilai_ujian = (float) JawabanUjian::join('soal_ujians', 'jawaban_ujians.soal_ujian_id', '=', 'soal_ujians.id')
                ->where('jawaban_ujians.peserta_id', $id)
                ->where('soal_ujians.ujian_id', $ujian->id)
                ->where('jawaban_ujians.is_correct', true)
                ->sum('soal_ujians.bobot_nilai');

            $ujian->total_nilai = (float) SoalUjian::where('ujian_id', $ujian->id)->sum('bobot_nilai');

            return $ujian;
        });

        return response()->json([
            'peserta' => $peserta,
            'peserta_mirip' => $mirip,
            'data_kecurangan' => $dataKecurangan,
            'ujian_dilaksanakan' => $ujianDilaksanakan
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $peserta = Peserta::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'nisn' => 'sometimes|required|integer|unique:pesertas,nisn,' . $peserta->id,
            'tanggal_lahir' => 'sometimes|required|date',
            'asal_sekolah' => 'sometimes|required|string',
            // 'lokasi_ujian' => 'sometimes|required|in:Jawa Barat,Jawa Tengah,Jawa Timur,Bali',
            'image' => 'sometimes|required|image|mimes:jpg,jpeg,png,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images/peserta', 'public');
            $data['image'] = $path;

            $response = Http::attach(
                'image',
                file_get_contents($request->file('image')),
                $request->file('image')->getClientOriginalName()
            )->post(env('INSIGHTFACE_URL') . '/embedding');

            if (!$response->successful() || !$response->json('embedding')) {
                return response()->json([
                    'message' => 'Gagal memproses gambar: ' . ($response->json('error') ?? 'Tidak dapat menemukan wajah dari gambar, coba gunakan foto lain.')
                ], 400);
            }

            $embedding = $response->json('embedding');
            $data['embedding'] = json_encode($embedding);
        }

        $peserta->update($data);

        return response()->json([
            'message' => 'Peserta berhasil diperbarui',
            'data' => $peserta
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Menampilkan detail hasil ujian peserta.
     */
    public function detailHasilUjian(string $peserta_id, string $ujian_id)
    {
        $peserta = Peserta::findOrFail($peserta_id);
        
        $ujian = Ujian::with(['soalUjians' => function ($query) use ($peserta_id) {
            $query->with(['jawabanUjians' => function ($q) use ($peserta_id) {
                $q->where('peserta_id', $peserta_id);
            }]);
        }])->findOrFail($ujian_id);

        $detailHasil = [];
        $totalNilaiDidapat = 0;
        $totalNilaiKeseluruhan = 0;
        $jumlahBenar = 0;
        $jumlahSalah = 0;

        foreach ($ujian->soalUjians as $soal) {
            $totalNilaiKeseluruhan += $soal->bobot_nilai;
            
            $jawabanPeserta = $soal->jawabanUjians->first();
            
            $isCorrect = false;
            $jawaban = null;

            if ($jawabanPeserta) {
                $isCorrect = (bool) $jawabanPeserta->is_correct;
                $jawaban = $jawabanPeserta->jawaban;

                if ($isCorrect) {
                    $totalNilaiDidapat += $soal->bobot_nilai;
                    $jumlahBenar++;
                } else {
                    $jumlahSalah++;
                }
            } else {
                $jumlahSalah++; // Tidak dijawab dianggap salah
            }

            $itemHasil = [
                'soal_id' => $soal->id,
                'pertanyaan' => $soal->pertanyaan,
                'pilihan_a' => $soal->pilihan_a,
                'pilihan_b' => $soal->pilihan_b,
                'pilihan_c' => $soal->pilihan_c,
                'pilihan_d' => $soal->pilihan_d,
                'pilihan_e' => $soal->pilihan_e,
                'bobot_nilai' => $soal->bobot_nilai,
                'jawaban_peserta' => $jawaban,
                'is_correct' => $isCorrect,
            ];

            // Menampilkan jawaban benar jika soal dijawab salah atau tidak dijawab
            if (!$isCorrect) {
                $itemHasil['jawaban_benar'] = $soal->jawaban_benar;
            }

            $detailHasil[] = $itemHasil;
        }

        // Hitung jumlah kecurangan peserta pada ujian ini
        $kecuranganUjian = KecuranganPeserta::where('peserta_id', $peserta_id)
            ->where('ujian_id', $ujian_id)
            ->get();

        $jumlahKecurangan = $kecuranganUjian->count();

        // Tentukan status kecurangan berdasarkan modus (yang paling sering muncul)
        $statusKecurangan = 'aman'; // default jika tidak ada data kecurangan
        if ($jumlahKecurangan > 0) {
            $statusKecurangan = $kecuranganUjian
                ->groupBy('status')
                ->sortByDesc(fn($group) => $group->count())
                ->keys()
                ->first();
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'peserta' => [
                    'id' => $peserta->id,
                    'name' => $peserta->name,
                    'nisn' => $peserta->nisn,
                ],
                'ujian' => [
                    'id' => $ujian->id,
                    'nama_ujian' => $ujian->nama_ujian,
                    'kode_ujian' => $ujian->kode_ujian,
                    'jumlah_kecurangan' => $jumlahKecurangan,
                    'status_kecurangan' => $statusKecurangan,
                ],
                'ringkasan' => [
                    'total_nilai_didapat' => $totalNilaiDidapat,
                    'total_nilai_keseluruhan' => $totalNilaiKeseluruhan,
                    'jumlah_benar' => $jumlahBenar,
                    'jumlah_salah' => $jumlahSalah,
                ],
                'detail_soal' => $detailHasil,
            ]
        ]);
    }
}
