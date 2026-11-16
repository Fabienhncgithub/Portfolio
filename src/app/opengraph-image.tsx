import { ImageResponse } from "next/og";
import { siteName } from "@/lib/site";

export const alt = `${siteName} — Photographer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const [firstName, lastName] = siteName.split(" ");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f7f6f2",
          color: "#181817",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 168,
            lineHeight: 0.86,
            letterSpacing: -10,
          }}
        >
          <span>{firstName}</span>
          <span>{lastName}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#6b6a65",
            fontSize: 26,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>Photographer</span>
          <span>Landscapes, trails, everyday moments</span>
        </div>
      </div>
    ),
    size,
  );
}
