<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Peserta;
use App\Models\KecuranganPeserta;
use App\Models\Ujian;
use Illuminate\Support\Facades\Http;


class KecuranganController extends Controller
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

    public function verifikasiRealtime(Request $request)
    {
        $request->validate([
            'foto_peserta' => 'required|image|mimes:jpg,jpeg,png,gif|max:2048',
            'ujian_id' => 'required|exists:ujians,id',
        ]);

        $peserta = Peserta::where('user_id', $request->user()->id)->first();

        if (!$peserta || !$peserta->embedding) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data peserta atau embedding tidak ditemukan'
            ], 400);
        }

        // Kirim ke InsightFace Service
        $response = Http::attach(
            'image',
            file_get_contents($request->file('foto_peserta')->getRealPath()),
            $request->file('foto_peserta')->getClientOriginalName()
        )->post(env('INSIGHTFACE_URL') . '/embedding');

        if (!$response->successful()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses embedding dari server AI'
            ], 500);
        }

        $data = $response->json();

        // Jika wajah tidak terdeteksi
        if (isset($data['error'])) {
            $pathKecurangan = $request->file('foto_peserta')->store('images/kecurangan', 'public');

            KecuranganPeserta::create([
                'ujian_id' => $request->ujian_id,
                'peserta_id' => $peserta->id,
                'foto_ujian' => $pathKecurangan,
                'similarity_score' => null,
                'status' => 'mencurigakan',
                'keterangan' => 'wajah tidak terdeteksi'
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Wajah tidak terdeteksi, dimohon menghadap ke layar ujian'
            ]);
        }

        $embeddingBaru = $data['embedding'];
        $embeddingDatabase = json_decode($peserta->embedding, true);

        // Jika embedding array kosong/rusak
        if (!is_array($embeddingBaru) || !is_array($embeddingDatabase) || count($embeddingBaru) !== count($embeddingDatabase)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Format embedding tidak valid'
            ], 400);
        }

        // Bandingkan
        $similarity = $this->cosineSimilarity($embeddingBaru, $embeddingDatabase);

        // Jika skor similarity di bawah ambang batas (contoh 0.6)
        if ($similarity < 0.6) {
            // Simpan foto ke public storage
            $pathKecurangan = $request->file('foto_peserta')->store('images/kecurangan', 'public');

            $status = 'mencurigakan';
            $keterangan = 'Wajah tidak cocok dengan foto profil. Skor kemiripan: ' . round($similarity, 4);

            if ($similarity >= 0.3 && $similarity < 0.6) {
                $status = 'aman';
                $keterangan = 'wajah peserta tidak nampak dengan jelas';
            }

            KecuranganPeserta::create([
                'ujian_id' => $request->ujian_id,
                'peserta_id' => $peserta->id,
                'foto_ujian' => $pathKecurangan,
                'similarity_score' => round($similarity, 4),
                'status' => $status,
                'keterangan' => $keterangan
            ]);

            return response()->json([
                'status' => $status === 'aman' ? 'warning' : 'error',
                'message' => $status === 'aman' ? 'Wajah kurang jelas' : 'Wajah tidak mirip!',
                'similarity' => $similarity
            ]);
        }

        // Jika mirip
        return response()->json([
            'status' => 'ok',
            'message' => 'Wajah terverifikasi',
            'similarity' => $similarity
        ]);
    }

    public function index()
    {
        $kecurangan = KecuranganPeserta::with([
            'peserta',
            'peserta.sesi'
        ])->get();

        $kecurangan->each(function ($item) {
            if ($item->peserta) {
                $item->peserta->makeHidden('embedding');
            }
        });

        return response()->json($kecurangan);
    }

    public function show(string $id)
    {
        $kecurangan = KecuranganPeserta::with([
            'peserta',
            'peserta.sesi'
        ])->find($id);

        if (!$kecurangan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kecurangan tidak ditemukan'
            ], 404);
        }

        $kecurangan->peserta->makeHidden('embedding');

        return response()->json($kecurangan);
    }

    public function destroy(string $id)
    {
        $kecurangan = KecuranganPeserta::find($id);
        $kecurangan->delete();
        return response()->json([
            'message' => 'Kecurangan berhasil dihapus',
            'data' => $kecurangan
        ]);
    }

    public function kecuranganperujian($peserta_id)
    {
        $ujians = Ujian::whereHas('kecuranganPesertas', function ($query) use ($peserta_id) {
            $query->where('peserta_id', $peserta_id);
        })->with(['kecuranganPesertas' => function ($query) use ($peserta_id) {
            $query->where('peserta_id', $peserta_id);
        }])->withCount(['kecuranganPesertas' => function ($query) use ($peserta_id) {
            $query->where('peserta_id', $peserta_id);
        }])->get();

        $data = $ujians->map(function ($ujian) {
            return [
                'id' => $ujian->id,
                'nama_ujian' => $ujian->nama_ujian,
                'kode_ujian' => $ujian->kode_ujian ?? "UJIAN-" . str_pad($ujian->id, 3, '0', STR_PAD_LEFT),
                'index_kecurangan' => $ujian->kecurangan_pesertas_count,
                'detail_kecurangan' => $ujian->kecuranganPesertas,
            ];
        });

        return response()->json($data);
    }

    public function detailkecurangan(string $peserta_id, string $ujian_id)
    {
        $kecurangan = KecuranganPeserta::where('peserta_id', $peserta_id)->where('ujian_id', $ujian_id)->get();
        $ujian = Ujian::find($ujian_id);
        $peserta = Peserta::findOrFail($peserta_id)->makeHidden(['embedding'])->load('sesi', 'user:id,status');

        return response()->json([
            'kecurangan' => $kecurangan,
            'ujian' => $ujian,
            'peserta' => $peserta,
        ]);
    }
}
