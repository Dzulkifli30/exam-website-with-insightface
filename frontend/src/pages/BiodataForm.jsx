import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api/api";

export default function BiodataForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nama: "",
        nisn: "",
        tanggalLahir: "",
        sekolah: "",
        // lokasi: "",
        foto: null,
    });

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "foto" && files.length > 0) {
            setFormData({ ...formData, foto: files[0] });
            setPreview(URL.createObjectURL(files[0]));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const sendData = new FormData();
            sendData.append("name", formData.nama);
            sendData.append("nisn", formData.nisn);
            sendData.append("tanggal_lahir", formData.tanggalLahir);
            sendData.append("asal_sekolah", formData.sekolah);
            // sendData.append("lokasi", formData.lokasi);
            sendData.append("image", formData.foto);
            

            const response = await api.post("/peserta", sendData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Response API:", response.data);
            setMessage("✅ Biodata berhasil disimpan!");

            // redirect setelah 0.8 detik
            setTimeout(() => {
                navigate("/dashboard");  
            }, 800);

        } catch (error) {
            console.error(error);
            setMessage("❌ Gagal menyimpan biodata!");
        }

        setLoading(false);
    };

    const isFormValid =
        formData.nama &&
        formData.nisn &&
        formData.tanggalLahir &&
        formData.sekolah &&
        // formData.lokasi &&
        formData.foto;

    return (
        <div className="flex items-center justify-center bg-gray-100 min-h-screen">
            <div className="w-full max-w-lg py-8 bg-white rounded shadow-md">
                <h2 className="mb-4 text-2xl font-bold text-center text-gray-800">
                    Biodata Peserta
                </h2>

                {message && (
                    <p className="p-3 mt-3 text-center text-white bg-blue-500 rounded">
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {/* field lainnya tetap */}
                    <div>
                        <label className="block mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1">NISN</label>
                        <input
                            type="text"
                            name="nisn"
                            value={formData.nisn}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1">Tanggal Lahir</label>
                        <input
                            type="date"
                            name="tanggalLahir"
                            value={formData.tanggalLahir}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1">Asal Sekolah</label>
                        <input
                            type="text"
                            name="sekolah"
                            value={formData.sekolah}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>

                    {/* <div>
                        <label className="block mb-1">Lokasi</label>
                        <select
                            name="lokasi"
                            value={formData.lokasi}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded"
                            required
                        >
                            <option value="">-- Pilih Lokasi --</option>
                            <option value="Jawa Barat">Jawa Barat</option>
                            <option value="Jawa Timur">Jawa Timur</option>
                            <option value="Jawa Tengah">Jawa Tengah</option>
                            <option value="Bali">Bali</option>
                        </select>
                    </div> */}

                    <div>
                        <label className="block mb-1">Foto</label>
                        <input
                            type="file"
                            name="foto"
                            accept="image/*"
                            onChange={handleChange}
                            required
                        />
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mt-2 w-24 h-24 rounded border object-cover"
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || loading}
                        className={`w-full px-4 py-2 text-white rounded ${
                            !isFormValid || loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                        }`}
                    >
                        {loading ? "Menyimpan..." : "Simpan Biodata"}
                    </button>
                </form>
            </div>
        </div>
    );
}
