import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import './styles/tokens.css'
import './styles/shadcn-theme.css'
import './styles/tailwind.css'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { Toaster } from './components/ui/sonner.jsx'
import { TooltipProvider } from './components/ui/tooltip.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
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
  </StrictMode>,
)
