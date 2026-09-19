import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api/api";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

export default function TambahUjian() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formUjian, setFormUjian] = useState({
        nama_ujian: "",
        kode_ujian: "",
        deskripsi: "",
        waktu_mulai: "",
        waktu_selesai: "",
        durasi: 60,
    });

    const [soals, setSoals] = useState([
        {
            pertanyaan: "",
            pilihan_a: "",
            pilihan_b: "",
            pilihan_c: "",
            pilihan_d: "",
            pilihan_e: "",
            jawaban_benar: "A",
            bobot_nilai: 10,
        }
    ]);

    const handleChangeUjian = (e) => {
        const { name, value } = e.target;
        setFormUjian({ ...formUjian, [name]: value });
    };

    const handleAddSoal = () => {
        setSoals([
            ...soals,
            {
                pertanyaan: "",
                pilihan_a: "",
                pilihan_b: "",
                pilihan_c: "",
                pilihan_d: "",
                pilihan_e: "",
                jawaban_benar: "A",
                bobot_nilai: 10,
            }
        ]);
    };

    const handleRemoveSoal = (index) => {
        const newSoals = [...soals];
        newSoals.splice(index, 1);
        setSoals(newSoals);
    };

    const handleChangeSoal = (index, field, value) => {
        const newSoals = [...soals];
        newSoals[index][field] = value;
        setSoals(newSoals);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formUjian,
                durasi: parseInt(formUjian.durasi, 10),
                soal_ujians: soals.map(s => ({
                    ...s,
                    bobot_nilai: parseFloat(s.bobot_nilai)
                }))
            };

            await api.post("/ujian", payload);
            navigate("/admin/list-ujian");
        } catch (err) {
            console.error("Gagal menambah ujian:", err);
            setError(err.response?.data?.message || err.response?.data?.error || "Terjadi kesalahan saat menyimpan data ujian");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-6 space-y-4">
                <div className="flex items-center gap-4 py-5">
                    <Link to="/admin/list-ujian" className="text-gray-600 hover:text-gray-800">
                        <FaArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Tambah Ujian & Soal</h1>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 pb-10">
                    {/* Data Ujian Section */}
                    <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <h2 className="text-xl font-bold border-b pb-2">Informasi Ujian</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ujian</label>
                                <input
                                    type="text"
                                    name="nama_ujian"
                                    value={formUjian.nama_ujian}
                                    onChange={handleChangeUjian}
                                    required
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Ujian</label>
                                <input
                                    type="text"
                                    name="kode_ujian"
                                    value={formUjian.kode_ujian}
                                    onChange={handleChangeUjian}
                                    required
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea
                                    name="deskripsi"
                                    value={formUjian.deskripsi}
                                    onChange={handleChangeUjian}
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai</label>
                                <input
                                    type="datetime-local"
                                    name="waktu_mulai"
                                    value={formUjian.waktu_mulai}
                                    onChange={handleChangeUjian}
                                    required
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai</label>
                                <input
                                    type="datetime-local"
                                    name="waktu_selesai"
                                    value={formUjian.waktu_selesai}
                                    onChange={handleChangeUjian}
                                    required
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (Menit)</label>
                                <input
                                    type="number"
                                    name="durasi"
                                    value={formUjian.durasi}
                                    onChange={handleChangeUjian}
                                    min="1"
                                    required
                                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data Soal Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Daftar Soal</h2>
                            <button
                                type="button"
                                onClick={handleAddSoal}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 text-sm transition"
                            >
                                <FaPlus /> Tambah Soal
                            </button>
                        </div>

                        <div className="space-y-6">
                            {soals.map((soal, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow relative hover:shadow-md transition">
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        {soals.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSoal(index)}
                                                className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded transition"
                                                title="Hapus Soal"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                    
                                    <h3 className="font-semibold text-lg mb-4 text-blue-800">Soal {index + 1}</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
                                            <textarea
                                                value={soal.pertanyaan}
                                                onChange={(e) => handleChangeSoal(index, 'pertanyaan', e.target.value)}
                                                required
                                                rows="3"
                                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {['A', 'B', 'C', 'D', 'E'].map((opt) => (
                                                <div key={opt}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Pilihan {opt} {opt === 'E' && '(Opsional)'}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={soal[`pilihan_${opt.toLowerCase()}`]}
                                                        onChange={(e) => handleChangeSoal(index, `pilihan_${opt.toLowerCase()}`, e.target.value)}
                                                        required={opt !== 'E'}
                                                        className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${soal.jawaban_benar === opt ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-4 p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-800 mb-2">Jawaban Benar</label>
                                                <div className="flex gap-4">
                                                    {['A', 'B', 'C', 'D', 'E'].map((opt) => (
                                                        <label key={opt} className="flex items-center gap-1 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`jawaban_benar_${index}`}
                                                                value={opt}
                                                                checked={soal.jawaban_benar === opt}
                                                                onChange={(e) => handleChangeSoal(index, 'jawaban_benar', e.target.value)}
                                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className={soal.jawaban_benar === opt ? 'font-bold text-green-700' : ''}>{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-bold text-gray-800 mb-1">Bobot Nilai</label>
                                                <input
                                                    type="number"
                                                    value={soal.bobot_nilai}
                                                    onChange={(e) => handleChangeSoal(index, 'bobot_nilai', e.target.value)}
                                                    required
                                                    min="1"
                                                    className="w-full border border-gray-300 rounded-md p-2 max-w-[200px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow font-medium text-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Ujian'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
