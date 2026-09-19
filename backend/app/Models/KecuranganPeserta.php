<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KecuranganPeserta extends Model
{
    protected $table = 'kecurangan_pesertas';

    protected $fillable = [
        'ujian_id',
        'peserta_id',
        'foto_ujian',
        'similarity_score',
        'status',
        'keterangan',
    ];

    public function peserta()
    {
        return $this->belongsTo(Peserta::class);
    }

    public function ujian()
    {
        return $this->belongsTo(Ujian::class);
    }
}
