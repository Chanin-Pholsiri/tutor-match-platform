"use client";

import { useId, useState } from "react";
import { Upload } from "lucide-react";

export function DocumentUpload({
  label,
  kind,
  tutorProfileId,
  hasExisting,
}: {
  label: string;
  kind: "idCard" | "credential";
  tutorProfileId: string;
  hasExisting: boolean;
}) {
  const inputId = useId();
  const [uploaded, setUploaded] = useState(hasExisting);
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
      form.set("kind", kind);
      const res = await fetch("/api/upload/document", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "อัปโหลดไม่สำเร็จ");
      } else {
        setUploaded(true);
        setFileName(file.name);
      }
    } catch {
      setError("อัปโหลดไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="label">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className="btn-secondary cursor-pointer text-sm has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
        >
          <Upload size={15} strokeWidth={2} />
          {uploading ? "กำลังอัปโหลด..." : uploaded ? "อัปโหลดใหม่" : "เลือกไฟล์"}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFile}
          disabled={uploading}
          className="sr-only"
        />
        {uploaded && !uploading && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
            ✓ อัปโหลดแล้ว{fileName ? `: ${fileName}` : ""}
            <a
              href={`/api/admin/documents?tutorProfileId=${tutorProfileId}&kind=${kind}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ดูไฟล์
            </a>
          </span>
        )}
      </div>
      {error && <p className="field-error mt-1.5">{error}</p>}
    </div>
  );
}
