/*
 * main.jsx: the starting point of the frontend.
 * Purpose: starts React and loads the global styles in the right order.
 * What it does: loads the design tokens before App and uml_theme.css after it, so the theme
 * overrides the page stylesheets, then renders <App /> into #root.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './css/design_tokens.css'
import App from './App.jsx'
import './css/uml_theme.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
