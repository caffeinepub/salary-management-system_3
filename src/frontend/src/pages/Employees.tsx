import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../backend";
import {
  useAddEmployee,
  useDeleteEmployee,
  useListEmployees,
  useUpdateEmployee,
} from "../hooks/useQueries";
import { formatINR } from "../lib/formatters";

const EMPTY_EMP: Employee = {
  id: "",
  name: "",
  designation: "",
  department: "",
  dateOfJoining: "",
  basicSalary: 0,
  hra: 0,
  da: 0,
  ta: 0,
  otherAllowances: 0,
  pf: 0,
  esi: 0,
  tds: 0,
  otherDeductions: 0,
  isActive: true,
};

function NumField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (n: string, v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(name, Number(e.target.value))}
        className="h-9 text-sm"
      />
    </div>
  );
}

export default function Employees() {
  const { data: employees, isLoading } = useListEmployees();
  const addMutation = useAddEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [form, setForm] = useState<Employee>(EMPTY_EMP);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState("All");

  const filtered = (employees ?? []).filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q);
    const matchDept = deptFilter === "All" || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const departments = [
    "All",
    ...(Array.from(
      new Set((employees ?? []).map((e) => e.department)),
    ) as string[]),
  ];

  const gross =
    form.basicSalary + form.hra + form.da + form.ta + form.otherAllowances;
  const net = gross - form.pf - form.esi - form.tds - form.otherDeductions;

  const openAdd = () => {
    setEditEmp(null);
    setForm(EMPTY_EMP);
    setModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditEmp(emp);
    setForm({ ...emp });
    setModalOpen(true);
  };

  const handleField = (key: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.id || !form.name) {
      toast.error("Employee ID and Name are required");
      return;
    }
    try {
      if (editEmp) {
        await updateMutation.mutateAsync(form);
        toast.success("Employee updated successfully");
      } else {
        await addMutation.mutateAsync(form);
        toast.success("Employee added successfully");
      }
      setModalOpen(false);
    } catch {
      toast.error("Failed to save employee");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Employee deleted");
    } catch {
      toast.error("Failed to delete employee");
    } finally {
      setDeleteId(null);
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5" data-ocid="employees.page">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
            data-ocid="employees.search_input"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {departments.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDeptFilter(d)}
              data-ocid="employees.dept.tab"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                deptFilter === d
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <Button
          onClick={openAdd}
          className="ml-auto"
          data-ocid="employees.add_button"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="text-xs font-semibold">Employee</TableHead>
              <TableHead className="text-xs font-semibold">
                Department
              </TableHead>
              <TableHead className="text-xs font-semibold">
                Designation
              </TableHead>
              <TableHead className="text-xs font-semibold">Join Date</TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Basic Salary
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Net Salary
              </TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="employees.empty_state"
                >
                  {search
                    ? "No employees match your search"
                    : "No employees found. Add your first employee."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((emp, idx) => {
                const empNet =
                  emp.basicSalary +
                  emp.hra +
                  emp.da +
                  emp.ta +
                  emp.otherAllowances -
                  emp.pf -
                  emp.esi -
                  emp.tds -
                  emp.otherDeductions;
                return (
                  <TableRow
                    key={emp.id}
                    className="hover:bg-secondary/30"
                    data-ocid={`employees.item.${idx + 1}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground shrink-0">
                          {emp.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {emp.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {emp.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{emp.department}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {emp.designation}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {emp.dateOfJoining}
                    </TableCell>
                    <TableCell className="text-sm text-right font-medium">
                      {formatINR(emp.basicSalary)}
                    </TableCell>
                    <TableCell className="text-sm text-right font-semibold text-success">
                      {formatINR(empNet)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          emp.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs"
                        }
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(emp)}
                          data-ocid={`employees.edit_button.${idx + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(emp.id)}
                          className="text-destructive hover:text-destructive"
                          data-ocid={`employees.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="employees.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editEmp ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Employee ID *</Label>
                <Input
                  value={form.id}
                  onChange={(e) => handleField("id", e.target.value)}
                  placeholder="EMP001"
                  className="h-9 text-sm"
                  disabled={!!editEmp}
                  data-ocid="employees.id.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleField("name", e.target.value)}
                  placeholder="John Doe"
                  className="h-9 text-sm"
                  data-ocid="employees.name.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Designation</Label>
                <Input
                  value={form.designation}
                  onChange={(e) => handleField("designation", e.target.value)}
                  className="h-9 text-sm"
                  data-ocid="employees.designation.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <Input
                  value={form.department}
                  onChange={(e) => handleField("department", e.target.value)}
                  className="h-9 text-sm"
                  data-ocid="employees.department.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date of Joining</Label>
                <Input
                  type="date"
                  value={form.dateOfJoining}
                  onChange={(e) => handleField("dateOfJoining", e.target.value)}
                  className="h-9 text-sm"
                  data-ocid="employees.doj.input"
                />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => handleField("isActive", v)}
                  data-ocid="employees.active.switch"
                />
                <Label className="text-sm">Active Employee</Label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">
                Earnings (₹/month)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <NumField
                  label="Basic Salary"
                  name="basicSalary"
                  value={form.basicSalary}
                  onChange={handleField}
                />
                <NumField
                  label="HRA"
                  name="hra"
                  value={form.hra}
                  onChange={handleField}
                />
                <NumField
                  label="DA"
                  name="da"
                  value={form.da}
                  onChange={handleField}
                />
                <NumField
                  label="TA"
                  name="ta"
                  value={form.ta}
                  onChange={handleField}
                />
                <NumField
                  label="Other Allowances"
                  name="otherAllowances"
                  value={form.otherAllowances}
                  onChange={handleField}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border">
                Deductions (₹/month)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <NumField
                  label="PF"
                  name="pf"
                  value={form.pf}
                  onChange={handleField}
                />
                <NumField
                  label="ESI"
                  name="esi"
                  value={form.esi}
                  onChange={handleField}
                />
                <NumField
                  label="TDS"
                  name="tds"
                  value={form.tds}
                  onChange={handleField}
                />
                <NumField
                  label="Other Deductions"
                  name="otherDeductions"
                  value={form.otherDeductions}
                  onChange={handleField}
                />
              </div>
            </div>

            <div className="bg-secondary/60 rounded-xl p-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Gross Salary</p>
                <p className="font-bold text-foreground text-base">
                  {formatINR(gross)}
                </p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-xs text-muted-foreground">
                  Total Deductions
                </p>
                <p className="font-bold text-destructive text-base">
                  {formatINR(
                    form.pf + form.esi + form.tds + form.otherDeductions,
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Net Salary</p>
                <p className="font-bold text-success text-base">
                  {formatINR(net)}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              data-ocid="employees.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              data-ocid="employees.save_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editEmp ? (
                "Update Employee"
              ) : (
                "Add Employee"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="employees.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this employee? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="employees.delete_cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-ocid="employees.delete_confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
