import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#fff',
          textAlign: 'center',
          padding: '2rem',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍱</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>잠시 문제가 생겼어요 😢</h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem', whiteSpace: 'pre-line' }}>
            {'앱을 불러오는 중 문제가 발생했어요.\n새로고침 후 다시 시도해주세요.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#ff6b6b',
              color: '#fff',
              border: '2px solid #fff',
              borderRadius: '2rem',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            새로고침
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
