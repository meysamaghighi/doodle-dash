import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
          borderRadius: 40,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <path d="M8 24 C8 24 10 8 16 8 C22 8 24 24 24 24" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="16" cy="7" r="2" fill="#f97316" />
          <path d="M10 20 Q16 14 22 20" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
