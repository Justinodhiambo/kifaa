
export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
  kifaa_score?: number;
  tier?: 'basic' | 'silver' | 'gold' | 'platinum';
}

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'repayment' | 'loan_disbursement' | 'fee';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  created_at: string;
  reference_id?: string;
}

export type Loan = {
  id: string;
  user_id: string;
  amount: number;
  interest_rate: number;
  term_days: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
  purpose: string;
  product_id?: string;
  created_at: string;
  approved_at?: string;
  due_date?: string;
  remaining_amount?: number;
}

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: 'smartphone' | 'electronics' | 'appliance' | 'motorbike' | 'other';
  image_url?: string;
  is_available: boolean;
  created_at: string;
}

export type UserProduct = {
  id: string;
  user_id: string;
  product_id: string;
  loan_id: string;
  status: 'financing' | 'paid' | 'repossessed';
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at'>>;
      };
      loans: {
        Row: Loan;
        Insert: Omit<Loan, 'id' | 'created_at'>;
        Update: Partial<Omit<Loan, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      user_products: {
        Row: UserProduct;
        Insert: Omit<UserProduct, 'id' | 'created_at'>;
        Update: Partial<Omit<UserProduct, 'id' | 'created_at'>>;
      };
    };
  };
};
