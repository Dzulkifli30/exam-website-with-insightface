<?php

namespace App\Http\Controllers;

use App\Models\FotoPeserta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class FotoPesertaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        'foto_depan' => 'image|mimes:jpg,jpeg,png,gif|max:2048',
        'foto_samping_kiri' => 'image|mimes:jpg,jpeg,png,gif|max:2048',
        'foto_samping_kanan' => 'image|mimes:jpg,jpeg,png,gif|max:2048',
    ]);

    $data['peserta_id'] = $request->user()->peserta->id;

    // --------------------------
    // 1. Simpan foto ke storage
    // --------------------------
    if ($request->hasFile('foto_depan')) {
        $data['foto_depan'] = $request->file('foto_depan')->store('images/foto_peserta', 'public');
    }

    if ($request->hasFile('foto_samping_kiri')) {
        $data['foto_samping_kiri'] = $request->file('foto_samping_kiri')->store('images/foto_peserta', 'public');
    }

    if ($request->hasFile('foto_samping_kanan')) {
        $data['foto_samping_kanan'] = $request->file('foto_samping_kanan')->store('images/foto_peserta', 'public');
    }


    // --------------------------------------------------------
    // 2. Kirim foto ke FastAPI untuk generate embedding
    // --------------------------------------------------------
    $fastApiUrl = env('INSIGHTFACE_URL') . '/embedding';

    if ($request->hasFile('foto_depan')) {
        $response = Http::attach(
            'image',
            file_get_contents($request->file('foto_depan')),
            $request->file('foto_depan')->getClientOriginalName()
        )->post($fastApiUrl);

        $data['embedding_depan'] = json_encode($response->json('embedding'));
    }

    if ($request->hasFile('foto_samping_kiri')) {
        $response = Http::attach(
            'image',
            file_get_contents($request->file('foto_samping_kiri')),
            $request->file('foto_samping_kiri')->getClientOriginalName()
        )->post($fastApiUrl);

        $data['embedding_samping_kiri'] = json_encode($response->json('embedding'));
    }

    if ($request->hasFile('foto_samping_kanan')) {
        $response = Http::attach(
            'image',
            file_get_contents($request->file('foto_samping_kanan')),
            $request->file('foto_samping_kanan')->getClientOriginalName()
        )->post($fastApiUrl);

        $data['embedding_samping_kanan'] = json_encode($response->json('embedding'));
    }

    // -----------------------------------------------
    // 3. Simpan ke database (foto + embedding)
    // -----------------------------------------------
    $fotoPeserta = FotoPeserta::create($data);

    return response()->json([
        'message' => 'Foto + embedding berhasil disimpan',
        'data' => $fotoPeserta
    ], 201);
}


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $fotoPeserta = FotoPeserta::where('peserta_id', $id)->firstOrFail();
        return response()->json($fotoPeserta);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FotoPeserta $fotoPeserta)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FotoPeserta $fotoPeserta)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FotoPeserta $fotoPeserta)
    {
        //
    }
}
