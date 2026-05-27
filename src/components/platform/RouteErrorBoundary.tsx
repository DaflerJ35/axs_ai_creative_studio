import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, RotateCcw } from "lucide-react";
import type { ForgeTab } from "../../lib/types";

interface RouteErrorBoundaryProps {
  activeTab: ForgeTab;
  onResetLocalSettings?: () => void;
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  error: Error | null;
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prevProps: RouteErrorBoundaryProps) {
    if (prevProps.activeTab !== this.props.activeTab && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("AXS route crashed", { activeTab: this.props.activeTab, error, info });
  }

  render() {
    if (!this.state.error) return this.props.children;

    const isConfig = this.props.activeTab === "config";

    return (
      <section className="axs-route-error">
        <div className="axs-route-error__inner">
          <p className="axs-route-error__kicker">{isConfig ? "Config Recovery" : "Route Recovery"}</p>
          <h1>
            {isConfig
              ? "Config settings unavailable. Check connection or reset local settings."
              : "This studio surface hit a recoverable error."}
          </h1>
          <p>
            The AXS shell is still alive. You can retry the page, reset local settings, or jump to another module from the sidebar.
          </p>
          <div className="axs-route-error__actions">
            <button type="button" onClick={() => this.setState({ error: null })}>
              <RefreshCw className="size-4" />
              Retry Page
            </button>
            {this.props.onResetLocalSettings ? (
              <button type="button" onClick={this.props.onResetLocalSettings}>
                <RotateCcw className="size-4" />
                Reset Local Settings
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }
}
