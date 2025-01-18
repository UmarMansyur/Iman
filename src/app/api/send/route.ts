import EmailTemplate from "@/components/email/invite";
import { generateToken } from "@/lib/session";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get("id");
    const senderName = formData.get("senderName");
    const email = formData.get("email");
    const name = formData.get("name");
    if (!email || !name) {
      return Response.json({ error: "Email and name are required" }, { status: 400 });
    }

    // generate token dimana token tersebut menyimpan id dan email exp 5 menit
    const exp = new Date().getTime() + 5 * 60 * 1000;
    const token = await generateToken({ id: id?.toString(), email: email.toString(), expired: exp });


    const { data, error } = await resend.emails.send({
      from: 'no-replyinderadistribution.com',
      to: [email.toString()],
      subject: 'Undangan Keanggotaan Pabrik',
      react: EmailTemplate({ senderName: senderName?.toString(), recipientName: name.toString(), subject: 'Undangan Keanggotaan Pabrik', message: 'Hai ' + name.toString() + ' kami mengundang anda untuk menjadi anggota pabrik kami. Silakan klik tombol di bawah ini untuk mengaktifkan undangan anda.', token: token }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}