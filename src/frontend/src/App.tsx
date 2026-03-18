import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import Layout from "./components/Layout";
import LoginPage from "./components/LoginPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useAddEmployee, useListEmployees } from "./hooks/useQueries";
import { SAMPLE_EMPLOYEES } from "./lib/sampleData";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Payslip from "./pages/Payslip";
import Reports from "./pages/Reports";
import SalaryProcessing from "./pages/SalaryProcessing";

function SeedData() {
  const { data: employees, isFetched } = useListEmployees();
  const addMutation = useAddEmployee();
  const seeded = useRef(false);

  useEffect(() => {
    if (!isFetched || !employees || seeded.current) return;
    if (employees.length === 0) {
      seeded.current = true;
      Promise.all(
        SAMPLE_EMPLOYEES.map((emp) => addMutation.mutateAsync(emp)),
      ).catch(() => {});
    }
  });

  return null;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading SalaryFlow...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  return (
    <>
      <SeedData />
      {children}
    </>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthGate>
      <Layout>
        <Outlet />
      </Layout>
    </AuthGate>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const employeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/employees",
  component: Employees,
});

const salaryProcessingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/salary-processing",
  component: SalaryProcessing,
});

const payslipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payslip",
  component: Payslip,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: Reports,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  employeesRoute,
  salaryProcessingRoute,
  payslipRoute,
  reportsRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
