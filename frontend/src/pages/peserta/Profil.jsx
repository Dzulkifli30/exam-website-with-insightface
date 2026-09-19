"use client";

import React, { useState, useEffect } from "react";
import PesertaLayout from "../layouts/PesertaLayout";
import { FaUser, FaSchool, FaHashtag, FaCalendar } from "react-icons/fa";
import api, { API_URL_BASE } from "../api/api";
import Swal from "sweetalert2";

export default function Profil() {

    // contoh data peserta
    const [peserta, setPeserta] = useState({
        name: "",
        nisn: "",
        tanggal_lahir: "",
        asal_sekolah: "",
        image: null,
    });

    // contoh data user
    const [user, setUser] = useState({
        name: "",
        email: "",
        password_lama: "",
        password_baru: "",
        konfirmasi_password: "",
    });

    // contoh data foto peserta
    const [fotoPeserta, setFotoPeserta] = useState(null);
    const [loadingFoto, setLoadingFoto] = useState(true);
    const foto = {
        foto_depan: "https://i.pravatar.cc/150",
        foto_kiri: "https://i.pravatar.cc/150",
        foto_kanan: "https://i.pravatar.cc/150",
    };

    const [gambarFile, setGambarFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const [loading, setLoading] = useState(true);
    const [pesertaId, setPesertaId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchPeserta = async () => {
        try {
            const res = await api.get("/user");
            if (res.data) {
                setPeserta({
                    name: res.data.peserta.name,
                    nisn: res.data.peserta.nisn,
                    tanggal_lahir: res.data.peserta.tanggal_lahir,
                    asal_sekolah: res.data.peserta.asal_sekolah,
                    image: res.data.peserta.image,
                });
                setUser({
                    name: res.data.name,
                    email: res.data.email,
                });

                setPesertaId(res.data.peserta.id);
            }
        } catch (err) {
            console.log("Belum ada data peserta");
        } finally {
            setLoading(false);
        }
    };

    const fetchFotoPeserta = async (id) => {
        try {
            const res = await api.get(`/foto-peserta/${id}`);
            setFotoPeserta(res.data);
        } catch (err) {
            console.log("Belum ada foto peserta");
            setFotoPeserta(null);
        } finally {
            setLoadingFoto(false);
        }
    };

    useEffect(() => {
        fetchPeserta();
        fetchFotoPeserta(pesertaId);

    }, [pesertaId]);

    // ======================================================
    // HANDLE UPLOAD GAMBAR + PREVIEW
    // ======================================================
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setGambarFile(file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmitPeserta = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", peserta.name);
            formData.append("nisn", peserta.nisn);
            formData.append("tanggal_lahir", peserta.tanggal_lahir);
            formData.append("asal_sekolah", peserta.asal_sekolah);

            if (gambarFile) {
                formData.append("image", gambarFile);
            }

            if (pesertaId) {
                // ========== UPDATE ================
                const res = await api.post(`/peserta/${pesertaId}?_method=PUT`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                await Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Data peserta berhasil diperbarui!",
                    showConfirmButton: false,
                    timer: 1500,
                });
            } else {
                // ========== CREATE ================
                const res = await api.post("/peserta", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                await Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Data peserta berhasil dibuat!",
                    showConfirmButton: false,
                    timer: 1500,
                });
                setPesertaId(res.data.id);
            }

            await fetchPeserta();
            await fetchFotoPeserta(pesertaId);
            window.location.reload();
        } catch (error) {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Gagal!",
                text: "Gagal menyimpan data",
                showConfirmButton: false,
                timer: 1500,
            });
        } finally {
            setIsSaving(false);
        }


    };

    const handleSubmitAkun = () => {
        Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Data user disimpan!",
            showConfirmButton: false,
            timer: 1500,
        });
    };

    console.log(pesertaId);
    if (loading) return <p>Loading...</p>;

    return (
        <PesertaLayout>
            <div className="space-y-8">

                {/* CARD 1 - DATA PESERTA */}
                <div className="bg-white rounded-2xl shadow-md transition hover:shadow-lg">
                    <h2 className="text-xl font-bold px-6 py-4">Data Peserta</h2>
                    <hr />

                    <div className="p-6 space-y-4">

                        {/* FOTO PESERTA */}
                        <div className="flex flex-col items-start mb-6">

                            <img
                                src={
                                    preview
                                        ? preview
                                        : peserta.image
                                            ? `${API_URL_BASE}/storage/${peserta.image}`
                                            : "https://i.pravatar.cc/150"
                                }
                                className={`w-32 h-32 rounded-full object-cover mb-3 ${peserta.image || preview ? "block" : "hidden"
                                    }`}
                            />

                            <label className="inline-block cursor-pointer bg-gray-600 text-white px-4 py-2 hover:bg-gray-700">
                                Masukkan Foto
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                        </div>

                        {/* FORM INPUT */}
                        <div className="grid grid-cols-1 gap-6 mb-4">

                            <div>
                                <p className="mb-2 text-gray-500">Nama Lengkap</p>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-4 py-2"
                                    value={peserta.name}
                                    onChange={(e) =>
                                        setPeserta({ ...peserta, name: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <p className="mb-2 text-gray-500">NISN (10 Digit)</p>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg px-4 py-2"
                                    value={peserta.nisn}
                                    maxLength={11}
                                    onChange={(e) =>
                                        setPeserta({ ...peserta, nisn: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <p className="mb-2 text-gray-500">Tanggal Lahir</p>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg px-4 py-2"
                                    value={peserta.tanggal_lahir}
                                    onChange={(e) =>
                                        setPeserta({ ...peserta, tanggal_lahir: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <p className="mb-2 text-gray-500">Asal Sekolah</p>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-4 py-2"
                                    value={peserta.asal_sekolah}
                                    onChange={(e) =>
                                        setPeserta({ ...peserta, asal_sekolah: e.target.value })
                                    }
                                />
                            </div>

                        </div>

                        <button
                            onClick={handleSubmitPeserta}
                            disabled={isSaving}
                            className={`px-4 py-2 text-white rounded-lg transition ${isSaving ? "bg-gray-400 cursor-not-allowed" : "cursor-pointer bg-himmel-primary hover:bg-himmel-primary/80"
                                }`}
                        >
                            {isSaving ? "Menyimpan..." : (pesertaId ? "Update" : "Simpan")}
                        </button>

                    </div>
                </div>

                {/* CARD 2 — FOTO PESERTA */}
                {/* <div className="bg-white rounded-2xl shadow-md transition hover:shadow-lg">
                    <h2 className="text-xl font-bold px-6 py-4">Foto Peserta</h2>
                    <hr />

                    <div className="p-6 space-y-6">

                        {loadingFoto ? (
                            <p>Loading...</p>
                        ) : pesertaId === null ? (
                            <p className="text-red-500 font-semibold">
                                Isi data peserta dahulu
                            </p>
                        ) : !fotoPeserta ? (
                            <>
                                <p className="text-red-500 font-semibold">Belum ada foto peserta</p>
                                <button
                                    onClick={() => (window.location.href = "/ambil-gambar")}
                                    className="px-4 py-2 bg-himmel-primary text-white rounded-lg hover:bg-himmel-primary/80"
                                >
                                    Ambil Foto
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center">
                                    <p className="font-semibold w-1/4">Foto Depan:</p>
                                    <img
                                        src={`${API_URL_BASE}/storage/${fotoPeserta.foto_depan}`}
                                        className="w-40 rounded mt-2"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <p className="font-semibold w-1/4">Foto Samping Kiri:</p>
                                    <img
                                        src={`${API_URL_BASE}/storage/${fotoPeserta.foto_samping_kiri}`}
                                        className="w-40 rounded mt-2"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <p className="font-semibold w-1/4">Foto Samping Kanan:</p>
                                    <img
                                        src={`${API_URL_BASE}/storage/${fotoPeserta.foto_samping_kanan}`}
                                        className="w-40 rounded mt-2"
                                    />
                                </div>

                                <button
                                    onClick={() => (window.location.href = "/ambil-gambar")}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                                >
                                    Ganti Foto
                                </button>
                            </>
                        )}


                    </div>
                </div> */}


                {/* CARD 3 — DATA AKUN */}
                <div className="bg-white rounded-2xl shadow-md transition hover:shadow-lg">
                    <h2 className="text-xl font-bold px-6 py-4">Data Akun</h2>
                    <hr />
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 gap-6 mb-4">
                            <div>
                                <p className="mb-2 text-gray-500">Username</p>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                    value={user.name}
                                    onChange={(e) =>
                                        setUser({ ...user, name: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <p className="mb-2 text-gray-500">Email</p>
                                <input
                                    type="email"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                    value={user.email}
                                    onChange={(e) =>
                                        setUser({ ...user, email: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <p className="mb-2 text-gray-500">Password Lama</p>
                                <input
                                    type="password"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                    value={user.password_lama}
                                    onChange={(e) =>
                                        setUser({ ...user, password_lama: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <p className="mb-2 text-gray-500">Password Baru</p>
                                <input
                                    type="password"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                    value={user.password_baru}
                                    onChange={(e) =>
                                        setUser({ ...user, password_baru: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <p className="mb-2 text-gray-500">
                                    Konfirmasi Password Baru
                                </p>
                                <input
                                    type="password"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                                    value={user.konfirmasi_password}
                                    onChange={(e) =>
                                        setUser({
                                            ...user,
                                            konfirmasi_password: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmitAkun}
                            className="px-4 py-2 bg-himmel-primary text-white rounded-lg hover:bg-himmel-primary/80"
                        >
                            Simpan
                        </button>
                    </div>
                </div>
            </div>
        </PesertaLayout>
    );
}
