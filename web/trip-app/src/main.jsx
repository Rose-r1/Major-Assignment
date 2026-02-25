import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.jsx'
import Login from './login/login.jsx'


function AuthGate() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'))

  const handleLogin = (token) => {
    localStorage.setItem('token', token)
    setAuthed(true)
  }

  return authed ? <App /> : <Login onLogin={handleLogin} />
  //return <Login onLogin={handleLogin} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthGate />
    </BrowserRouter>
  </StrictMode>,
)
