/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";
import { useActionState } from "react";
import { login } from "../actions/auth";
import { useFormStatus } from "react-dom";

const LoginPage = () => {
  const [state, action] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
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
                { state?.errors?.email && <p className="text-red-500">{state.errors.email}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  className="pl-10"
                  name="password"
                />
                { state?.errors?.password && <p className="text-red-500">{state.errors.password}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-2 my-3">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Ingat saya
              </label>
            </div>
            <div className="flex flex-col space-y-4">
              <LoginButton />
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
                  Daftar disini
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

function LoginButton() {
  const { pending } = useFormStatus()
  return <Button disabled={pending} type="submit">{pending ? "Loading..." : "Login"}</Button>
}

export default LoginPage;
