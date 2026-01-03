"use client";

import type { ComponentPropsWithoutRef } from "react";

type SpinnerProps = Omit<ComponentPropsWithoutRef<"svg">, "children"> & {
  size?: number;
};

export default function Spinner({ size = 20, className, ...props }: SpinnerProps) {
  return (
    <svg
      className={className ? `animate-spin ${className}` : "animate-spin"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Loading"
      role="status"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        opacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}
