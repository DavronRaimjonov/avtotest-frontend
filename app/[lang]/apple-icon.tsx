import { ImageResponse } from "next/og";

// iPhone "Bosh ekranga qo'shish" ikonkasi (PNG talab qilinadi) — public/brand/pravakey-icon.svg bilan bir xil.
// Satori SVG ichidagi <text> ni chizmaydi, shuning uchun "P" harfi alohida div bilan ustiga qo'yiladi
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// pravakey-icon.svg: 128×128 maydon, belgi (98×66) translate(14,31) da
const S = 180 / 128;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0E1A3A" }}>
        <svg
          width={98 * S}
          height={66 * S}
          viewBox="0 0 98 66"
          style={{ position: "absolute", left: 14 * S, top: 31 * S }}
        >
          <rect x="46" y="27" width="50" height="12" rx="3" fill="#FFFFFF" />
          <rect x="72" y="39" width="8" height="10" rx="1.5" fill="#FFFFFF" />
          <rect x="85" y="39" width="8" height="15" rx="1.5" fill="#FFFFFF" />
          <circle cx="32" cy="33" r="31" fill="#FFC21A" />
          <circle cx="32" cy="33" r="25" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.15" />
        </svg>
        <div
          style={{
            position: "absolute",
            left: (14 + 32 - 31) * S,
            top: (31 + 33 - 31) * S,
            width: 62 * S,
            height: 62 * S,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34 * S,
            fontWeight: 800,
            color: "#0E1A3A",
          }}
        >
          P
        </div>
      </div>
    ),
    size,
  );
}
