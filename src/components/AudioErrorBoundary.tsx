import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onAudioDisabled?: () => void;
}

interface State {
  hasError: boolean;
}

export class AudioErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn('[AudioErrorBoundary] Audio error caught, disabling audio:', error.message, info.componentStack);
    this.props.onAudioDisabled?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
