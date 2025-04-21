import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "github.com",
      }
    ],
    domains: ["https://github.com"]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  /* config options here */
  //   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_zvbKR1yVvHfTs10j2TnNH/t9rNU=
  // NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/8zmr0xxik
  // NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY=private_cnF5s+oz55nNIPEwVLf0mZrI4z8=
  typescript: {
    ignoreBuildErrors: true,
  },
  // env: {
  //   // NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY, NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
  //   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: "public_zvbKR1yVvHfTs10j2TnNH/t9rNU=",
  //   NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/8zmr0xxik",
  //   NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY: "private_cnF5s+oz55nNIPEwVLf0mZrI4z8=",
  //   SESSION_SECRET: "secret",
  //   NEXTAUTH_URL: "http://localhost:3000",
  //   NEXTAUTH_SECRET: "secret",
  //   BASE_URL: "http://localhost:3000",
  //   RESEND_API_KEY: "re_N4GHPZJz_M5rw3Mg27BYfdtvY6xrxLYwz",
  // },
};

export default nextConfig;
