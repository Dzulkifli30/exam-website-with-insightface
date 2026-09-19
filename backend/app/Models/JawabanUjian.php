<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JawabanUjian extends Model
{
    protected $table = 'jawaban_ujians';

    protected $fillable = [
        'soal_ujian_id',
        'peserta_id',
        'jawaban',
        'is_correct',
    ];

    public function soalUjian()
    {
        return $this->belongsTo(SoalUjian::class);
    }

    public function peserta()
    {
        return $this->belongsTo(Peserta::class);
    }
}
