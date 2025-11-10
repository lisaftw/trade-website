export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Background shading image from the UI pack */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat opacity-90 dark:opacity-100"
        style={{
          backgroundImage: "url('/home/bg-shading.jpg')",
          backgroundSize: "cover",
        }}
      />

      {/* Subtle monochrome gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-foreground/5" />

      {/* Soft radial glow (grayscale) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)] animate-pulse-glow" />

      {/* Very subtle diagonal sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-foreground/10 to-transparent opacity-30" />

      {/* Floating blurred blobs in grayscale */}
      <div className="absolute left-[10%] top-[15%] h-64 w-64 rounded-full bg-foreground/10 blur-[100px] animate-float-slow" />
      <div
        className="absolute right-[15%] top-[40%] h-80 w-80 rounded-full bg-foreground/5 blur-[120px] animate-float-medium"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute left-[60%] bottom-[20%] h-56 w-56 rounded-full bg-foreground/10 blur-[90px] animate-float-slow"
        style={{ animationDelay: "4s" }}
      />

      {/* Checkerboard micro-texture */}
      <div className="absolute inset-0 opacity-[0.08] [animation:move-checkerboard_8s_linear_infinite] [background:linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.25)_1px,transparent_1px)] bg-[length:40px_40px]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]" />
    </div>
  )
}
