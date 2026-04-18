import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { PrivateRoute } from './PrivateRoute';
// Lazy load pages
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetail = lazy(() => import('../pages/OrderDetail'));
const Categories = lazy(() => import('../pages/Categories'));
const Products = lazy(() => import('../pages/Products'));
const Tables = lazy(() => import('../pages/Tables'));
const WaiterCalls = lazy(() => import('../pages/WaiterCalls'));
const Users = lazy(() => import('../pages/Users'));
const Reports = lazy(() => import('../pages/Reports'));
const Settings = lazy(() => import('../pages/Settings'));
const PublicMenu = lazy(() => import('../pages/PublicMenu'));
const AdminOrganizations = lazy(() => import('../pages/AdminOrganizations'));
const AdminPlans = lazy(() => import('../pages/AdminPlans'));
const Onboarding = lazy(() => import('../pages/Onboarding'));
const AuditLog = lazy(() => import('../pages/AuditLog'));
const Sessions = lazy(() => import('../pages/Sessions'));
const Addons = lazy(() => import('../pages/Addons'));
const AdminSetup = lazy(() => import('../pages/AdminSetup'));
// Loading fallback
const PageLoader = () =>
<div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>;

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/setup" element={<AdminSetup />} />

        {/* Public Menu Route */}
        <Route element={<PublicLayout />}>
          <Route path="/cardapio/:tableToken" element={<PublicMenu />} />
        </Route>

        {/* Onboarding — fullscreen, no sidebar */}
        <Route
          path="/onboarding"
          element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
          <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }>

          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="menu/categories" element={<Categories />} />
          <Route path="menu/products" element={<Products />} />
          <Route path="menu/addons" element={<Addons />} />
          <Route path="tables" element={<Tables />} />
          <Route path="waiter-calls" element={<WaiterCalls />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="admin/organizations" element={<AdminOrganizations />} />
          <Route path="admin/plans" element={<AdminPlans />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>);

}