export type DateRange = {
  /** Inclusive start, YYYY-MM-DD */
  from: string;
  /** Inclusive end, YYYY-MM-DD */
  to: string;
};

export type Summary = {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  customers: number;
  unitsSold: number;
};

/** Percentage change per metric versus the previous period; null when there is nothing to compare. */
export type Change = { [K in keyof Summary]: number | null };

export type MonthlySales = { month: string; revenue: number; orders: number };

export type ProductSales = { id: number; name: string; category: string; units: number; revenue: number };

export type CategorySales = { category: string; revenue: number; units: number; orders: number; share: number };

export type TopCustomer = { id: number; name: string; country: string; orders: number; revenue: number };

export type CustomerStats = {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
  revenuePerCustomer: number;
  topCustomers: TopCustomer[];
  byCountry: { country: string; customers: number; revenue: number }[];
};

export type AnalyticsResponse = {
  range: DateRange;
  /** Earliest and latest order dates in the database, used by the "All time" preset. */
  dataBounds: DateRange | null;
  summary: Summary;
  change: Change;
  salesByMonth: MonthlySales[];
  topProducts: ProductSales[];
  salesByCategory: CategorySales[];
  customers: CustomerStats;
};
