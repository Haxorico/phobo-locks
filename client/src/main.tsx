import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CKE from './CKE'
import './index.css'
// import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CKE/>
    {/* <App /> */}
  </StrictMode>,
)
