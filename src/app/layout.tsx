import type { Metadata } from "next";
import { Poppins, Archivo, Noto_Sans_KR, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  weight: ["500", "700", "800"],
  subsets: ["latin"],
});

const notoKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EV Laser | 정밀 레이저 기술 전문기업",
  description:
    "EV Laser는 2002년 설립된 레이저기술 전문기업으로, 자동차·반도체·바이오의료·항공 등 첨단 제조 산업을 위한 정밀 레이저 솔루션을 제공합니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${poppins.variable} ${archivo.variable} ${notoKR.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
