import { Button } from "@/components/ui/button";
import { BarChart2, DollarSign, Shield, Users } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">SalaryFlow</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Modern Salary Management for Growing Teams
          </h1>
          <p className="text-primary-foreground/80 text-lg mb-12">
            Streamline payroll processing, generate payslips, and gain insights
            into your workforce compensation.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: Users,
                label: "Employee Management",
                desc: "Manage all employee records",
              },
              {
                icon: BarChart2,
                label: "Rich Reports",
                desc: "Department-wise analytics",
              },
              {
                icon: DollarSign,
                label: "Salary Processing",
                desc: "One-click bulk processing",
              },
              {
                icon: Shield,
                label: "Secure & Reliable",
                desc: "Built on Internet Computer",
              },
            ].map((f) => (
              <div key={f.label} className="bg-white/10 rounded-xl p-4">
                <f.icon className="w-5 h-5 mb-2" />
                <div className="font-semibold text-sm">{f.label}</div>
                <div className="text-xs text-primary-foreground/70 mt-0.5">
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        <p className="text-primary-foreground/50 text-sm">
          © {new Date().getFullYear()} SalaryFlow Inc. All rights reserved.
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SalaryFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome back
          </h2>
          <p className="text-muted-foreground mb-8">
            Sign in to access your salary management dashboard.
          </p>

          <Button
            data-ocid="login.primary_button"
            className="w-full h-11 text-base font-medium"
            onClick={() => login()}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing in..." : "Sign in with Internet Identity"}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Secure authentication powered by DFINITY Internet Identity
          </p>
        </motion.div>
      </div>
    </div>
  );
}
