// hooks/useImageWithPrep.ts

"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface UseImageWithPrepReturn {
  uploading: boolean;
  prepSrc: string | null;
  startUpload: (file: File, onDone: (url: string) => void) => void;
  confirmAndUpload: (processedUrl: string) => Promise<void>;
  cancelPrep: () => void;
}

export function useImageWithPrep(): UseImageWithPrepReturn {
  const [uploading, setUploading] = useState(false);
  const [prepSrc, setPrepSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [onDoneCallback, setOnDoneCallback] = useState<
    ((url: string) => void) | null
  >(null);

  const startUpload = useCallback(
    (file: File, onDone: (url: string) => void) => {
      setPendingFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPrepSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setOnDoneCallback(() => onDone);
    },
    []
  );

  const confirmAndUpload = useCallback(
    async (processedUrl: string) => {
      setPrepSrc(null);
      setUploading(true);
      try {
        let blob: Blob;
        if (processedUrl.startsWith("data:")) {
          const res = await fetch(processedUrl);
          blob = await res.blob();
        } else if (pendingFile) {
          blob = pendingFile;
        } else {
          return;
        }

        const fd = new FormData();
        fd.append("file", blob, pendingFile?.name || "image.jpg");
        fd.append("folder", "aquila/gallery");

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        onDoneCallback?.(data.url);
        toast.success("Image uploaded ✓");
      } catch (err: any) {
        toast.error("Upload failed: " + err.message);
      } finally {
        setUploading(false);
        setPendingFile(null);
        setOnDoneCallback(null);
      }
    },
    [pendingFile, onDoneCallback]
  );

  const cancelPrep = useCallback(() => {
    setPrepSrc(null);
    setPendingFile(null);
    setOnDoneCallback(null);
  }, []);

  return { uploading, prepSrc, startUpload, confirmAndUpload, cancelPrep };
}