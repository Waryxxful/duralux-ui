import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// Canon visual del paquete: Bootstrap, adaptación Duralux y glue GranCRM.
import '../../scss/bootstrap/bootstrap.scss'
import '../../scss/theme.scss'
import '../../src/styles/grancrm-ui.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
