"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";

export function PhotoUpload({ initialUrl }: { initialUrl?: string | null }) {
  const inputId = useId();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/upload/photo", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "อัปโหลดไม่สำเร็จ");
      } else {
        setUrl(data.url);
        setFileName(file.name);
      }
    } catch {
      setError("อัปโหลดไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <input type="hidden" name="photoUrl" value={url} />
      {url ? (
        <Image
          src={url}
          alt="รูปโปรไฟล์"
          width={72}
          height={72}
          className="h-18 w-18 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-18 w-18 items-center justify-center rounded-full bg-secondary text-xs text-muted-foreground">
          ไม่มีรูป
        </div>
      )}
      <div>
        <label
          htmlFor={inputId}
          className="btn-secondary cursor-pointer text-sm has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
        >
          <Upload size={15} strokeWidth={2} />
          {uploading ? "กำลังอัปโหลด..." : "เลือกรูปโปรไฟล์"}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          className="sr-only"
        />
        {fileName && !uploading && (
          <p className="mt-1.5 text-xs text-muted-foreground">{fileName}</p>
        )}
        {error && <p className="field-error mt-1.5">{error}</p>}
      </div>
    </div>
  );
}
