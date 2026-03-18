import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useBulkProcessSalaries,
  useListEmployees,
  useProcessSalary,
  useSalaryRegister,
} from "../hooks/useQueries";
import {
  MONTHS,
  currentMonth,
  currentYear,
  formatINR,
} from "../lib/formatters";

const YEARS = Array.from({ length: 5 }, (_, i) => currentYear() - 2 + i);

export default function SalaryProcessing() {
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(currentYear());

  const { data: employees, isLoading: empLoading } = useListEmployees();
  const { data: register, isLoading: regLoading } = useSalaryRegister(
    month,
    year,
  );
  const processMutation = useProcessSalary();
  const bulkMutation = useBulkProcessSalaries();

  const processedIds = new Set((register ?? []).map((r) => r.employeeId));
  const activeEmployees = (employees ?? []).filter((e) => e.isActive);
  const processedCount = activeEmployees.filter((e) =>
    processedIds.has(e.id),
  ).length;
  const pendingCount = activeEmployees.length - processedCount;

  const handleProcess = async (empId: string) => {
    try {
      await processMutation.mutateAsync({ employeeId: empId, month, year });
      toast.success("Salary processed successfully");
    } catch {
      toast.error("Failed to process salary");
    }
  };

  const handleBulk = async () => {
    try {
      await bulkMutation.mutateAsync({ month, year });
      toast.success(
        `Bulk salary processing complete for ${MONTHS[month - 1]} ${year}`,
      );
    } catch {
      toast.error("Bulk processing failed");
    }
  };

  const isLoading = empLoading || regLoading;

  return (
    <div className="space-y-6" data-ocid="salary_processing.page">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={String(month)}
          onValueChange={(v) => setMonth(Number(v))}
        >
          <SelectTrigger
            className="w-40 h-9"
            data-ocid="salary_processing.month.select"
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
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger
            className="w-24 h-9"
            data-ocid="salary_processing.year.select"
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
        <Button
          onClick={handleBulk}
          disabled={bulkMutation.isPending || pendingCount === 0}
          className="ml-auto"
          data-ocid="salary_processing.bulk_process.button"
        >
          {bulkMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Process All ({pendingCount} pending)
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Active",
            value: activeEmployees.length,
            color: "text-foreground",
          },
          { label: "Processed", value: processedCount, color: "text-success" },
          { label: "Pending", value: pendingCount, color: "text-amber-500" },
        ].map((s) => (
          <Card key={s.label} className="shadow-card border border-border">
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color} mt-1`}>
                {isLoading ? "—" : s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Employee Salary Status — {MONTHS[month - 1]} {year}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : activeEmployees.length === 0 ? (
            <p
              className="text-center py-12 text-muted-foreground"
              data-ocid="salary_processing.empty_state"
            >
              No active employees found
            </p>
          ) : (
            <div className="divide-y divide-border">
              {activeEmployees.map((emp, idx) => {
                const processed = processedIds.has(emp.id);
                const rec = (register ?? []).find(
                  (r) => r.employeeId === emp.id,
                );
                const isProcessing =
                  processMutation.isPending &&
                  processMutation.variables?.employeeId === emp.id;

                return (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between px-6 py-4"
                    data-ocid={`salary_processing.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          processed
                            ? "bg-green-100 text-green-700"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {processed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          emp.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {emp.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp.id} · {emp.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {processed && rec ? (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {formatINR(rec.netSalary)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Net Salary
                          </p>
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {formatINR(
                              emp.basicSalary +
                                emp.hra +
                                emp.da +
                                emp.ta +
                                emp.otherAllowances -
                                emp.pf -
                                emp.esi -
                                emp.tds -
                                emp.otherDeductions,
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Expected
                          </p>
                        </div>
                      )}
                      {processed ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Processed
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleProcess(emp.id)}
                          disabled={isProcessing}
                          data-ocid={`salary_processing.process_button.${idx + 1}`}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              Process
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
