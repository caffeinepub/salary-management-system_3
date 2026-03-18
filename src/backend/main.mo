import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Role-based access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    department : Text;
  };

  public type Employee = {
    id : Text;
    name : Text;
    designation : Text;
    department : Text;
    dateOfJoining : Text;
    basicSalary : Float;
    hra : Float;
    da : Float;
    ta : Float;
    otherAllowances : Float;
    pf : Float;
    esi : Float;
    tds : Float;
    otherDeductions : Float;
    isActive : Bool;
  };

  public type SalaryRecord = {
    id : Text;
    employeeId : Text;
    month : Nat;
    year : Nat;
    basicPay : Float;
    hra : Float;
    da : Float;
    ta : Float;
    otherAllowances : Float;
    grossSalary : Float;
    pf : Float;
    esi : Float;
    tds : Float;
    otherDeductions : Float;
    totalDeductions : Float;
    netSalary : Float;
    processedAt : Int;
  };

  public type DashboardStats = {
    totalEmployees : Nat;
    totalNetSalary : Float;
    departmentBreakdown : [(Text, Float)];
  };

  public type DeductionSummary = {
    totalPF : Float;
    totalESI : Float;
    totalTDS : Float;
    totalOtherDeductions : Float;
  };

  public type YTDTotals = {
    employeeId : Text;
    employeeName : Text;
    totalGrossSalary : Float;
    totalDeductions : Float;
    totalNetSalary : Float;
  };

  // Persistent storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let employees = Map.empty<Text, Employee>();
  let salaryRecords = Map.empty<Text, SalaryRecord>();

  module Employee {
    public func compare(a : Employee, b : Employee) : Order.Order {
      Text.compare(a.id, b.id);
    };
    public func toText(emp : Employee) : Text {
      emp.id;
    };
  };

  module SalaryRecord {
    public func compareByEmployeeId(a : SalaryRecord, b : SalaryRecord) : Order.Order {
      Text.compare(a.employeeId, b.employeeId);
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Employee management
  public shared ({ caller }) func addEmployee(employee : Employee) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add employees");
    };
    employees.add(employee.id, employee);
  };

  public shared ({ caller }) func updateEmployee(employee : Employee) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update employees");
    };
    employees.add(employee.id, employee);
  };

  public shared ({ caller }) func deleteEmployee(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete employees");
    };
    employees.remove(id);
  };

  public query ({ caller }) func getEmployee(id : Text) : async Employee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view employee data");
    };
    switch (employees.get(id)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?employee) { employee };
    };
  };

  public query ({ caller }) func listAllEmployees() : async [Employee] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view employee data");
    };
    employees.values().toArray().sort();
  };

  // Salary Processing
  public shared ({ caller }) func processSalary(employeeId : Text, month : Nat, year : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can process salaries");
    };

    let employee = switch (employees.get(employeeId)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?emp) { emp };
    };

    if (not employee.isActive) { Runtime.trap("Employee is not active") };

    let grossSalary = employee.basicSalary + employee.hra + employee.da + employee.ta + employee.otherAllowances;
    let totalDeductions = employee.pf + employee.esi + employee.tds + employee.otherDeductions;
    let netSalary = grossSalary - totalDeductions;

    let salaryRecord : SalaryRecord = {
      id = employeeId # "-" # Nat.toText(month) # "-" # Nat.toText(year);
      employeeId;
      month;
      year;
      basicPay = employee.basicSalary;
      hra = employee.hra;
      da = employee.da;
      ta = employee.ta;
      otherAllowances = employee.otherAllowances;
      grossSalary;
      pf = employee.pf;
      esi = employee.esi;
      tds = employee.tds;
      otherDeductions = employee.otherDeductions;
      totalDeductions;
      netSalary;
      processedAt = Time.now();
    };

    salaryRecords.add(salaryRecord.id, salaryRecord);
  };

  // Bulk Process - All active employees
  public shared ({ caller }) func bulkProcessSalaries(month : Nat, year : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can process salaries");
    };

    for (employee in employees.values()) {
      if (employee.isActive) {
        await processSalary(employee.id, month, year);
      };
    };
  };

  // Get salary record by employeeId + month + year
  public query ({ caller }) func getSalaryRecord(employeeId : Text, month : Nat, year : Nat) : async SalaryRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view salary records");
    };
    let recordId = employeeId # "-" # Nat.toText(month) # "-" # Nat.toText(year);
    switch (salaryRecords.get(recordId)) {
      case (null) { Runtime.trap("Salary record not found") };
      case (?record) { record };
    };
  };

  // Get all salary records for a month/year (salary register)
  public query ({ caller }) func getSalaryRegister(month : Nat, year : Nat) : async [SalaryRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view salary register");
    };
    salaryRecords.values().toArray().filter(
      func(record : SalaryRecord) : Bool {
        record.month == month and record.year == year
      }
    );
  };

  // Get salary history for an employee
  public query ({ caller }) func getEmployeeSalaryHistory(employeeId : Text) : async [SalaryRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view salary history");
    };
    salaryRecords.values().toArray().sort(SalaryRecord.compareByEmployeeId).filter(
      func(record : SalaryRecord) : Bool {
        record.employeeId == employeeId;
      }
    );
  };

  // Dashboard stats
  public query ({ caller }) func getDashboardStats(month : Nat, year : Nat) : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };

    let monthRecords = salaryRecords.values().toArray().filter(
      func(record : SalaryRecord) : Bool {
        record.month == month and record.year == year
      }
    );

    var totalNetSalary : Float = 0.0;
    let deptMap = Map.empty<Text, Float>();

    for (record in monthRecords.vals()) {
      totalNetSalary += record.netSalary;

      switch (employees.get(record.employeeId)) {
        case (?emp) {
          let currentDeptTotal = switch (deptMap.get(emp.department)) {
            case (?total) { total };
            case (null) { 0.0 };
          };
          deptMap.add(emp.department, currentDeptTotal + record.netSalary);
        };
        case (null) {};
      };
    };

    {
      totalEmployees = employees.values().toArray().filter(func(e : Employee) : Bool { e.isActive }).size();
      totalNetSalary;
      departmentBreakdown = deptMap.entries().toArray();
    };
  };

  // Deduction summary for a month/year
  public query ({ caller }) func getDeductionSummary(month : Nat, year : Nat) : async DeductionSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view deduction summary");
    };

    let monthRecords = salaryRecords.values().toArray().filter(
      func(record : SalaryRecord) : Bool {
        record.month == month and record.year == year
      }
    );

    var totalPF : Float = 0.0;
    var totalESI : Float = 0.0;
    var totalTDS : Float = 0.0;
    var totalOtherDeductions : Float = 0.0;

    for (record in monthRecords.vals()) {
      totalPF += record.pf;
      totalESI += record.esi;
      totalTDS += record.tds;
      totalOtherDeductions += record.otherDeductions;
    };

    {
      totalPF;
      totalESI;
      totalTDS;
      totalOtherDeductions;
    };
  };

  // Year-to-date totals per employee
  public query ({ caller }) func getYTDTotals(employeeId : Text, year : Nat) : async YTDTotals {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view YTD totals");
    };

    let employee = switch (employees.get(employeeId)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?emp) { emp };
    };

    let yearRecords = salaryRecords.values().toArray().filter(
      func(record : SalaryRecord) : Bool {
        record.employeeId == employeeId and record.year == year
      }
    );

    var totalGrossSalary : Float = 0.0;
    var totalDeductions : Float = 0.0;
    var totalNetSalary : Float = 0.0;

    for (record in yearRecords.vals()) {
      totalGrossSalary += record.grossSalary;
      totalDeductions += record.totalDeductions;
      totalNetSalary += record.netSalary;
    };

    {
      employeeId;
      employeeName = employee.name;
      totalGrossSalary;
      totalDeductions;
      totalNetSalary;
    };
  };

  // Get all YTD totals for all employees for a year
  public query ({ caller }) func getAllYTDTotals(year : Nat) : async [YTDTotals] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view YTD totals");
    };

    let employeeIds = employees.keys().toArray();
    employeeIds.map(
      func(empId) {
        switch (employees.get(empId)) {
          case (?employee) {
            let yearRecords = salaryRecords.values().toArray().filter(
              func(record : SalaryRecord) : Bool {
                record.employeeId == empId and record.year == year
              }
            );

            if (yearRecords.size() == 0) {
              return null;
            };

            var totalGrossSalary : Float = 0.0;
            var totalDeductions : Float = 0.0;
            var totalNetSalary : Float = 0.0;

            for (record in yearRecords.vals()) {
              totalGrossSalary += record.grossSalary;
              totalDeductions += record.totalDeductions;
              totalNetSalary += record.netSalary;
            };

            ?{
              employeeId = empId;
              employeeName = employee.name;
              totalGrossSalary;
              totalDeductions;
              totalNetSalary;
            };
          };
          case (null) { null };
        };
      }
    ).filterMap(func(x) { x });
  };
};
