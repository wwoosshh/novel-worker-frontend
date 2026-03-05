"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm" style={{ color: "#8A8478" }}>
            문제가 발생했습니다.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="h-8 px-4 text-xs font-medium rounded-sm transition-colors"
            style={{ backgroundColor: "#D44B20", color: "#FFFFFF" }}
          >
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
