import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import './styles/tokens.css'
import './styles/shadcn-theme.css'
import './styles/tailwind.css'
// Translations first: every component below uses them
import { i18nReady } from './lib/i18n.js'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { Toaster } from './components/ui/sonner.jsx'
import { TooltipProvider } from './components/ui/tooltip.jsx'
import DirectionProvider from './components/DirectionProvider.jsx'
import App from './App.jsx'

// Wait for the language file (a few KB) so the first paint is already in the right language
i18nReady.finally(() =>
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      {/* Only shown if a translation file is still loading (normally never) */}
      <Suspense fallback={null}>
        <DirectionProvider>
          <ThemeProvider>
            <AuthProvider>
              <BrowserRouter>
                {/* shadcn tooltips need one provider around the app;
              reducedMotion="user": Motion skips movement for people who ask for less motion */}
                <TooltipProvider>
                  <MotionConfig reducedMotion="user">
                    <App />
                    {/* toasts: toast('…') from 'sonner'. On phones they sit above the bottom tab bar */}
                    <Toaster position="bottom-center" mobileOffset={{ bottom: 88 }} />
                  </MotionConfig>
                </TooltipProvider>
              </BrowserRouter>
            </AuthProvider>
          </ThemeProvider>
        </DirectionProvider>
      </Suspense>
    </StrictMode>,
  ),
)
