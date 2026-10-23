export interface DashboardMetrics {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  activeLeases: number;
  pendingApplications: number;
  openMaintenance: number;
  urgentMaintenance: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  monthlyRevenue: number;
  outstandingBalance: number;
  recentActivity?: Array<{
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    user?: {
      fullName: string;
      role: string;
    };
  }>;
}
