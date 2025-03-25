
import { supabase } from '@/lib/supabase';
import { Transaction, Loan, User } from '@/types/supabase';

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function getUserBalance(userId: string) {
  // Calculate user balance from transactions
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', userId)
    .eq('status', 'completed');
    
  if (error) throw error;
  
  // Sum up the balance
  return data.reduce((balance, transaction) => {
    if (['deposit', 'loan_disbursement'].includes(transaction.type)) {
      return balance + transaction.amount;
    } else {
      return balance - transaction.amount;
    }
  }, 0);
}

export async function getTransactionHistory(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function getActiveLoans(userId: string) {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'approved', 'active'])
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function getLoanHistory(userId: string) {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function applyForLoan(loan: Omit<Loan, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('loans')
    .insert(loan)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function calculateKifaaScore(userId: string): Promise<number> {
  // Get user loan history
  const { data: loans, error: loansError } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', userId);
    
  if (loansError) throw loansError;
  
  // Get user transaction history
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);
    
  if (transactionsError) throw transactionsError;
  
  // Base score
  let score = 500;
  
  // Add points for completed loans
  const completedLoans = loans.filter(loan => loan.status === 'completed');
  score += completedLoans.length * 30;
  
  // Subtract points for defaulted loans
  const defaultedLoans = loans.filter(loan => loan.status === 'defaulted');
  score -= defaultedLoans.length * 50;
  
  // Add points for on-time repayments
  const repayments = transactions.filter(t => t.type === 'repayment' && t.status === 'completed');
  score += repayments.length * 5;
  
  // Ensure score is between 300 and 850
  return Math.max(300, Math.min(850, score));
}

export async function getEligibleProducts(userId: string) {
  // First get user's Kifaa score
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('kifaa_score, tier')
    .eq('id', userId)
    .single();
  
  if (userError) throw userError;
  
  const score = user.kifaa_score || 0;
  
  // Define eligibility based on score
  let eligibleCategories = ['other'];
  if (score > 500) eligibleCategories.push('appliance');
  if (score > 600) eligibleCategories.push('electronics');
  if (score > 700) eligibleCategories.push('smartphone');
  if (score > 800) eligibleCategories.push('motorbike');
  
  // Get products in eligible categories
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('category', eligibleCategories)
    .eq('is_available', true);
    
  if (error) throw error;
  return data;
}
