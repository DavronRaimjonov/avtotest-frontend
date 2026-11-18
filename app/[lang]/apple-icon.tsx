import { ImageResponse } from "next/og";

// iPhone "Bosh ekranga qo'shish" ikonkasi (PNG talab qilinadi) — navbar logosi bilan bir xil
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFC21A" }}>
        <svg width="112" height="112" viewBox="0 0 24 24" fill="none" stroke="#0E1A3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 14.5V21M9.6 11.2 3.4 9.5M14.4 11.2l6.2-1.7" />
        </svg>
      </div>
    ),
    size,
  );
}
