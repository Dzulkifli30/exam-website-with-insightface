<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MiripController;
use App\Http\Controllers\Api\PesertaController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\FotoPesertaController;
use App\Http\Controllers\Api\KecuranganController;
use App\Http\Controllers\Api\UjianController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user()->load('peserta');
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('foto-peserta', FotoPesertaController::class)->only(['store', 'show']);
    Route::post('verifikasi-ujian', [MiripController::class, 'verifikasiUjian']);
    Route::get('ujian', [UjianController::class, 'index']);
    Route::get('ujian-fpc', [UjianController::class, 'fpc']);
    Route::get('ujian/{id}', [UjianController::class, 'show']);
    Route::middleware('role:peserta')->group(function () {
        Route::apiResource('peserta', PesertaController::class)->only(['store', 'update']);
        Route::post('verifikasi-realtime', [KecuranganController::class, 'verifikasiRealtime']);

        // Ujian routes for participants
        Route::post('ujian/{id}/submit', [UjianController::class, 'submitJawaban']);
    });
    Route::middleware('role:admin')->group(function () {
        Route::get('dashboard/admin', [UserController::class, 'dashboardAdmin']);
        Route::post('ujian', [UjianController::class, 'store']);
        Route::post('ujian/{id}/soal', [UjianController::class, 'storeSoal']);
        Route::apiResource('mirip', MiripController::class);
        Route::apiResource('pengguna', UserController::class)->only(['index']);
        Route::apiResource('peserta', PesertaController::class)->except(['store', 'update']);
        Route::get('peserta/{peserta_id}/ujian/{ujian_id}', [PesertaController::class, 'detailHasilUjian']);
        Route::post('pengguna/blokir/{id}', [UserController::class, 'blokirUser']);
        Route::get('kecurangan', [KecuranganController::class, 'index']);
        Route::get('kecurangan/peserta/{peserta_id}', [KecuranganController::class, 'kecuranganperujian']);
        Route::get('kecurangan/peserta/{peserta_id}/ujian/{ujian_id}', [KecuranganController::class, 'detailkecurangan']);
        Route::get('kecurangan/{id}', [KecuranganController::class, 'show']);
        Route::delete('kecurangan/{id}', [KecuranganController::class, 'destroy']);
    });
});

Route::post('peserta/batch', [PesertaController::class, 'storebatch']);
Route::post('deteksi/{id}', [MiripController::class, 'deteksi']);
Route::post('deteksi/kelas/{id}', [MiripController::class, 'deteksiKelas']);
Route::post('deteksi', [MiripController::class, 'deteksisemua']);
Route::post('deteksi/semua/kelas', [MiripController::class, 'deteksiSemuaKelas']);
Route::post('deteksi/semua/sesi', [MiripController::class, 'deteksiSemuaSesi']);
Route::post('deteksi/embedding/sesi', [MiripController::class, 'bandingSesiEmbedding']);
Route::delete('mirip/deleteall', [MiripController::class, 'deleteAll']);
Route::post('tes/embedding', [MiripController::class, 'tesEmbedding']);
