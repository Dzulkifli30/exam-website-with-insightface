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
        Schema::create('mirips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peserta_1')->constrained('pesertas')->onDelete('cascade');
            $table->foreignId('peserta_2')->constrained('pesertas')->onDelete('cascade');
            $table->float('similarity_score');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mirips');
    }
};
