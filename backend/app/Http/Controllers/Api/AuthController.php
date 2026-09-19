<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Peserta;
use App\Models\Sesi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $randomNisn = random_int(1000000, 9999999);
        $randomSesiId = Sesi::inRandomOrder()->value('id');

        $peserta = Peserta::create([
            'user_id' => $user->id,
            'name' => 'peserta fpc' . $user->id,
            'nisn' => $randomNisn,
            'tanggal_lahir' => '2005-01-01',
            'asal_sekolah' => 'PENS',
            'embedding' => null,
            'sesi_id' => $randomSesiId,
            'lokasi_ujian' => 'Jawa Timur'
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Email atau password salah'], 401);
        }

        if ($user->status == 'diblokir') {
            return response()->json(['error' => 'Pengguna telah di blokir'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('peserta'));
    }
}
