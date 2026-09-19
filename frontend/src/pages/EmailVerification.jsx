import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EmailVerification() {
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [info, setInfo] = useState("");
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();

    // jalankan timer setiap detik kalau countdown > 0
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendCode = () => {
        // simulasi kirim kode ke email
        setInfo("📧 Kode verifikasi telah dikirim ke email Anda.");
        setCountdown(60); // mulai hitung mundur 60 detik
        setTimeout(() => setInfo(""), 4000); // pesan info hilang setelah 4 detik
    };

    const handleVerify = (e) => {
        e.preventDefault();

        if (code === "123456") {
            setTimeout(() => {
                navigate("/biodata-form"); // pindah halaman
            }, 500);
        } else {
            setMessage("❌ Kode verifikasi salah.");
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-100 h-screen">
            <div className="w-full max-w-md py-8 bg-white rounded shadow-md">
                <h2 className="mb-2 text-2xl font-bold text-center text-gray-800">
                    Konfirmasi Email
                </h2>
                <p className="mb-6 text-sm text-center text-gray-600">
                    Masukkan kode verifikasi yang telah kami kirim ke email Anda.
                </p>
                <hr className="border-gray-300 mx-auto" />

                <form onSubmit={handleVerify} className="p-8">
                    {/* Input + Kirim Kode */}
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Masukkan kode"
                            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={countdown > 0}
                            className={`px-3 py-2 text-sm text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                countdown > 0
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                            }`}
                        >
                            {countdown > 0 ? `Kirim Ulang (${countdown})` : "Kirim Kode"}
                        </button>
                    </div>

                    {/* Info kirim kode */}
                    {info && <p className="mb-4 text-sm text-green-600">{info}</p>}

                    {/* Tombol Konfirmasi */}
                    <button
                        type="submit"
                        disabled={!code}
                        className={`w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                            !code
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                        }`}
                    >
                        Konfirmasi
                    </button>

                    {/* Pesan hasil verifikasi */}
                    {message && (
                        <p
                            className={`mt-4 text-sm ${
                                message.includes("berhasil")
                                    ? "text-green-600"
                                    : "text-red-500"
                            }`}
                        >
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
