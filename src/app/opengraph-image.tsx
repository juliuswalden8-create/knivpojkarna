import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F5F2EB",
          padding: "72px",
          color: "#1D1D1B",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="92" height="22" viewBox="0 0 200 48">
            <path fill="#1D1D1B" d="M84 16.5h74c8.2.3 15.6 3.4 23.2 9.5-7.8 6.6-15.4 9.8-24 10.2H84z" />
            <rect x="71.5" y="14.2" width="13.2" height="21.6" rx="1.2" fill="#1D1D1B" />
            <path
              d="M71.5 17.4H26.5c-8.4 0-13.2 3.4-13.2 8.6s4.8 8.6 13.2 8.6h45"
              fill="none"
              stroke="#1D1D1B"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="33.5" cy="26" r="2.05" fill="#1D1D1B" />
            <circle cx="52.5" cy="26" r="2.05" fill="#1D1D1B" />
          </svg>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 3 }}>BladeBud</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 64, lineHeight: 1.05 }}>Sharp knives.</div>
          <div style={{ display: "flex", fontSize: 64, lineHeight: 1.05 }}>Zero hassle.</div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 24, color: "#5C675F" }}>
            Picked up and delivered in Marbella.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#5C675F" }}>
          <div style={{ display: "flex" }}>BladeBud</div>
          <div style={{ display: "flex" }}>Marbella · Fuengirola</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
