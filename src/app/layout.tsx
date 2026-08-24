import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Тренировки с Анной Митюшовой",
  description: "Запись на тренировки и управление участием",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}