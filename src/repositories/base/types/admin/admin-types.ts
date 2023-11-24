export interface IMonthlyEarnings {
  _id: {
    year: number;
    month: number;
  };
  totalEarnings: number;
}

export interface IEarningsWithProfit {
  year: number;
  month: number;
  totalEarnings: number;
  profitValue: number;
}

export interface IBanner {
  _id: string;
  bannerName: string;
  description: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
