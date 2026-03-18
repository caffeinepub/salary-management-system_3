import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  useAllYTDTotals,
  useDeductionSummary,
  useEmployeeSalaryHistory,
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

function MonthYearPicker({
  month,
  year,
  onMonth,
  onYear,
}: {
  month: number;
  year: number;
  onMonth: (v: number) => void;
  onYear: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select value={String(month)} onValueChange={(v) => onMonth(Number(v))}>
        <SelectTrigger className="w-36 h-9">
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
      <Select value={String(year)} onValueChange={(v) => onYear(Number(v))}>
        <SelectTrigger className="w-24 h-9">
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
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <p
      className="text-center py-12 text-muted-foreground text-sm"
      data-ocid="reports.empty_state"
    >
      {msg}
    </p>
  );
}

function SkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
        <TableRow key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function MonthlyRegister() {
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(currentYear());
  const { data: register, isLoading } = useSalaryRegister(month, year);
  const { data: employees } = useListEmployees();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-foreground">
          Monthly Salary Register
        </h3>
        <MonthYearPicker
          month={month}
          year={year}
          onMonth={setMonth}
          onYear={setYear}
        />
      </div>
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="text-xs font-semibold">Employee</TableHead>
              <TableHead className="text-xs font-semibold">
                Department
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Basic Pay
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Gross Salary
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Deductions
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Net Salary
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows cols={6} />
            ) : (register ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    msg={`No salary records for ${MONTHS[month - 1]} ${year}`}
                  />
                </TableCell>
              </TableRow>
            ) : (
              (register ?? []).map((rec, idx) => {
                const emp = (employees ?? []).find(
                  (e) => e.id === rec.employeeId,
                );
                return (
                  <TableRow
                    key={rec.id}
                    data-ocid={`reports.register.item.${idx + 1}`}
                  >
                    <TableCell>
                      <p className="text-sm font-medium">
                        {emp?.name ?? rec.employeeId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rec.employeeId}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {emp?.department ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      {formatINR(rec.basicPay)}
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      {formatINR(rec.grossSalary)}
                    </TableCell>
                    <TableCell className="text-sm text-right text-destructive">
                      {formatINR(rec.totalDeductions)}
                    </TableCell>
                    <TableCell className="text-sm text-right font-semibold text-success">
                      {formatINR(rec.netSalary)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {(register ?? []).length > 0 && (
          <div className="px-6 py-3 bg-secondary/30 border-t border-border flex justify-end gap-6 text-sm">
            <span className="text-muted-foreground">
              Total Net:{" "}
              <strong className="text-success">
                {formatINR(
                  (register ?? []).reduce((s, r) => s + r.netSalary, 0),
                )}
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function DeptReport() {
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(currentYear());
  const { data: register, isLoading } = useSalaryRegister(month, year);
  const { data: employees } = useListEmployees();

  const deptMap = new Map<
    string,
    { gross: number; net: number; deductions: number; count: number }
  >();
  for (const rec of register ?? []) {
    const emp = (employees ?? []).find((e) => e.id === rec.employeeId);
    const dept = emp?.department ?? "Unknown";
    const cur = deptMap.get(dept) ?? {
      gross: 0,
      net: 0,
      deductions: 0,
      count: 0,
    };
    deptMap.set(dept, {
      gross: cur.gross + rec.grossSalary,
      net: cur.net + rec.netSalary,
      deductions: cur.deductions + rec.totalDeductions,
      count: cur.count + 1,
    });
  }
  const depts = Array.from(deptMap.entries());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-foreground">
          Department-wise Report
        </h3>
        <MonthYearPicker
          month={month}
          year={year}
          onMonth={setMonth}
          onYear={setYear}
        />
      </div>
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="text-xs font-semibold">
                Department
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Employees
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Gross Salary
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Deductions
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Net Salary
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows cols={5} rows={4} />
            ) : depts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    msg={`No data for ${MONTHS[month - 1]} ${year}`}
                  />
                </TableCell>
              </TableRow>
            ) : (
              depts.map(([dept, stats], idx) => (
                <TableRow key={dept} data-ocid={`reports.dept.item.${idx + 1}`}>
                  <TableCell className="font-medium">{dept}</TableCell>
                  <TableCell className="text-right">{stats.count}</TableCell>
                  <TableCell className="text-right">
                    {formatINR(stats.gross)}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {formatINR(stats.deductions)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-success">
                    {formatINR(stats.net)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function EmployeeHistory() {
  const { data: employees } = useListEmployees();
  const [empId, setEmpId] = useState("");
  const { data: history, isLoading } = useEmployeeSalaryHistory(empId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-foreground">
          Employee Salary History
        </h3>
        <Select value={empId} onValueChange={setEmpId}>
          <SelectTrigger
            className="w-56 h-9"
            data-ocid="reports.employee_history.select"
          >
            <SelectValue placeholder="Select employee…" />
          </SelectTrigger>
          <SelectContent>
            {(employees ?? []).map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="text-xs font-semibold">Period</TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Gross Salary
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Deductions
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Net Salary
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!empId ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState msg="Select an employee to view history" />
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <SkeletonRows cols={4} />
            ) : (history ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState msg="No salary history found" />
                </TableCell>
              </TableRow>
            ) : (
              [...(history ?? [])]
                .sort(
                  (a, b) =>
                    Number(b.year) - Number(a.year) ||
                    Number(b.month) - Number(a.month),
                )
                .map((rec, idx) => (
                  <TableRow
                    key={rec.id}
                    data-ocid={`reports.history.item.${idx + 1}`}
                  >
                    <TableCell className="font-medium">
                      {formatMonthYear(rec.month, rec.year)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatINR(rec.grossSalary)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {formatINR(rec.totalDeductions)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-success">
                      {formatINR(rec.netSalary)}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DeductionSummaryReport() {
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(currentYear());
  const { data: summary, isLoading } = useDeductionSummary(month, year);

  const items = summary
    ? [
        {
          label: "Provident Fund (PF)",
          value: summary.totalPF,
          color: "text-blue-600",
        },
        { label: "ESI", value: summary.totalESI, color: "text-purple-600" },
        { label: "TDS", value: summary.totalTDS, color: "text-amber-600" },
        {
          label: "Other Deductions",
          value: summary.totalOtherDeductions,
          color: "text-gray-600",
        },
      ]
    : [];
  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-foreground">Deduction Summary</h3>
        <MonthYearPicker
          month={month}
          year={year}
          onMonth={setMonth}
          onYear={setYear}
        />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !summary ? (
        <EmptyState
          msg={`No deduction data for ${MONTHS[month - 1]} ${year}`}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item, idx) => (
              <Card
                key={item.label}
                className="shadow-card border border-border"
                data-ocid={`reports.deduction.item.${idx + 1}`}
              >
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color} mt-1`}>
                    {formatINR(item.value)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="shadow-card border border-border">
            <CardContent className="p-5 flex items-center justify-between">
              <span className="font-semibold text-foreground">
                Total Deductions ({MONTHS[month - 1]} {year})
              </span>
              <span className="text-2xl font-bold text-destructive">
                {formatINR(total)}
              </span>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function YTDReport() {
  const [year, setYear] = useState(currentYear());
  const { data: ytd, isLoading } = useAllYTDTotals(year);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-foreground">Year-to-Date Summary</h3>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger
            className="w-24 h-9"
            data-ocid="reports.ytd.year.select"
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
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="text-xs font-semibold">Employee</TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Total Gross
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Total Deductions
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Total Net
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows cols={4} />
            ) : (ytd ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState msg={`No YTD data for ${year}`} />
                </TableCell>
              </TableRow>
            ) : (
              (ytd ?? []).map((row, idx) => (
                <TableRow
                  key={row.employeeId}
                  data-ocid={`reports.ytd.item.${idx + 1}`}
                >
                  <TableCell>
                    <p className="text-sm font-medium">{row.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.employeeId}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatINR(row.totalGrossSalary)}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {formatINR(row.totalDeductions)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-success">
                    {formatINR(row.totalNetSalary)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <div data-ocid="reports.page">
      <Tabs defaultValue="register">
        <TabsList
          className="mb-6 flex-wrap h-auto gap-1"
          data-ocid="reports.tab"
        >
          <TabsTrigger value="register" className="text-xs">
            Monthly Register
          </TabsTrigger>
          <TabsTrigger value="dept" className="text-xs">
            Department-wise
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            Employee History
          </TabsTrigger>
          <TabsTrigger value="deduction" className="text-xs">
            Deduction Summary
          </TabsTrigger>
          <TabsTrigger value="ytd" className="text-xs">
            Year-to-Date
          </TabsTrigger>
        </TabsList>
        <TabsContent value="register">
          <MonthlyRegister />
        </TabsContent>
        <TabsContent value="dept">
          <DeptReport />
        </TabsContent>
        <TabsContent value="history">
          <EmployeeHistory />
        </TabsContent>
        <TabsContent value="deduction">
          <DeductionSummaryReport />
        </TabsContent>
        <TabsContent value="ytd">
          <YTDReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
