import { Loader2 } from "lucide-react";

export default function LoaderScreen() {
  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex justify-center items-center">
    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
</div>
  );
}
