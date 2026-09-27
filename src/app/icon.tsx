import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1B1F3B",
          borderRadius: 8,
        }}
      >
        <span
          style={{
            color: "#E8A33D",
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "sans-serif",
          }}
        >
          S
        </span>
      </div>
    ),
    { ...size },
  );
}
