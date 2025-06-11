import '@chad-chat/ui/styles/globals.css'
import { Button } from '@chad-chat/ui/components/button'
import React from 'react'
import reactDom from 'react-dom/client'
import { ThemeProvider } from './components/theme-provider'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

reactDom.createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider>
      <Button>hi</Button>
    </ThemeProvider>
  </React.StrictMode>,
)
