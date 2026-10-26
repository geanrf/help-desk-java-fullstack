import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute, RoleRoute } from '../auth/ProtectedRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { CreateTicketPage } from '../pages/CreateTicketPage'
import { DashboardPage } from '../pages/DashboardPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { RegisterPage } from '../pages/RegisterPage'
import { TicketDetailPage } from '../pages/TicketDetailPage'
import { TicketsPage } from '../pages/TicketsPage'
import { UsersPage } from '../pages/UsersPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'tickets',
        element: <TicketsPage />,
      },
      { path: 'tickets/new', element: <CreateTicketPage /> },
      { path: 'tickets/:ticketId', element: <TicketDetailPage /> },
      {
        path: 'dashboard',
        element: (
          <RoleRoute allowedRoles={['ADMIN', 'TECNICO']}>
            <DashboardPage />
          </RoleRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <RoleRoute allowedRoles={['ADMIN']}>
            <UsersPage />
          </RoleRoute>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
