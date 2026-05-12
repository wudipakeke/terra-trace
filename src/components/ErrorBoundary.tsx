import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#666',
          padding: 20,
          gap: 12,
        }}>
          <span style={{ fontSize: 32 }}>⚠️</span>
          <div style={{ fontSize: 14 }}>渲染出现错误</div>
          {this.state.error && (
            <pre style={{ fontSize: 11, color: '#999', maxWidth: 400, overflow: 'auto', textAlign: 'center' }}>
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: '1px solid #1a73e8',
              background: '#fff',
              color: '#1a73e8',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
