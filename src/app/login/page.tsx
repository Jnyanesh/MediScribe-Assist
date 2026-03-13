"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {login} from "@/app/services/auth";
import {useRouter} from "next/navigation";
// import axios from "axios"

interface LoginFormData {
    email: string
    password: string
    rememberMe: boolean
}

interface LoginResponse {
    success: boolean
    token?: string
    user?: {
        id: string
        name: string
        email: string
    }
    message?: string
}

export default function LoginPage() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
        rememberMe: false,
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<{
        email?: string
        password?: string
    }>({})
    const router = useRouter()

    const validateForm = (): boolean => {
        const errors: { email?: string; password?: string } = {}

        if (!formData.email) {
            errors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid email address"
        }

        if (!formData.password) {
            errors.password = "Password is required"
        } else if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters"
        }

        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        const result = await login(formData.email, formData.password);

        await router.replace("/dashboard");

        setIsLoading(false)

        // try {
        //     // Simulate API call - replace with your actual endpoint
        //     const response = await axios.post<LoginResponse>("/api/auth/login", {
        //         email: formData.email,
        //         password: formData.password,
        //         rememberMe: formData.rememberMe,
        //     })
        //
        //     if (response.data.success) {
        //         setSuccess("Login successful! Redirecting...")
        //         // Store token if needed
        //         if (response.data.token) {
        //             localStorage.setItem("authToken", response.data.token)
        //         }
        //         // Redirect to dashboard or main app
        //         setTimeout(() => {
        //             window.location.href = "/dashboard"
        //         }, 1500)
        //     } else {
        //         setError(response.data.message || "Login failed. Please try again.")
        //     }
        // } catch (err) {
        //     if (axios.isAxiosError(err)) {
        //         if (err.response?.status === 401) {
        //             setError("Invalid email or password. Please try again.")
        //         } else if (err.response?.status === 429) {
        //             setError("Too many login attempts. Please try again later.")
        //         } else if (err.response?.data?.message) {
        //             setError(err.response.data.message)
        //         } else {
        //             setError("Network error. Please check your connection and try again.")
        //         }
        //     } else {
        //         setError("An unexpected error occurred. Please try again.")
        //     }
        // } finally {
        //     setIsLoading(false)
        // }
    }

    const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear field error when user starts typing
        if (fieldErrors[field as keyof typeof fieldErrors]) {
            setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
        }
        // Clear general error when user makes changes
        if (error) setError(null)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    {/*<div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-sm flex items-center justify-center">*/}
                    {/*    <Lock className="w-8 h-8 text-blue-600" />*/}
                    {/*</div>*/}
                    <h1 className="text-2xl font-semibold text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-slate-600">Sign in to access your patient documents</p>
                </div>

                {/* Login Card */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200 hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Success Message */}
                            {success && (
                                <div className="flex items-center space-x-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm font-medium">{success}</span>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-50" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            fieldErrors.email
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-slate-300 hover:border-slate-400"
                                        }`}
                                        placeholder="Enter your email"
                                        disabled={isLoading}
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <p className="text-xs text-red-600 flex items-center space-x-1">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{fieldErrors.email}</span>
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 z-50" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            fieldErrors.password
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-slate-300 hover:border-slate-400"
                                        }`}
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="text-xs text-red-600 flex items-center space-x-1">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{fieldErrors.password}</span>
                                    </p>
                                )}
                            </div>

                            {/*/!* Remember Me & Forgot Password *!/*/}
                            {/*<div className="flex items-center justify-between">*/}
                            {/*    <label className="flex items-center space-x-2 cursor-pointer">*/}
                            {/*        <input*/}
                            {/*            type="checkbox"*/}
                            {/*            checked={formData.rememberMe}*/}
                            {/*            onChange={(e) => handleInputChange("rememberMe", e.target.checked)}*/}
                            {/*            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"*/}
                            {/*            disabled={isLoading}*/}
                            {/*        />*/}
                            {/*        <span className="text-sm text-slate-600">Remember me</span>*/}
                            {/*    </label>*/}
                            {/*    <button*/}
                            {/*        type="button"*/}
                            {/*        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"*/}
                            {/*        disabled={isLoading}*/}
                            {/*    >*/}
                            {/*        Forgot password?*/}
                            {/*    </button>*/}
                            {/*</div>*/}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500 flex items-center justify-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>Your data is secured</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
