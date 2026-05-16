import React from 'react'
import ReactDOM from 'react-dom/client'
import MealPlanner from './MealPlanner.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <MealPlanner />
    </ErrorBoundary>
  </React.StrictMode>
)

// React 마운트 후 정적 콘텐츠 숨기기 (크롤러는 JS 실행 전 정적 콘텐츠를 읽음)
const staticEl = document.getElementById('static-landing')
if (staticEl) staticEl.style.display = 'none'
