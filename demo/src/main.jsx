import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
// Sistema de tokens --gcu-* (Toast, Icon, GranCrmExtras). El resto del demo
// corre sobre bootstrap.min.css/theme.min.css (ver demo/index.html).
import '../../src/styles/grancrm-ui.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
