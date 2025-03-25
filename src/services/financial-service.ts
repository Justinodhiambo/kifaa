import { supabase } from '@/lib/supabase';
import { 
  Transaction, 
  Loan, 
  User, 
  Wallet, 
  KYCDocument, 
  LoanPayment, 
  Product 
} from '@/types/supabase';

// User Profile Management
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

// KYC Document Management
export async function uploadKYCDocument(
  userId: string, 
  documentType: KYCDocument['document_type'], 
  file: File
) {
  // 1. Upload file to Supabase Storage
  const fileName = `${userId}_${documentType}_${Date.now()}`;
  const { data: fileData, error: fileError } = await supabase
    .storage
    .from('kyc_documents')
    .upload(fileName, file);
    
  if (fileError) throw fileError;
  
  // 2. Get the public URL
  const { data: urlData } = supabase
    .storage
    .from('kyc_documents')
    .getPublicUrl(fileName);
  
  const documentUrl = urlData.publicUrl;
  
  // 3. Create a record in the kyc_documents table
  const { data, error } = await supabase
    .from('kyc_documents')
    .insert({
      user_id: userId,
      document_type: documentType,
      document_url: documentUrl,
      status: 'pending'
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function getKYCDocuments(userId: string) {
  const { data, error } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
}

export async function verifyKYCDocument(documentId: string, isApproved: boolean, verifiedBy: string, rejectionReason?: string) {
  const updates: any = {
    status: isApproved ? 'approved' : 'rejected',
    verified_at: new Date().toISOString(),
    verified_by: verifiedBy
  };
  
  if (!isApproved && rejectionReason) {
    updates.rejection_reason = rejectionReason;
  }
  
  const { data, error } = await supabase
    .from('kyc_documents')
    .update(updates)
    .eq('id', documentId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Wallet Management
export async function getUserWallets(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
}

export async function createWallet(userId: string, currency: Wallet['currency']) {
  // Check if user already has a wallet in this currency
  const { data: existingWallets } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', userId)
    .eq('currency', currency);
    
  if (existingWallets && existingWallets.length > 0) {
    throw new Error(`User already has a ${currency} wallet`);
  }
  
  const { data, error } = await supabase
    .from('wallets')
    .insert({
      user_id: userId,
      currency,
      balance: 0
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function getWalletBalance(walletId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance, currency')
    .eq('id', walletId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function getUserBalance(userId: string, currency?: string) {
  // If currency is specified, return balance for that currency only
  if (currency) {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No wallet found for this currency
        return 0;
      }
      throw error;
    }
    
    return data?.balance || 0;
  }
  
  // Otherwise, calculate total balance from all wallets and transactions
  const { data: wallets, error: walletsError } = await supabase
    .from('wallets')
    .select('balance, currency')
    .eq('user_id', userId);
    
  if (walletsError) throw walletsError;
  
  // Return the wallets with their balances
  return wallets;
}

// Transaction Management
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
  // Start a Supabase transaction to ensure atomicity
  // 1. Insert the transaction record
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single();
    
  if (error) throw error;
  
  // 2. Update wallet balances
  if (transaction.status === 'completed') {
    // Get the wallet for this currency
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', transaction.user_id)
      .eq('currency', transaction.currency)
      .single();
      
    if (walletError) {
      // If wallet doesn't exist, create it
      if (walletError.code === 'PGRST116') {
        await createWallet(transaction.user_id, transaction.currency);
        
        const { data: newWallet } = await supabase
          .from('wallets')
          .select('id, balance')
          .eq('user_id', transaction.user_id)
          .eq('currency', transaction.currency)
          .single();
          
        if (newWallet) {
          await updateWalletBalance(newWallet.id, transaction);
        }
      } else {
        throw walletError;
      }
    } else if (wallet) {
      await updateWalletBalance(wallet.id, transaction);
    }
    
    // If it's a transfer, update recipient's wallet too
    if (transaction.type === 'transfer' && transaction.recipient_id) {
      const { data: recipientWallet, error: recipientWalletError } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', transaction.recipient_id)
        .eq('currency', transaction.currency)
        .single();
        
      if (recipientWalletError) {
        if (recipientWalletError.code === 'PGRST116') {
          await createWallet(transaction.recipient_id, transaction.currency);
          
          const { data: newRecipientWallet } = await supabase
            .from('wallets')
            .select('id, balance')
            .eq('user_id', transaction.recipient_id)
            .eq('currency', transaction.currency)
            .single();
            
          if (newRecipientWallet) {
            // For recipient, it's always a "deposit"
            await supabase
              .from('wallets')
              .update({
                balance: newRecipientWallet.balance + transaction.amount,
                updated_at: new Date().toISOString()
              })
              .eq('id', newRecipientWallet.id);
          }
        } else {
          throw recipientWalletError;
        }
      } else if (recipientWallet) {
        await supabase
          .from('wallets')
          .update({
            balance: recipientWallet.balance + transaction.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', recipientWallet.id);
      }
    }
  }
  
  return data;
}

async function updateWalletBalance(walletId: string, transaction: Omit<Transaction, 'id' | 'created_at'>) {
  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('balance')
    .eq('id', walletId)
    .single();
    
  if (error) throw error;
  
  let newBalance = wallet.balance;
  
  if (['deposit', 'loan_disbursement'].includes(transaction.type)) {
    newBalance += transaction.amount;
  } else if (['withdrawal', 'repayment', 'fee', 'transfer'].includes(transaction.type)) {
    newBalance -= transaction.amount;
  }
  
  if (newBalance < 0) {
    throw new Error('Insufficient balance for this transaction');
  }
  
  const { error: updateError } = await supabase
    .from('wallets')
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', walletId);
    
  if (updateError) throw updateError;
}

// Loan Management
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
  
  // If loan has payment_schedule, insert the payments
  if (loan.payment_schedule && loan.payment_schedule.length > 0) {
    const paymentsToInsert = loan.payment_schedule.map(payment => ({
      ...payment,
      loan_id: data.id
    }));
    
    const { error: paymentsError } = await supabase
      .from('loan_payments')
      .insert(paymentsToInsert);
      
    if (paymentsError) throw paymentsError;
  }
  
  return data;
}

export async function approveLoan(loanId: string, approvedBy: string) {
  // 1. Get the loan details
  const { data: loan, error: loanError } = await supabase
    .from('loans')
    .select('*')
    .eq('id', loanId)
    .single();
    
  if (loanError) throw loanError;
  
  if (loan.status !== 'pending') {
    throw new Error(`Loan is already ${loan.status}`);
  }
  
  // 2. Update loan status
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + loan.term_days);
  
  const { data, error } = await supabase
    .from('loans')
    .update({
      status: 'approved',
      approved_at: now.toISOString(),
      approved_by: approvedBy,
      due_date: dueDate.toISOString()
    })
    .eq('id', loanId)
    .select()
    .single();
    
  if (error) throw error;
  
  // 3. Disburse the loan amount
  await createTransaction({
    user_id: loan.user_id,
    amount: loan.amount,
    currency: loan.currency,
    type: 'loan_disbursement',
    status: 'completed',
    description: `Loan ${loanId} disbursement`,
    reference_id: loanId
  });
  
  return data;
}

export async function rejectLoan(loanId: string, reason: string) {
  const { data, error } = await supabase
    .from('loans')
    .update({
      status: 'rejected',
      // We could add a rejection_reason field to the loans table
    })
    .eq('id', loanId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function getLoanPayments(loanId: string) {
  const { data, error } = await supabase
    .from('loan_payments')
    .select('*')
    .eq('loan_id', loanId)
    .order('due_date', { ascending: true });
    
  if (error) throw error;
  return data;
}

export async function makeLoanRepayment(
  loanId: string, 
  userId: string, 
  amount: number, 
  currency: string, 
  paymentMethod: Transaction['payment_method']
) {
  // 1. Get the loan
  const { data: loan, error: loanError } = await supabase
    .from('loans')
    .select('*')
    .eq('id', loanId)
    .single();
    
  if (loanError) throw loanError;
  
  if (!['approved', 'active'].includes(loan.status)) {
    throw new Error(`Cannot make payment on a loan with status: ${loan.status}`);
  }
  
  // 2. Create repayment transaction
  const { data: transaction } = await createTransaction({
    user_id: userId,
    amount,
    currency,
    type: 'repayment',
    status: 'completed',
    description: `Loan repayment for ${loanId}`,
    reference_id: loanId,
    payment_method: paymentMethod
  });
  
  // 3. Calculate new remaining amount
  const newRemaining = (loan.remaining_amount || loan.amount) - amount;
  
  // 4. Update loan with new remaining amount and status if fully paid
  const updates: any = { 
    remaining_amount: newRemaining,
    status: 'active'
  };
  
  if (newRemaining <= 0) {
    updates.status = 'completed';
  }
  
  const { data, error } = await supabase
    .from('loans')
    .update(updates)
    .eq('id', loanId)
    .select()
    .single();
    
  if (error) throw error;
  
  // 5. Update any due payments
  await updateLoanPayments(loanId, amount);
  
  return { loan: data, transaction };
}

async function updateLoanPayments(loanId: string, amountPaid: number) {
  // Get pending payments for this loan
  const { data: payments, error } = await supabase
    .from('loan_payments')
    .select('*')
    .eq('loan_id', loanId)
    .in('status', ['pending', 'overdue'])
    .order('due_date', { ascending: true });
    
  if (error) throw error;
  
  let remainingAmount = amountPaid;
  
  // Update payments starting from the earliest
  for (const payment of payments) {
    if (remainingAmount <= 0) break;
    
    const amountForThisPayment = Math.min(remainingAmount, payment.amount - (payment.paid_amount || 0));
    const newPaidAmount = (payment.paid_amount || 0) + amountForThisPayment;
    const newStatus = newPaidAmount >= payment.amount ? 'paid' : payment.status;
    
    await supabase
      .from('loan_payments')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        paid_date: newStatus === 'paid' ? new Date().toISOString() : payment.paid_date
      })
      .eq('id', payment.id);
      
    remainingAmount -= amountForThisPayment;
  }
}

// Credit Scoring
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
  
  // Get KYC status
  const { data: kycDocuments, error: kycError } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('user_id', userId);
    
  if (kycError) throw kycError;
  
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
  
  // Add points for KYC verification
  const verifiedDocuments = kycDocuments.filter(doc => doc.status === 'approved');
  score += verifiedDocuments.length * 15;
  
  // Add points for deposit frequency
  const deposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed');
  if (deposits.length > 0) {
    // More regular deposits = better score
    score += Math.min(deposits.length * 2, 50);
  }
  
  // Ensure score is between 300 and 850
  return Math.max(300, Math.min(850, score));
}

export async function updateKifaaScore(userId: string): Promise<number> {
  const score = await calculateKifaaScore(userId);
  
  // Update the user's Kifaa score
  const { error } = await supabase
    .from('users')
    .update({ kifaa_score: score })
    .eq('id', userId);
    
  if (error) throw error;
  
  // Also update the user's tier based on score
  let tier: User['tier'] = 'basic';
  if (score > 700) tier = 'platinum';
  else if (score > 600) tier = 'gold';
  else if (score > 500) tier = 'silver';
  
  await supabase
    .from('users')
    .update({ tier })
    .eq('id', userId);
    
  return score;
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

// Product Management
export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true);
    
  if (error) throw error;
  return data;
}

export async function getProductById(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createLoanForProduct(
  userId: string, 
  productId: string, 
  loanDetails: Omit<Loan, 'id' | 'created_at' | 'user_id' | 'product_id'>
) {
  // 1. Get the product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
    
  if (productError) throw productError;
  
  // 2. Create the loan
  const loan = {
    ...loanDetails,
    user_id: userId,
    product_id: productId,
    amount: product.price,
    currency: product.currency,
  };
  
  const { data: newLoan, error } = await supabase
    .from('loans')
    .insert(loan)
    .select()
    .single();
    
  if (error) throw error;
  
  // 3. Create the user-product relationship
  const { error: userProductError } = await supabase
    .from('user_products')
    .insert({
      user_id: userId,
      product_id: productId,
      loan_id: newLoan.id,
      status: 'financing'
    });
    
  if (userProductError) throw userProductError;
  
  return newLoan;
}

export async function getUserProducts(userId: string) {
  const { data, error } = await supabase
    .from('user_products')
    .select(`
      *,
      products:product_id (*)
    `)
    .eq('user_id', userId);
    
  if (error) throw error;
  return data;
}
