import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1B1F3B",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 600,
            color: "#E8A33D",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Bangalore · Platonic companionship
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            color: "#FBF7F1",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Someone to talk to.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            color: "#FBF7F1",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 28,
          }}
        >
          No judgment.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#C98F65",
            textAlign: "center",
          }}
        >
          Coffee · Walks · Movies · Runs · Gym · Just talk
        </div>
      </div>
    ),
    { ...size },
  );
}
