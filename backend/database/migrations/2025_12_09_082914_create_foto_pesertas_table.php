<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function Laravel\Prompts\table;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('foto_pesertas', function (Blueprint $table) {
            $table->id();
            $table->string('foto_depan');
            $table->longText('embedding_depan')->nullable();
            $table->string('foto_samping_kiri');
            $table->longText('embedding_samping_kiri')->nullable();
            $table->string('foto_samping_kanan');
            $table->longText('embedding_samping_kanan')->nullable();
            $table->foreignId('peserta_id')->constrained('pesertas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('foto_pesertas');
    }
};
