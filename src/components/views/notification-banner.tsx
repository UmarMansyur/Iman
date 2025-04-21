import { Toast, ToastTitle, ToastViewport } from "@radix-ui/react-toast";
import { ToastProvider } from "@radix-ui/react-toast";


const NotificationBanner = () => (
  <ToastProvider>
    <Toast>
      <ToastTitle>Pembaruan Sistem Selesai!</ToastTitle>
    </Toast>
    <ToastViewport />
  </ToastProvider>
);

export default NotificationBanner;