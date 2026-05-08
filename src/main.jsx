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
