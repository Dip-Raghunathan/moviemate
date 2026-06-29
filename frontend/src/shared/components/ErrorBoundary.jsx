import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error boundary caught an error', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'linear-gradient(135deg, #05050a 0%, #0d0d1a 100%)',
            color: '#f0f0fa',
          }}
        >
          <div
            style={{
              maxWidth: '34rem',
              width: '100%',
              borderRadius: '1.25rem',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(17,17,34,0.96)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
              padding: '2rem',
            }}
          >
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ff4b5e', marginBottom: '0.75rem' }}>
              Runtime failure
            </p>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Something went wrong</h1>
            <p style={{ color: '#a8a8c0', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              PhilixMate hit an unexpected error. A refresh will usually recover quickly, and you can try again below.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.8rem 1rem',
                borderRadius: '0.8rem',
                background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
                color: 'white',
                fontWeight: 700,
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
