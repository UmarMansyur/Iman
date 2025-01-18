import EmailTemplate from "@/components/email/forgot";
import prisma from "@/lib/db";
import { generateToken } from "@/lib/session";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = await generateToken({
    id: user.id,
    email: user.email,
    expired: new Date().getTime() + 5 * 60 * 1000,
  });

  const { error } = await resend.emails.send({
    from: "no-replyinderadistribution.com",
    to: [email],
    subject: "Reset Password",
    react: EmailTemplate({
      senderName: "IMAN APP",
      recipientName: user.username,
      subject: "Reset Password",
      message:
        "Hai " +
        user.username +
        " untuk melakukan reset password. Silahkan klik link berikut ini untuk melakukan reset password.",
      token: token,
    }),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Email sent" });
}
