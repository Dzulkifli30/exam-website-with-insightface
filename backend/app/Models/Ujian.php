<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ujian extends Model
{
    protected $table = 'ujians';

    protected $fillable = [
        'nama_ujian',
        'kode_ujian',
        'deskripsi',
        'waktu_mulai',
        'waktu_selesai',
        'durasi',
    ];

    public function soalUjians()
    {
        return $this->hasMany(SoalUjian::class);
    }

    public function kecuranganPesertas()
    {
        return $this->hasMany(KecuranganPeserta::class);
    }
}
