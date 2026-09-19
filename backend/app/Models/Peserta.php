<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Peserta extends Model
{
    // protected $fillable = ['name', 'nisn', 'tanggal_lahir', 'asal_sekolah', 'lokasi_ujian', 'image', 'user_id', 'sesi_id'];
    protected $fillable = ['name', 'nisn', 'tanggal_lahir', 'asal_sekolah', 'lokasi_ujian', 'image', 'embedding', 'user_id', 'sesi_id'];

    public function miripsAsPeserta1()
    {
        return $this->hasMany(Mirip::class, 'peserta_1');
    }

    public function miripsAsPeserta2()
    {
        return $this->hasMany(Mirip::class, 'peserta_2');
    }

    public function sesi()
    {
        return $this->belongsTo(Sesi::class, 'sesi_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function fotoPeserta()
    {
        return $this->hasOne(FotoPeserta::class, 'peserta_id');
    }

    public function kecuranganPesertas()
    {
        return $this->hasMany(KecuranganPeserta::class, 'peserta_id');
    }
}
