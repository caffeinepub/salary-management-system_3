# Salary Management System

## Current State
New project with empty backend and no frontend.

## Requested Changes (Diff)

### Add
- Employee management CRUD (ID, name, designation, department, joining date, basic salary, allowances, deductions)
- Monthly salary processing with HRA, DA, TA, and other allowances; PF, ESI, TDS deductions; net salary calculation
- Payslip generation per employee per month/year
- Reports: monthly salary register, department-wise, individual history, deduction summary (PF/ESI/TDS), year-to-date summary
- Dashboard: total employees, monthly disbursement, dept breakdown, recent processing history
- Authorization (admin access for all data management)

### Modify
- None

### Remove
- None

## Implementation Plan
1. Backend (Motoko):
   - Employee record type: id, name, designation, department, dateOfJoining, basicSalary, defaultAllowances (HRA, DA, TA, other), defaultDeductions (PF, ESI, TDS, other)
   - SalaryRecord type: employeeId, month, year, earnings (basic, HRA, DA, TA, otherAllowances), deductions (PF, ESI, TDS, otherDeductions), grossSalary, totalDeductions, netSalary, processedAt
   - CRUD for employees
   - Process/save salary for a given employee+month+year
   - Bulk process all employees for a month
   - Query salary records by month/year (salary register)
   - Query salary records by department
   - Query salary history by employee
   - Aggregate deduction totals
   - Year-to-date aggregates per employee
   - Dashboard stats: employee count, total net salary this month, dept breakdown

2. Frontend:
   - Sidebar navigation: Dashboard, Employees, Salary Processing, Payslips, Reports
   - Dashboard page with stat cards and recent activity
   - Employee list with add/edit/delete modal forms
   - Salary processing page: select month/year, process all or individual
   - Payslip viewer with print-friendly layout
   - Reports page with tabs for each report type
