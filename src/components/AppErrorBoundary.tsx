import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AppErrorBoundary] Caught unhandled error:', error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0D0510',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              color: '#D4AF37',
              opacity: 0.5,
              marginBottom: '1.5rem',
              animation: 'none',
            }}
          >
            ◈
          </div>
          <h2
            style={{
              fontFamily: "'Cinzel', 'Times New Roman', serif",
              color: '#D4AF37',
              fontSize: '1.5rem',
              fontWeight: 400,
              marginBottom: '1rem',
              letterSpacing: '0.05em',
            }}
          >
            Something interrupted the journey.
          </h2>
          <p
            style={{
              color: '#B8A99A',
              fontSize: '0.9rem',
              marginBottom: '2rem',
              maxWidth: '400px',
              lineHeight: 1.6,
            }}
          >
            An unexpected disturbance arose. Your progress has been preserved.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '1rem 2.5rem',
              background: 'transparent',
              color: '#D4AF37',
              border: '1px solid #D4AF37',
              borderRadius: '50px',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.9rem',
              letterSpacing: '0.15em',
              cursor: 'pointer',
            }}
          >
            Return to the beginning
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
