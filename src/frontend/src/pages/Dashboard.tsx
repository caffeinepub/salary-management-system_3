import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  DollarSign,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  useDashboardStats,
  useListEmployees,
  useSalaryRegister,
} from "../hooks/useQueries";
import {
  MONTHS,
  currentMonth,
  currentYear,
  formatINR,
  formatMonthYear,
} from "../lib/formatters";

const YEARS = Array.from({ length: 5 }, (_, i) => currentYear() - 2 + i);

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(currentYear());

  const { data: stats, isLoading: statsLoading } = useDashboardStats(
    month,
    year,
  );
  const { data: register, isLoading: regLoading } = useSalaryRegister(
    month,
    year,
  );
  const { data: employees } = useListEmployees();

  const activeCount = employees?.filter((e) => e.isActive).length ?? 0;
  const avgSalary =
    stats && Number(stats.totalEmployees) > 0
      ? stats.totalNetSalary / Number(stats.totalEmployees)
      : 0;

  const kpis = [
    {
      label: "Total Employees",
      value: statsLoading ? null : Number(stats?.totalEmployees ?? 0),
      format: (v: number) => v.toString(),
      icon: Users,
      color: "text-primary",
      bg: "bg-blue-50",
      sub: `${activeCount} active`,
    },
    {
      label: "Monthly Disbursement",
      value: statsLoading ? null : (stats?.totalNetSalary ?? 0),
      format: formatINR,
      icon: DollarSign,
      color: "text-success",
      bg: "bg-green-50",
      sub: formatMonthYear(month, year),
    },
    {
      label: "Average Net Salary",
      value: statsLoading ? null : avgSalary,
      format: formatINR,
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-50",
      sub: "Per employee",
    },
    {
      label: "Active Employees",
      value: statsLoading ? null : activeCount,
      format: (v: number) => v.toString(),
      icon: UserCheck,
      color: "text-violet-500",
      bg: "bg-violet-50",
      sub: `Out of ${employees?.length ?? 0} total`,
    },
  ];

  const recentRecords = (register ?? []).slice(0, 8);
  const deptBreakdown = stats?.departmentBreakdown ?? [];
  const maxDeptSalary = Math.max(...deptBreakdown.map(([, v]) => v), 1);

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <p className="text-sm text-muted-foreground">
          Overview for selected period
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger
              className="w-36 h-9"
              data-ocid="dashboard.month.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger
              className="w-24 h-9"
              data-ocid="dashboard.year.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <Card className="shadow-card border border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {kpi.label}
                    </p>
                    {kpi.value === null ? (
                      <Skeleton className="h-8 w-28 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {kpi.format(kpi.value as number)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {kpi.sub}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}
                  >
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card border border-border lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Department Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : deptBreakdown.length === 0 ? (
              <p
                className="text-sm text-muted-foreground text-center py-4"
                data-ocid="dashboard.dept.empty_state"
              >
                No salary data for this period
              </p>
            ) : (
              <div className="space-y-3">
                {deptBreakdown.map(([dept, amount]) => (
                  <div key={dept}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">
                        {dept}
                      </span>
                      <span className="text-muted-foreground">
                        {formatINR(amount)}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(amount / maxDeptSalary) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Recent Salary Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {regLoading ? (
              <div className="px-6 space-y-3 pb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentRecords.length === 0 ? (
              <p
                className="text-sm text-muted-foreground text-center py-8"
                data-ocid="dashboard.records.empty_state"
              >
                No salaries processed for this period
              </p>
            ) : (
              <div className="divide-y divide-border">
                {recentRecords.map((rec, idx) => {
                  const emp = employees?.find((e) => e.id === rec.employeeId);
                  return (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between px-6 py-3"
                      data-ocid={`dashboard.record.item.${idx + 1}`}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {emp?.name ?? rec.employeeId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp?.designation ?? ""} · {emp?.department ?? ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatINR(rec.netSalary)}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {formatMonthYear(rec.month, rec.year)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
