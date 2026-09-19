import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "./api/api";

export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            // 1. Login API
            const res = await api.post("/login", {
                email: formData.email,
                password: formData.password,
            });

            // 2. Simpan token
            localStorage.setItem("token", res.data.token);

            // 3. Ambil data user
            const userRes = await api.get("/user");

            const role = userRes.data.role;

            // 4. Redirect berdasarkan role
            if (role === "admin") {
                navigate("/admin/dashboard");
            } else if (role === "peserta") {
                navigate("/dashboard");
            } else {
                navigate("/");
            }

        } catch (err) {
            // console.log(err.response.data.error);
            setError(
                err.response?.data?.error || "Email atau password salah"
            );
        }

        setLoading(false);
    };

    const isFormComplete = formData.email && formData.password;

    return (
        <div className="flex items-center justify-center bg-himmel-aura h-screen">
            <div className="w-full max-w-md py-8 bg-white rounded shadow-md">
                <h2 className="mb-2 text-2xl font-bold text-center text-gray-800">
                    Masuk Akun
                </h2>
                <p className="mb-6 text-sm text-center text-gray-600">
                    Silakan masuk untuk mengikuti ujian.
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
                            className="w-full px-4 py-2 border rounded-md focus:outline-none 
                            focus:ring-2 focus:ring-himmel-primary"
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
                                className="w-full px-4 py-2 border rounded-md focus:outline-none 
                                focus:ring-2 focus:ring-himmel-primary pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {error && (
                            <p className="mt-1 text-sm text-red-500">{error}</p>
                        )}
                    </div>

                    {/* Tombol */}
                    <button
                        type="submit"
                        disabled={!isFormComplete || loading}
                        className={`w-full px-4 py-2 text-white rounded-md ${!isFormComplete || loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-himmel-primary hover:bg-himmel-primary/80 cursor-pointer"
                            }`}
                    >
                        {loading ? "Memproses..." : "Login"}
                    </button>

                    {/* Belum punya akun? */}
                    <p className="mt-4 text-sm text-center text-gray-600">
                        Belum punya akun?{" "}
                        <Link
                            to="/register"
                            className="text-himmel-primary hover:underline font-medium"
                        >
                            Daftar disini
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
