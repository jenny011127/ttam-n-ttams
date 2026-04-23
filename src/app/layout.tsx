import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "땀앤땀스 — 흘린 땀은, 어디서든 통한다",
  description: "자격증 학원 비교부터 수강 신청까지. 국비지원 학원을 한눈에 비교하고, 합격률 높은 학원을 찾아보세요.",
  openGraph: {
    title: "땀앤땀스 — 흘린 땀은, 어디서든 통한다",
    description: "자격증 학원 비교부터 수강 신청까지. 국비지원 학원을 한눈에 비교하세요.",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
