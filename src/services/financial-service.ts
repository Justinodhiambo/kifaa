
import { supabase } from '@/lib/supabase';
import type { Currency, Wallet, Transaction, Product, Loan } from '@/hooks/use-financial';

export async function getWallets(userId: string): Promise<Wallet[]> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching wallets:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getLoans(userId: string): Promise<Loan[]> {
  const { data, error } = await supabase
    .from('loans')
    .select('*, products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching loans:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getCreditScore(userId: string): Promise<number> {
  try {
    // In a real application, this would likely be a more complex calculation
    // based on transaction history, loan repayment behavior, etc.
    
    // For demonstration purposes, we'll return a random score between 300 and 850
    return Math.floor(Math.random() * (850 - 300 + 1)) + 300;
  } catch (error) {
    console.error('Error calculating credit score:', error);
    throw error;
  }
}

// Type for deposit payload
type DepositPayload = {
  user_id: string;
  amount: number;
  currency: Currency;
};

export async function deposit(payload: DepositPayload): Promise<void> {
  const { user_id, amount, currency } = payload;
  
  // Start a transaction
  const { error: walletError } = await supabase.rpc('deposit_funds', {
    p_user_id: user_id,
    p_amount: amount,
    p_currency: currency as string, // Casting to string to fix type issue
  });

  if (walletError) {
    console.error('Error processing deposit:', walletError);
    throw new Error(walletError.message);
  }
}

// Type for withdrawal payload
type WithdrawPayload = {
  user_id: string;
  amount: number;
  currency: Currency;
};

export async function withdraw(payload: WithdrawPayload): Promise<void> {
  const { user_id, amount, currency } = payload;
  
  // Start a transaction
  const { error: walletError } = await supabase.rpc('withdraw_funds', {
    p_user_id: user_id,
    p_amount: amount,
    p_currency: currency as string, // Casting to string to fix type issue
  });

  if (walletError) {
    console.error('Error processing withdrawal:', walletError);
    throw new Error(walletError.message);
  }
}

// Type for transfer payload
type TransferPayload = Omit<Transaction, 'id' | 'created_at'>;

export async function transfer(payload: TransferPayload): Promise<void> {
  const { user_id, amount, currency, recipient_id } = payload;
  
  if (!recipient_id) {
    throw new Error('Recipient ID is required');
  }
  
  // Start a transaction
  const { error: transferError } = await supabase.rpc('transfer_funds', {
    p_sender_id: user_id,
    p_recipient_id: recipient_id,
    p_amount: amount,
    p_currency: currency as string, // Casting to string to fix type issue
    p_description: payload.description || 'Transfer',
  });

  if (transferError) {
    console.error('Error processing transfer:', transferError);
    throw new Error(transferError.message);
  }
}

// Type for loan application payload
type LoanApplicationPayload = {
  user_id: string;
  product_id: string;
  amount: number;
  interest_rate: number;
  term_months: number;
  monthly_payment: number;
  total_payment: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaying' | 'paid' | 'defaulted';
  purpose: string;
  remaining_amount: number;
};

export async function applyLoan(payload: LoanApplicationPayload): Promise<void> {
  const { error } = await supabase
    .from('loans')
    .insert([payload]);

  if (error) {
    console.error('Error applying for loan:', error);
    throw new Error(error.message);
  }
}
