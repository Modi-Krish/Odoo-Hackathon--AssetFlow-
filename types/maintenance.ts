export interface Maintenance {
  id: string;
  assetId: string;
  issue: string;
  priority: string; // 'Low' | 'Medium' | 'High'
  status: string; // 'Pending' | 'Approved' | 'In Progress' | 'Resolved' | 'Rejected'
}
