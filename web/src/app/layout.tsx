import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "图片背景移除工具",
  description: "Upload an image and remove its background automatically",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
