<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sesi extends Model
{
    protected $fillable = ['nama_sesi', 'tanggal_sesi', 'waktu_mulai', 'waktu_selesai'];

    public function pesertas()
    {
        return $this->hasMany(Peserta::class, 'sesi_id');
    }
}
