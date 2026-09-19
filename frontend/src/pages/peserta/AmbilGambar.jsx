"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import PesertaLayout from "../layouts/PesertaLayout";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function AmbilGambar() {
    const webcamRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 depan, 2 kiri, 3 kanan
    const [photos, setPhotos] = useState({
        depan: null,
        kiri: null,
        kanan: null,
    });

    // ====================================================
    // Capture webcam → file
    // ====================================================
    const capturePhotoAsFile = async () => {
        const video = webcamRef.current.video;

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(
                        new File([blob], `photo_${Date.now()}.jpg`, {
                            type: "image/jpeg",
                        })
                    );
                },
                "image/jpeg",
                0.9
            );
        });
    };

    // ====================================================
    // Ambil Foto
    // ====================================================
    const takePhoto = async () => {
        setLoading(true);

        const file = await capturePhotoAsFile();
        const url = URL.createObjectURL(file);

        if (step === 1) {
            setPhotos((prev) => ({ ...prev, depan: { file, url } }));
            setStep(2);
        } else if (step === 2) {
            setPhotos((prev) => ({ ...prev, kiri: { file, url } }));
            setStep(3);
        } else if (step === 3) {
            setPhotos((prev) => ({ ...prev, kanan: { file, url } }));
            alert("Semua foto berhasil diambil!");
        }

        setLoading(false);
    };

    const allDone = photos.depan && photos.kiri && photos.kanan;

    // ====================================================
    // Reset Foto
    // ====================================================
    const resetPhotos = () => {
        setPhotos({
            depan: null,
            kiri: null,
            kanan: null,
        });
        setStep(1);
    };

    // ====================================================
    // Kirim ke Laravel (tanpa peserta_id)
    // ====================================================
    const submitToServer = async () => {
        if (!allDone) return alert("Foto belum lengkap!");

        setLoading(true);

        const formData = new FormData();
        formData.append("foto_depan", photos.depan.file);
        formData.append("foto_samping_kiri", photos.kiri.file);
        formData.append("foto_samping_kanan", photos.kanan.file);

        try {
            const res = await api.post("/foto-peserta", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Foto berhasil disimpan!");

            // 🔥 Redirect ke profile
            navigate("/profile");

            console.log(res.data);
        } catch (error) {
            console.error(error);
            alert("Gagal menyimpan foto");
        }

        setLoading(false);
    };

    const instructions = {
        1: "Posisikan wajah menghadap ke depan.",
        2: "Miringkan kepala ke kiri.",
        3: "Miringkan kepala ke kanan.",
    };

    const labels = {
        1: "Ambil Foto Wajah Depan",
        2: "Ambil Foto Wajah Kiri",
        3: "Ambil Foto Wajah Kanan",
    };

    return (
        <PesertaLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Ambil Foto Wajah</h1>

                {/* CAMERA */}
                {!allDone && (
                    <>
                        <p className="text-gray-600 mb-4">{instructions[step]}</p>

                        <div className="flex flex-col items-center">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-[350px] rounded-xl shadow"
                            />

                            <button
                                onClick={takePhoto}
                                disabled={loading}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
                            >
                                {loading ? "Memproses..." : labels[step]}
                            </button>
                        </div>
                    </>
                )}

                {/* PREVIEW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <PhotoBox title="Wajah Depan" data={photos.depan} />
                    <PhotoBox title="Wajah Kiri" data={photos.kiri} />
                    <PhotoBox title="Wajah Kanan" data={photos.kanan} />
                </div>

                {/* BUTTON AREA */}
                {allDone && (
                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={resetPhotos}
                            className="px-6 py-3 bg-red-500 text-white rounded-lg"
                        >
                            Ambil Ulang
                        </button>

                        <button
                            onClick={submitToServer}
                            disabled={loading}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg disabled:bg-gray-400"
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                )}
            </div>
        </PesertaLayout>
    );
}

// ================================
// KOMPONEN PREVIEW FOTO
// ================================
function PhotoBox({ title, data }) {
    return (
        <div>
            <h3 className="font-semibold mb-2">{title}</h3>
            {data ? (
                <img src={data.url} className="w-full rounded-xl shadow" />
            ) : (
                <div className="w-full h-40 border rounded-xl flex items-center justify-center text-gray-400">
                    Belum diambil
                </div>
            )}
        </div>
    );
}
