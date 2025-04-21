import Image from "next/image";

export default function EmptyData({ text }: { text: string }) {
  return (
    <>
      <div className="flex justify-center items-center">
        <Image
          src="/empty-box.png"
          alt="empty"
          width={200}
          height={200}
          className="opacity-50"
        />
      </div>
        <p className="text-muted-foreground text-center">{text}</p>
    </>
  );
}
