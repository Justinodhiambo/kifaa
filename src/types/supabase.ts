
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
  role?: 'customer' | 'agent' | 'administrator';
  kyc_status?: 'pending' | 'approved' | 'rejected';
  kyc_documents?: {
    id_document?: {
      url: string;
      verified: boolean;
      verification_date?: string;
    };
    proof_of_address?: {
      url: string;
      verified: boolean;
      verification_date?: string;
    };
  };
  banking_details?: {
    bank_name?: string;
    account_number?: string;
    branch_code?: string;
  };
  mpesa_phone?: string;
}

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  currency: 'KES' | 'USD' | 'EUR' | 'GBP';
  type: 'deposit' | 'withdrawal' | 'transfer' | 'repayment' | 'loan_disbursement' | 'fee';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  created_at: string;
  reference_id?: string;
  payment_method?: 'mpesa' | 'bank_transfer' | 'card' | 'agent' | 'wallet';
  recipient_id?: string;
}

export type Loan = {
  id: string;
  user_id: string;
  amount: number;
  currency: 'KES' | 'USD' | 'EUR' | 'GBP';
  interest_rate: number;
  term_days: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
  purpose: string;
  product_id?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  due_date?: string;
  remaining_amount?: number;
  payment_schedule?: LoanPayment[];
  collateral?: {
    type: string;
    value: number;
    description: string;
  };
}

export type LoanPayment = {
  id: string;
  loan_id: string;
  amount: number;
  currency: 'KES' | 'USD' | 'EUR' | 'GBP';
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_amount?: number;
  paid_date?: string;
}

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: 'KES' | 'USD' | 'EUR' | 'GBP';
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

export type Wallet = {
  id: string;
  user_id: string;
  currency: 'KES' | 'USD' | 'EUR' | 'GBP';
  balance: number;
  created_at: string;
  updated_at: string;
}

export type KYCDocument = {
  id: string;
  user_id: string;
  document_type: 'id' | 'passport' | 'driving_license' | 'utility_bill' | 'bank_statement';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
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
      loan_payments: {
        Row: LoanPayment;
        Insert: Omit<LoanPayment, 'id'>;
        Update: Partial<Omit<LoanPayment, 'id'>>;
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
      wallets: {
        Row: Wallet;
        Insert: Omit<Wallet, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Wallet, 'id' | 'created_at' | 'updated_at'>>;
      };
      kyc_documents: {
        Row: KYCDocument;
        Insert: Omit<KYCDocument, 'id' | 'uploaded_at'>;
        Update: Partial<Omit<KYCDocument, 'id' | 'uploaded_at'>>;
      };
    };
  };
};
