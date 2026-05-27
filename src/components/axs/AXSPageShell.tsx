import type { ReactNode } from "react";

interface AXSPageShellProps {
  title?: string;
  children: ReactNode;
  rightRail?: ReactNode;
  className?: string;
}

export function AXSPageShell({
  title,
  children,
  rightRail,
  className = "",
}: AXSPageShellProps) {
  return (
    <main className="axs-main-shell">
      <div className="axs-bg-depth" aria-hidden="true" />
      <div className="axs-workspace-focus" aria-hidden="true" />

      <div className="axs-page-inner relative z-10">
        {title ? (
          <div className="axs-page-title-container">
            <div className="axs-page-title">
              <span>{title}</span>
            </div>
          </div>
        ) : null}

        <div className={`axs-page-grid min-w-0 ${rightRail ? "has-right-rail" : ""}`}>
          <div className="axs-page-content-container">
            <section className={`axs-page-content min-w-0 ${className}`}>
              {children}
            </section>
          </div>

          {rightRail ? (
            <aside className="axs-right-rail min-w-0">{rightRail}</aside>
          ) : null}
        </div>
      </div>
    </main>
  );
}
