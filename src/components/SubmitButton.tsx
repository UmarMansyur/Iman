import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

export function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus()
  return <Button disabled={pending} type="submit" className="bg-blue-500 hover:bg-blue-600" aria-disabled={pending}>{pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Proses...</> : <span>{text}</span>}</Button>
}
