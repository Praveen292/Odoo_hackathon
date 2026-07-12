import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// apply saved theme
try{
  const t = localStorage.getItem('transit_theme')
  if(t === 'dark') document.documentElement.classList.add('dark')
}catch(e){}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
