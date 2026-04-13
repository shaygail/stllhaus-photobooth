"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { error: Error | null };

/**
 * Catches render errors (e.g. invalid dates) so guests never see a totally blank screen.
 */
export class DigitalRouteBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[digital-keepsake]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f4f1ec] px-6 py-12 text-center"
          style={{ color: "#292524", fontFamily: "system-ui, sans-serif" }}
        >
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="max-w-md text-sm opacity-90">
            {this.state.error.message}
          </p>
          <p className="max-w-sm text-xs opacity-75">
            Try again, or ask staff to re-print your QR. If you are on the booth
            Wi‑Fi, make sure the link uses the same address as the booth tablet.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
