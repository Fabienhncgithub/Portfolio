import { ImageResponse } from "next/og";

export const alt = "Fabien Hance — Photographer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-end",
          background: "#f7f6f2",
          color: "#181817",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", fontSize: 82, letterSpacing: "-5px", lineHeight: 0.88 }}>
          <span>Fabien</span>
          <span>Hance</span>
        </div>
        <div style={{ fontSize: 28 }}>Photography</div>
      </div>
    ),
    size,
  );
}
