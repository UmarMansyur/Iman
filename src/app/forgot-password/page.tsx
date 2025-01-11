/* eslint-disable @typescript-eslint/no-explicit-any */
// app/forgot-password/page.tsx
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
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setIsSubmitting(false);
      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(data.error);
        toast.error(data.error);
      }
    } catch (err: any) {
      console.log(err);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-8 mx-auto">
      <Card className="w-full max-w-md shadow-none">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2 justify-center">
            <Image src="/logo.svg" alt="Logo" width={100} height={100} />
          </div>
          <CardTitle className="text-xl font-bold text-center">
            Lupa Password
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Masukkan email Anda untuk menerima link reset password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-50">
                <AlertDescription className="text-green-700">
                  Link reset password telah dikirim ke email Anda. Silakan cek
                  inbox atau folder spam Anda.
                </AlertDescription>
              </Alert>
              <div className="flex items-center space-x-2 justify-center">
                <span className="text-sm text-gray-600">
                  Kembali ke {" "}
                </span>
                <Link
                  href="/login"
                  className="text-sm text-primary hover:underline"
                >
                  <span className="font-bold">Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {/* berikan icon loading  dan send */}
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1" /> Kirim
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-1" /> Kirim
                      </>
                    )}
                  </Button>
                  <div className="flex items-center space-x-2 justify-center">
                    <span className="text-sm text-gray-600">
                      Sudah ingat password?
                    </span>
                    <Link
                      href="/login"
                      className="text-sm text-primary hover:underline"
                    >
                      <span className="font-bold">Login</span>
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
