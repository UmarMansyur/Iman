/* eslint-disable @typescript-eslint/no-explicit-any */
// app/reset-password/page.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulasi API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Di sini Anda akan memanggil API untuk reset password
      const token = new URLSearchParams(window.location.search).get("token");
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(response.statusText);
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-8 mx-auto">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center items-center">
            <Image src="/logo.svg" alt="logo" width={100} height={100} />
          </div>
          <CardTitle className="text-center">Reset Password</CardTitle>
          <CardDescription className="text-center text-sm">
            <p className="text-sm">Masukkan password baru Anda</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div>
              <Alert>
                <AlertDescription>
                  Password Anda berhasil direset. Silakan login dengan password
                  baru Anda.
                </AlertDescription>
              </Alert>
              <div className="flex justify-center items-center mt-4">
                <span className="text-sm">Sudah ingat password?&nbsp;</span>
                <Link href="/login" className="text-sm text-blue-500">
                  Login disini
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Password Baru"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="pl-10"
                      required
                      minLength={4}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Konfirmasi Password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="pl-10"
                      required
                      minLength={4}
                    />
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-between items-center"></div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Memproses..." : "Reset Password"}
                </Button>
              </div>
              <div className="flex justify-center items-center mt-4">
                <span className="text-sm">Sudah ingat password?&nbsp;</span>
                <Link href="/login" className="text-sm text-blue-500">
                  Login disini
                </Link>
              </div>
            </form>
          )}
          {/* sudah ingat password? */}
        </CardContent>
      </Card>
    </div>
  );
}
