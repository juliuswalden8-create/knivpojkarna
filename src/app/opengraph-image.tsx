import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const wordmark = await readFile(join(process.cwd(), "public/brand/bladebud-logo.png"));
  const wordmarkSrc = `data:image/png;base64,${wordmark.toString("base64")}`;

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
        <div style={{ display: "flex" }}>
          <img src={wordmarkSrc} width={220} height={189} alt="" />
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
