import { useAuth } from '@clerk/react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing from './Landing'
import Dashboard from './Dashboard'

export default function App() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded)
    return (
      <div className="workspace-message" role="status">
        Opening Levicity…
      </div>
    )
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isSignedIn ? <Navigate to="/dashboard" replace /> : <Landing />
          }
        />
        <Route
          path="/dashboard/*"
          element={isSignedIn ? <Dashboard /> : <Navigate to="/" replace />}
        />
        <Route
          path="*"
          element={<Navigate to={isSignedIn ? '/dashboard' : '/'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
