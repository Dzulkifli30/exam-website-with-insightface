import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "./api/api";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return setError("Password tidak sama");
        }

        setLoading(true);

        try {
            const res = await api.post("/register", {
                name: 'peserta',
                email: formData.email,
                password: formData.password,
            });

            // simpan token jika API mengembalikan token
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }

            navigate("/profile");
        } catch (err) {
            console.log(err);
            setError(
                err.response?.data?.message ||
                "Terjadi kesalahan saat registrasi"
            );
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center bg-himmel-aura h-screen">
            <div className="w-full max-w-md py-8 bg-white rounded shadow-md">
                <h2 className="mb-2 text-2xl font-bold text-center text-gray-800">
                    Daftar Akun
                </h2>
                <p className="mb-6 text-sm text-center text-gray-600">
                    Buat akun baru untuk mengikuti ujian.
                </p>
                <hr className="border-gray-300 mx-auto" />

                <form onSubmit={handleSubmit} className="p-8">
                    {/* Email */}
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-himmel-primary"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-himmel-primary pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Konfirmasi Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-himmel-primary pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="mb-4 text-sm text-red-600">{error}</p>
                    )}

                    {/* Tombol */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-4 py-2 text-white rounded-md ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-himmel-primary hover:bg-himmel-primary/80 cursor-pointer"
                            }`}
                    >
                        {loading ? "Memproses..." : "Register"}
                    </button>

                    <p className="mt-4 text-sm text-center text-gray-600">
                        Sudah punya akun?{" "}
                        <Link
                            to="/login"
                            className="text-himmel-primary hover:underline font-medium"
                        >
                            Masuk disini
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
