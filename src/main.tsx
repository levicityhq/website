import { ClerkProvider } from '@clerk/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      afterSignOutUrl="/"
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
      appearance={{
        options: {
          shimmer: false,
        },
        variables: {
          colorPrimary: 'var(--color-accent)',
          colorPrimaryForeground: 'var(--color-ink)',
          colorBackground: 'var(--color-canvas)',
          colorForeground: 'var(--color-foreground)',
          colorMutedForeground: 'var(--color-muted)',
          colorNeutral: 'var(--color-foreground)',
          colorMuted: 'var(--color-surface)',
          colorInput: 'var(--color-input)',
          colorInputForeground: 'var(--color-foreground)',
          colorBorder: 'var(--color-divider)',
          colorRing: 'var(--color-accent)',
          colorDanger: '#ff8585',
          colorSuccess: '#81d9a4',
          colorWarning: 'var(--color-accent)',
          colorModalBackdrop: 'rgba(0, 0, 0, 0.78)',
          fontFamily: 'var(--font-sans)',
          fontFamilyButtons: 'var(--font-mono)',
          fontFamilyMono: 'var(--font-mono)',
          borderRadius: '0.375rem',
        },
        elements: {
          cardBox: { border: '1px solid var(--color-divider)' },
          headerTitle: { fontWeight: 800, letterSpacing: '-0.04em' },
          formFieldLabel: {
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
          },
          formButtonPrimary: {
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': { backgroundColor: 'var(--color-accent-hover)' },
          },
          footerActionLink: { color: 'var(--color-accent)' },
          userButtonTrigger: {
            backgroundColor: 'transparent',
            transition: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          },
          userButtonPopoverCard: { border: '1px solid var(--color-divider)' },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
