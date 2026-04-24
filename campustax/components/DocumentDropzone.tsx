"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocumentDropzoneProps {
  formType: "w2" | "1098t" | "1042s";
  label: string;
  description: string;
  onExtracted: (data: Record<string, unknown>) => void;
}

type Status = "idle" | "uploading" | "success" | "error";

export function DocumentDropzone({ formType, label, description, onExtracted }: DocumentDropzoneProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setStatus("uploading");
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("formType", formType);

      try {
        const res = await fetch("/api/extract", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Extraction failed");
        }
        const { data } = await res.json();
        onExtracted(data);
        setStatus("success");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        setStatus("error");
      }
    },
    [formType, onExtracted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "image/*": [".jpg", ".jpeg", ".png"] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive && "border-primary bg-primary/5",
        status === "success" && "border-green-500 bg-green-50 dark:bg-green-950/20",
        status === "error" && "border-destructive bg-destructive/5",
        status === "idle" && !isDragActive && "border-border hover:border-primary/50 hover:bg-accent/30"
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-2">
        {status === "uploading" ? (
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        ) : status === "success" ? (
          <CheckCircle className="h-8 w-8 text-green-500" />
        ) : status === "error" ? (
          <AlertCircle className="h-8 w-8 text-destructive" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}

        <div>
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>

        {fileName && (
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <FileText className="h-3 w-3" />
            {fileName}
          </Badge>
        )}

        {status === "uploading" && (
          <p className="text-xs text-muted-foreground">Extracting with Claude…</p>
        )}
        {status === "success" && (
          <p className="text-xs text-green-600 font-medium">Fields extracted successfully</p>
        )}
        {status === "error" && error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        {status === "idle" && (
          <p className="text-xs text-muted-foreground">PDF or image · click or drag to upload</p>
        )}
      </div>
    </div>
  );
}
