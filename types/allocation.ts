export interface Allocation {
  id: string;
  assetId: string;
  employeeId: string;
  allocationDate: string;
  expectedReturn: string;
  status: string;
}

export interface Asset {
  id: string;
  name: string;
  status: 'Available' | 'Allocated' | 'Maintenance';
}

export interface Employee {
  id: string;
  name: string;
  email: string;
}
