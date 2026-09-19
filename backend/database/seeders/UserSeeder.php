<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'role' => 'admin',
            'password' => bcrypt('password'),
        ]);

        // for ($i = 1; $i <= 10; $i++) {
        //     // for ($i = 1; $i <= 150; $i++) {
        //     // for ($i = 1; $i <= 500; $i++) {
        //     // for ($i = 1; $i <= 1500; $i++) {
        //     // for ($i = 1; $i <= 5000; $i++) {
        //     // for ($i = 1; $i <= 10000; $i++) {
        //     // for ($i = 1; $i <= 13000; $i++) {
        //     User::create([
        //         'name' => 'Peserta ' . $i,
        //         'email' => 'peserta' . $i . '@gmail.com',
        //         'role' => 'peserta',
        //         'password' => bcrypt('password'),
        //     ]);
        // }
    }
}
