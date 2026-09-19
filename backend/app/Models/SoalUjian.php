<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoalUjian extends Model
{
    protected $table = 'soal_ujians';

    protected $fillable = [
        'ujian_id',
        'pertanyaan',
        'pilihan_a',
        'pilihan_b',
        'pilihan_c',
        'pilihan_d',
        'pilihan_e',
        'jawaban_benar',
        'bobot_nilai',
    ];

    public function ujian()
    {
        return $this->belongsTo(Ujian::class);
    }

    public function jawabanUjians()
    {
        return $this->hasMany(JawabanUjian::class);
    }
}
