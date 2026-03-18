import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Employee } from "../backend";
import { useActor } from "./useActor";

export function useListEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emp: Employee) => {
      if (!actor) throw new Error("No actor");
      return actor.addEmployee(emp);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emp: Employee) => {
      if (!actor) throw new Error("No actor");
      return actor.updateEmployee(emp);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteEmployee(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useDashboardStats(month: number, year: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats", month, year],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSalaryRegister(month: number, year: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["salaryRegister", month, year],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSalaryRegister(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProcessSalary() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      month,
      year,
    }: { employeeId: string; month: number; year: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.processSalary(employeeId, BigInt(month), BigInt(year));
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["salaryRegister", v.month, v.year] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useBulkProcessSalaries() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.bulkProcessSalaries(BigInt(month), BigInt(year));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["salaryRegister"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useEmployeeSalaryHistory(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["salaryHistory", employeeId],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      return actor.getEmployeeSalaryHistory(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useSalaryRecord(
  employeeId: string,
  month: number,
  year: number,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["salaryRecord", employeeId, month, year],
    queryFn: async () => {
      if (!actor || !employeeId) return null;
      try {
        return await actor.getSalaryRecord(
          employeeId,
          BigInt(month),
          BigInt(year),
        );
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!employeeId && month > 0 && year > 0,
  });
}

export function useDeductionSummary(month: number, year: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["deductionSummary", month, year],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDeductionSummary(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllYTDTotals(year: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["ytdTotals", year],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllYTDTotals(BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
