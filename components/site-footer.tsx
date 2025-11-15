export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border/60 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-center sm:text-left">
          <p className="text-[11px] text-muted-foreground">Trade</p>
          <p className="mt-1 text-[10px] text-muted-foreground">All rights reserved © 2025 — Trade</p>
        </div>
        <span className="rounded-md bg-brand px-2 py-1 text-[10px] font-medium text-brand-foreground">Verified</span>
      </div>
    </footer>
  )
}
