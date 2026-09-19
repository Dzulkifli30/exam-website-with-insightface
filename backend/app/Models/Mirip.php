<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mirip extends Model
{
    protected $fillable = ['peserta_1', 'peserta_2', 'similarity_score'];

    public function peserta1()
    {
        return $this->belongsTo(Peserta::class, 'peserta_1');
    }
    public function peserta2()
    {
        return $this->belongsTo(Peserta::class, 'peserta_2');
    }
}
