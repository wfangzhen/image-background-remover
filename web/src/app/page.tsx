"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://YOUR-WORKER.workers.dev";

type UploadState = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("仅支持 JPG、PNG、WebP 格式");
      setUploadState("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("文件过大，最大支持 10MB");
      setUploadState("error");
      return;
    }

    setErrorMessage("");
    setUploadState("loading");

    const reader = new FileReader();
    reader.onload = (e) => setOriginalImage(e.target?.result as string);
    reader.readAsDataURL(file);

    const base64 = await fileToBase64(file);
    const base64Data = base64.split(",")[1];

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64Data }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "处理失败");
      }

      setResultImage(`data:image/png;base64,${data.image_base64}`);
      setUploadState("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "处理失败，请重试");
      setUploadState("error");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "background-removed.png";
    link.click();
  };

  const reset = () => {
    setUploadState("idle");
    setOriginalImage(null);
    setResultImage(null);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            🖼️ 图片背景移除工具
          </h1>
          <p className="text-gray-500">上传图片，自动移除背景</p>
        </div>

        {uploadState === "idle" || uploadState === "error" ? (
          <div
            className={`
              border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer
              transition-all duration-300
              ${isDragOver ? "border-purple-500 bg-purple-50" : "border-purple-500 bg-purple-50 hover:bg-purple-100"}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-6xl mb-4">📤</div>
            <p className="text-lg text-gray-600 mb-2">拖拽图片到这里，或点击选择</p>
            <p className="text-sm text-gray-400">支持 JPG、PNG、WebP，最大 10MB</p>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
          </div>
        ) : null}

        {uploadState === "loading" && (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">正在移除背景...</p>
          </div>
        )}

        {uploadState === "success" && originalImage && resultImage && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500 mb-2">原图</h3>
                <div className="rounded-xl overflow-hidden shadow-md">
                  <img src={originalImage} alt="原图" className="w-full h-auto" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500 mb-2">结果</h3>
                <div className="rounded-xl overflow-hidden shadow-md bg-[repeating-conic-gradient(#ccc_0%_25%,_#fff_0%_50%)]_50%_/_20px_20px">
                  <img src={resultImage} alt="处理后" className="w-full h-auto relative z-10" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={downloadResult} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                下载图片
              </button>
              <button onClick={reset} className="px-6 py-3 bg-purple-50 text-purple-500 font-semibold rounded-xl hover:bg-purple-100 transition-all duration-300">
                处理下一张
              </button>
            </div>
          </div>
        )}

        {uploadState === "error" && errorMessage && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
            {errorMessage}
          </div>
        )}

        <div className="text-center mt-8 text-xs text-gray-400">
          Powered by Remove.bg + Cloudflare Workers
        </div>
      </div>
    </main>
  );
}
