import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DoodleLab - 15 Free Drawing Games";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          position: "relative",
        }}
      >
        {/* Colorful paint splash circles in background */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "150px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
            filter: "blur(40px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            right: "180px",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
            filter: "blur(40px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "150px",
            right: "120px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
            filter: "blur(35px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "120px",
            left: "200px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, transparent 70%)",
            filter: "blur(35px)",
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Unicode art symbols row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "60px",
              marginBottom: "20px",
              gap: "30px",
            }}
          >
            <span style={{ color: "#ec4899" }}>🎨</span>
            <span style={{ color: "#8b5cf6" }}>✏️</span>
            <span style={{ color: "#3b82f6" }}>🖌️</span>
            <span style={{ color: "#22d3ee" }}>🖍️</span>
          </div>

          {/* Site name */}
          <div
            style={{
              fontSize: "96px",
              fontWeight: "900",
              color: "white",
              letterSpacing: "-0.02em",
              marginBottom: "10px",
              display: "flex",
            }}
          >
            DoodleLab
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "40px",
              fontWeight: "400",
              color: "rgba(255, 255, 255, 0.7)",
              display: "flex",
              marginTop: "10px",
            }}
          >
            15 Free Drawing Games
          </div>

          {/* Small decorative line */}
          <div
            style={{
              width: "300px",
              height: "4px",
              background: "linear-gradient(90deg, #ec4899 0%, #8b5cf6 33%, #3b82f6 66%, #22d3ee 100%)",
              borderRadius: "2px",
              marginTop: "30px",
              display: "flex",
            }}
          />

          {/* URL */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: "500",
              color: "rgba(255, 255, 255, 0.5)",
              marginTop: "25px",
              display: "flex",
            }}
          >
            doodlelab.fun
          </div>
        </div>

        {/* Corner decorations */}
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "40px",
            fontSize: "40px",
            opacity: 0.4,
            display: "flex",
          }}
        >
          🎨
        </div>
        <div
          style={{
            position: "absolute",
            top: "30px",
            right: "40px",
            fontSize: "40px",
            opacity: 0.4,
            display: "flex",
          }}
        >
          ✨
        </div>
      </div>
    ),
    { ...size }
  );
}
