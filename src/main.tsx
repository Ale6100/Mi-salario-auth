// src/main.tsx

import './index.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { CookiesProvider } from 'react-cookie'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { ThemeProvider } from './context/theme-provider.tsx'
import App from './App.tsx'

const domain = import.meta.env.VITE_AUTH_DOMAIN
const clientId = import.meta.env.VITE_AUTH_CLIENT_ID
const audience = import.meta.env.VITE_AUTH_AUDIENCE

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CookiesProvider>
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
    </CookiesProvider>
  </StrictMode>,
)
