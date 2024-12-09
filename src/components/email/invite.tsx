import React from "react";
import { Mail, User } from "lucide-react";

const EmailTemplate = ({
  senderName = "John Doe",
  recipientName = "Jane Smith",
  subject = "Undangan Keanggotaan Pabrik",
  message = "Kami mengundang Anda untuk menjadi anggota pabrik kami. Silakan klik tombol di bawah ini untuk mengaktifkan undangan Anda.",
  token = "1234567890"
}) => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-6">
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{subject}</h1>
        </div>
        
        <div className="flex items-center mb-4">
          <User className="text-blue-500 mr-3" size={24} />
          <div>
            <p className="text-gray-700 font-semibold">Dari: {senderName}</p>
            <p className="text-gray-500">Kepada: {recipientName}</p>
          </div>
        </div>
 
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="flex justify-between items-center">
          <a
            href={`${process.env.BASE_URL}/api/activate-invitation?token=${token}`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Aktifkan Undangan
          </a>
        </div>
        
        <div className="mt-4 text-center text-gray-400 text-sm">
          <Mail className="mx-auto mb-2" size={20} />
          Email otomatis dari Sistem. Email ini tidak perlu dijawab.
        </div>
      </div>
    </div>
  );
};

export default EmailTemplate;