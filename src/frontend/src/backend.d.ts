import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DeductionSummary {
    totalPF: number;
    totalESI: number;
    totalTDS: number;
    totalOtherDeductions: number;
}
export interface SalaryRecord {
    da: number;
    id: string;
    pf: number;
    ta: number;
    esi: number;
    hra: number;
    tds: number;
    month: bigint;
    totalDeductions: number;
    otherAllowances: number;
    year: bigint;
    basicPay: number;
    netSalary: number;
    processedAt: bigint;
    employeeId: string;
    grossSalary: number;
    otherDeductions: number;
}
export interface YTDTotals {
    totalDeductions: number;
    employeeName: string;
    totalNetSalary: number;
    employeeId: string;
    totalGrossSalary: number;
}
export interface Employee {
    da: number;
    id: string;
    pf: number;
    ta: number;
    esi: number;
    hra: number;
    tds: number;
    otherAllowances: number;
    name: string;
    designation: string;
    isActive: boolean;
    dateOfJoining: string;
    otherDeductions: number;
    department: string;
    basicSalary: number;
}
export interface DashboardStats {
    totalEmployees: bigint;
    totalNetSalary: number;
    departmentBreakdown: Array<[string, number]>;
}
export interface UserProfile {
    name: string;
    email: string;
    department: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEmployee(employee: Employee): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkProcessSalaries(month: bigint, year: bigint): Promise<void>;
    deleteEmployee(id: string): Promise<void>;
    getAllYTDTotals(year: bigint): Promise<Array<YTDTotals>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(month: bigint, year: bigint): Promise<DashboardStats>;
    getDeductionSummary(month: bigint, year: bigint): Promise<DeductionSummary>;
    getEmployee(id: string): Promise<Employee>;
    getEmployeeSalaryHistory(employeeId: string): Promise<Array<SalaryRecord>>;
    getSalaryRecord(employeeId: string, month: bigint, year: bigint): Promise<SalaryRecord>;
    getSalaryRegister(month: bigint, year: bigint): Promise<Array<SalaryRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getYTDTotals(employeeId: string, year: bigint): Promise<YTDTotals>;
    isCallerAdmin(): Promise<boolean>;
    listAllEmployees(): Promise<Array<Employee>>;
    processSalary(employeeId: string, month: bigint, year: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEmployee(employee: Employee): Promise<void>;
}
