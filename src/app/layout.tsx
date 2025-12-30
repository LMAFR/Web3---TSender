import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "TSender",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {props.children}
        </Providers>
      </body>
    </html>
  );
}
