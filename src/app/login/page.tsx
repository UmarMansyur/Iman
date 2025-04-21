/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useActionState } from "react";
import { login } from "../actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import Image from "next/image";
import { useUserStore } from "@/store/user-store";
import Link from "next/link";
const LoginPage = () => {
  const [state, action] = useActionState(login, undefined);
  const { user, setUser } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  // check apakah ada
  useEffect(() => {
    document.title = "Login - Indera Distribution";
    if (user) {
      setUser(null);
    }
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            <div className="flex items-center justify-center">
              <Image src="/logo.svg" alt="logo" width={100} height={100} />
            </div>
            Login
          </CardTitle>
          <CardDescription className="text-center">
            Masukkan email dan password Anda untuk login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={action}>
            <div className="space-y-2 my-3">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  placeholder="nama@email.com"
                  type="email"
                  className="pl-10"
                  name="email"
                />
                <small className="text-red-500">
                  {state?.errors?.email && state.errors.email}
                </small>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  className="pl-10"
                  name="password"
                />
                {
                  showPassword ? (
                    <EyeOff className="absolute right-3 top-3 h-4 w-4 text-gray-400 cursor-pointer" onClick={() => setShowPassword(false)} />
                  ) : (
                    <Eye className="absolute right-3 top-3 h-4 w-4 text-gray-400 cursor-pointer" onClick={() => setShowPassword(true)} />
                  )
                }

                <small className="text-red-500">
                  {state?.errors?.password && state.errors.password}
                </small>
              </div>
              <small className="text-red-500">
                {state?.message && state.message}
              </small>
            </div>
            <div className="flex items-center space-x-2 my-3 justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Ingat saya
                </label>
              </div>
              <div className="flex items-center space-x-2 justify-end"> 
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">Lupa Password?</Link>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <SubmitButton text="Masuk" />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600">
                Belum punya akun?{" "}
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Silahkan hubungi administrator
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
