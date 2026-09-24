import { useState } from "react";

export function useImageUpload(_folder?: string) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      setPreview(data.url);
      return data;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, preview, setPreview };
}
