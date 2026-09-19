<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FotoPeserta extends Model
{
    protected $table = 'foto_pesertas';

    protected $fillable = [
        'foto_depan',
        'embedding_depan',
        'foto_samping_kiri',
        'embedding_samping_kiri',
        'foto_samping_kanan',
        'embedding_samping_kanan',
        'peserta_id',
    ];

    public function peserta()
    {
        return $this->belongsTo(Peserta::class);
    }
}
