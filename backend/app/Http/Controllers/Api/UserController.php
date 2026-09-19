<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Ujian;
use App\Models\Peserta;
use App\Models\KecuranganPeserta;
use App\Models\Mirip;
use App\Models\Sesi;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(User::where('role', '=', 'peserta')->get());
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function blokirUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $user->status = 'diblokir';
        $user->save();

        return response()->json(['message' => 'User has been blocked', 'user' => $user]);
    }

    public function dashboardAdmin()
    {
        $upcoming_exams = Ujian::where('waktu_mulai', '>', now())
            ->orderBy('waktu_mulai', 'asc')
            ->get();

        $total_peserta = Peserta::count();
        $total_kecurangan = KecuranganPeserta::count();
        $total_ujian = Ujian::count();
        $total_kemiripan = Mirip::count();

        $peserta_kecurangan = Peserta::withCount('kecuranganPesertas')
            ->having('kecurangan_pesertas_count', '>', 0)
            ->orderByDesc('kecurangan_pesertas_count')
            ->take(5)
            ->get();

        $total_peserta_mirip = Peserta::whereHas('miripsAsPeserta1')
            ->orWhereHas('miripsAsPeserta2')
            ->count();

        $peserta_mirip_per_sesi = Sesi::withCount(['pesertas as jumlah_peserta_mirip' => function ($query) {
            $query->where(function ($q) {
                $q->has('miripsAsPeserta1')->orHas('miripsAsPeserta2');
            });
        }])->get(['id', 'nama_sesi', 'jumlah_peserta_mirip']);

        return response()->json([
            'total_peserta' => $total_peserta,
            'total_kecurangan' => $total_kecurangan,
            'total_ujian' => $total_ujian,
            'total_kemiripan' => $total_kemiripan,
            'total_peserta_mirip' => $total_peserta_mirip, // Total keseluruhan
            'peserta_mirip_per_sesi' => $peserta_mirip_per_sesi, // Total per sesi
            'ujian_terbaru' => $upcoming_exams,
            'peserta_kecurangan' => $peserta_kecurangan
        ]);
    }
}
