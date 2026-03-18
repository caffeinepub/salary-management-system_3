import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, FileText, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useListEmployees, useSalaryRecord } from "../hooks/useQueries";
import {
  MONTHS,
  currentMonth,
  currentYear,
  formatINR,
} from "../lib/formatters";

const YEARS = Array.from({ length: 5 }, (_, i) => currentYear() - 2 + i);

export default function Payslip() {
  const [selectedEmp, setSelectedEmp] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(currentYear());
  const printRef = useRef<HTMLDivElement>(null);

  const { data: employees, isLoading: empLoading } = useListEmployees();
  const { data: record, isLoading: recLoading } = useSalaryRecord(
    selectedEmp,
    month,
    year,
  );
  const emp = (employees ?? []).find((e) => e.id === selectedEmp);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Payslip - ${emp?.name ?? ""} - ${MONTHS[month - 1]} ${year}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        td, th { padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 13px; }
        th { background: #f3f4f6; font-weight: 600; text-align: left; }
        h1 { font-size: 22px; margin: 0; }
      </style></head><body>${printContent}</body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6" data-ocid="payslip.page">
      <div className="bg-card border border-border rounded-xl shadow-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Select Employee & Period
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Employee</Label>
            <Select value={selectedEmp} onValueChange={setSelectedEmp}>
              <SelectTrigger data-ocid="payslip.employee.select">
                <SelectValue placeholder="Select employee…" />
              </SelectTrigger>
              <SelectContent>
                {empLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  (employees ?? []).map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} ({e.id})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Month</Label>
            <Select
              value={String(month)}
              onValueChange={(v) => setMonth(Number(v))}
            >
              <SelectTrigger data-ocid="payslip.month.select">
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
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Year</Label>
            <Select
              value={String(year)}
              onValueChange={(v) => setYear(Number(v))}
            >
              <SelectTrigger data-ocid="payslip.year.select">
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
      </div>

      {!selectedEmp ? (
        <div
          className="bg-card border border-border rounded-xl shadow-card p-16 text-center"
          data-ocid="payslip.empty_state"
        >
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Select an employee and period to generate payslip
          </p>
        </div>
      ) : recLoading ? (
        <div className="bg-card border border-border rounded-xl shadow-card p-8 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : !record ? (
        <div
          className="bg-card border border-border rounded-xl shadow-card p-16 text-center"
          data-ocid="payslip.not_processed.error_state"
        >
          <p className="text-muted-foreground">
            No salary record found. Process salary first for {emp?.name} for{" "}
            {MONTHS[month - 1]} {year}.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Payslip Preview</h2>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              data-ocid="payslip.print.button"
            >
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
          </div>

          <div ref={printRef} className="p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-7 h-7 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">
                  SalaryFlow Inc.
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                123 Business Park, Bangalore, Karnataka 560001
              </p>
              <div className="mt-3 inline-block bg-accent text-accent-foreground font-semibold text-sm px-5 py-1.5 rounded-full">
                PAYSLIP — {MONTHS[month - 1].toUpperCase()} {year}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8 p-4 bg-secondary/50 rounded-xl text-sm">
              {[
                ["Employee Name", emp?.name ?? ""],
                ["Employee ID", emp?.id ?? ""],
                ["Designation", emp?.designation ?? ""],
                ["Department", emp?.department ?? ""],
                ["Date of Joining", emp?.dateOfJoining ?? ""],
                ["Pay Period", `${MONTHS[month - 1]} ${year}`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between py-1.5 border-b border-border/50"
                >
                  <span className="text-muted-foreground font-medium">
                    {label}
                  </span>
                  <span className="text-foreground font-semibold">{value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-3 text-center bg-green-50 py-2 rounded-lg text-green-700">
                  EARNINGS
                </h3>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {[
                      ["Basic Pay", record.basicPay],
                      ["HRA", record.hra],
                      ["DA", record.da],
                      ["TA", record.ta],
                      ["Other Allowances", record.otherAllowances],
                    ].map(([label, value]) => (
                      <tr key={label as string}>
                        <td className="py-2 text-muted-foreground">{label}</td>
                        <td className="py-2 text-right font-medium text-foreground">
                          {formatINR(value as number)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border">
                      <td className="py-2.5 font-bold text-foreground">
                        Gross Salary
                      </td>
                      <td className="py-2.5 text-right font-bold text-success">
                        {formatINR(record.grossSalary)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-3 text-center bg-red-50 py-2 rounded-lg text-red-600">
                  DEDUCTIONS
                </h3>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {[
                      ["Provident Fund (PF)", record.pf],
                      ["ESI", record.esi],
                      ["TDS", record.tds],
                      ["Other Deductions", record.otherDeductions],
                    ].map(([label, value]) => (
                      <tr key={label as string}>
                        <td className="py-2 text-muted-foreground">{label}</td>
                        <td className="py-2 text-right font-medium text-foreground">
                          {formatINR(value as number)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border">
                      <td className="py-2.5 font-bold text-foreground">
                        Total Deductions
                      </td>
                      <td className="py-2.5 text-right font-bold text-destructive">
                        {formatINR(record.totalDeductions)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-accent rounded-xl p-5 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                NET SALARY PAYABLE
              </p>
              <p className="text-4xl font-bold text-primary mt-1">
                {formatINR(record.netSalary)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {MONTHS[month - 1]} {year}
              </p>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              This is a computer-generated payslip and does not require a
              signature.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
