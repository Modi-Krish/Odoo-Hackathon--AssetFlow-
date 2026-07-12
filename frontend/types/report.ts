export interface Report {
  id: string;
  title: string;
  type: 'asset' | 'department' | 'maintenance' | 'allocation';
  description: string;
  generatedAt: string;
  csvUrl?: string;
  data: Array<Record<string, unknown>>;
}
