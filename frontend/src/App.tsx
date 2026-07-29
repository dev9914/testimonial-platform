import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ToastProvider from './context/ToastContext'
import MainLayout from './layouts/MainLayout'
import SubmissionPage from './pages/SubmissionPage'
import DashboardPage from './pages/DashboardPage'
import PublicWallPage from './pages/PublicWallPage'
import EmbedPage from './pages/EmbedPage'
import WidgetPage from './pages/WidgetPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/embed" element={<EmbedPage />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<SubmissionPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/wall" element={<PublicWallPage />} />
              <Route path="/widget" element={<WidgetPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
