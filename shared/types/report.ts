export interface PropertyBreakdownItem {
  id: string;
  title: string;
  address: string;
  city: string;
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  maintenanceUnits: number;
  occupancyRate: number;
}

export interface OccupancyReportData {
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  maintenanceUnits: number;
  occupancyRate: number;
  propertyBreakdown?: PropertyBreakdownItem[];
}

export interface FinancialReportData {
  totalInvoiced: number;
  totalCollected: number;
  outstandingBalance: number;
  overdueTotal: number;
  collectionRate: number;
  invoiceCount: number;
}
