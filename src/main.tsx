// src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Auth0Provider } from '@auth0/auth0-react'
import { ThemeProvider } from './context/theme-provider.tsx'

const domain = import.meta.env.VITE_AUTH_DOMAIN
const clientId = import.meta.env.VITE_AUTH_CLIENT_ID
const audience = import.meta.env.VITE_BACKEND_URL

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: globalThis.location.origin,
        audience
      }}
    >
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </Auth0Provider>
  </StrictMode>,
)
