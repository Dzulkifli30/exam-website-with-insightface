<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pesertas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('nisn')->unique();
            $table->date('tanggal_lahir');
            $table->string('asal_sekolah');
            $table->enum('lokasi_ujian', ['Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali']);
            $table->string('image')->nullable();
            $table->longText('embedding')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('sesi_id')->constrained('sesis')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pesertas');
    }
};
