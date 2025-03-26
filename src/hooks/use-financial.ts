
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import * as financialService from '@/services/financial-service';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Types
export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP';

export type Transaction = {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  currency: Currency;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'loan_disbursement' | 'loan_repayment';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  recipient_id?: string;
  reference?: string;
};

export type Wallet = {
  id: string;
  user_id: string;
  currency: Currency;
  balance: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  term_min: number;
  term_max: number;
  type: 'personal_loan' | 'business_loan' | 'asset_financing';
  status: 'active' | 'inactive';
  created_at: string;
};

export type LoanStatus = 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaying' | 'paid' | 'defaulted';

export type Loan = {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  interest_rate: number;
  term_months: number;
  monthly_payment: number;
  total_payment: number;
  status: LoanStatus;
  purpose: string;
  disbursement_date?: string;
  next_payment_date?: string;
  remaining_amount: number;
  created_at: string;
};

export const useFinancial = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  // Wallets
  const { data: wallets, isLoading: isLoadingWallets } = useQuery({
    queryKey: ['wallets', userId],
    queryFn: () => financialService.getWallets(userId as string),
    enabled: !!userId,
  });

  // Transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', userId],
    queryFn: () => financialService.getTransactions(userId as string),
    enabled: !!userId,
  });

  // Products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: financialService.getProducts,
  });

  // Loans
  const { data: loans, isLoading: isLoadingLoans } = useQuery({
    queryKey: ['loans', userId],
    queryFn: () => financialService.getLoans(userId as string),
    enabled: !!userId,
  });

  // Credit Score
  const { data: creditScore, isLoading: isLoadingCreditScore } = useQuery({
    queryKey: ['creditScore', userId],
    queryFn: () => financialService.getCreditScore(userId as string),
    enabled: !!userId,
  });

  // Mutations
  const depositMutation = useMutation({
    mutationFn: financialService.deposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      toast.success('Deposit successful');
    },
    onError: (error: Error) => {
      toast.error(`Deposit failed: ${error.message}`);
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: financialService.withdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      toast.success('Withdrawal successful');
    },
    onError: (error: Error) => {
      toast.error(`Withdrawal failed: ${error.message}`);
    },
  });

  const transferMutation = useMutation({
    mutationFn: financialService.transfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets', userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      toast.success('Transfer successful');
    },
    onError: (error: Error) => {
      toast.error(`Transfer failed: ${error.message}`);
    },
  });

  const applyLoanMutation = useMutation({
    mutationFn: financialService.applyLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans', userId] });
      toast.success('Loan application submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Loan application failed: ${error.message}`);
    },
  });

  // Helper functions
  const getWalletBalance = (currency: Currency) => {
    const wallet = wallets?.find(w => w.currency === currency);
    return wallet?.balance || 0;
  };

  const getTotalBalance = () => {
    return wallets?.reduce((total, wallet) => total + wallet.balance, 0) || 0;
  };

  const deposit = async (amount: number, currency: Currency) => {
    if (!userId) {
      toast.error('You must be logged in to make a deposit');
      return;
    }

    return depositMutation.mutate({
      user_id: userId,
      amount,
      currency,
    });
  };

  const withdraw = async (amount: number, currency: Currency) => {
    if (!userId) {
      toast.error('You must be logged in to make a withdrawal');
      return;
    }

    const balance = getWalletBalance(currency);
    if (balance < amount) {
      toast.error('Insufficient funds');
      return;
    }

    return withdrawMutation.mutate({
      user_id: userId,
      amount,
      currency,
    });
  };

  const transfer = async (amount: number, currency: Currency, recipientId: string, description: string) => {
    if (!userId) {
      toast.error('You must be logged in to make a transfer');
      return;
    }

    const balance = getWalletBalance(currency);
    if (balance < amount) {
      toast.error('Insufficient funds');
      return;
    }

    return transferMutation.mutate({
      user_id: userId,
      amount,
      currency,
      type: 'transfer',
      status: 'completed',
      description,
      recipient_id: recipientId,
    });
  };

  const applyLoan = async (productId: string, amount: number, termMonths: number, purpose: string) => {
    if (!userId) {
      toast.error('You must be logged in to apply for a loan');
      return;
    }

    const product = products?.find(p => p.id === productId);
    if (!product) {
      toast.error('Invalid product');
      return;
    }

    if (amount < product.min_amount || amount > product.max_amount) {
      toast.error(`Loan amount must be between ${product.min_amount} and ${product.max_amount}`);
      return;
    }

    if (termMonths < product.term_min || termMonths > product.term_max) {
      toast.error(`Loan term must be between ${product.term_min} and ${product.term_max} months`);
      return;
    }

    // Calculate monthly payment and total payment
    const interestRate = product.interest_rate;
    const monthlyInterestRate = interestRate / 12 / 100;
    const monthlyPayment = (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths)) / 
                           (Math.pow(1 + monthlyInterestRate, termMonths) - 1);
    const totalPayment = monthlyPayment * termMonths;

    return applyLoanMutation.mutate({
      user_id: userId,
      product_id: productId,
      amount,
      interest_rate: interestRate,
      term_months: termMonths,
      monthly_payment: monthlyPayment,
      total_payment: totalPayment,
      status: 'pending',
      purpose,
      remaining_amount: amount,
    });
  };

  return {
    wallets,
    transactions,
    products,
    loans,
    creditScore,
    isLoading: isLoadingWallets || isLoadingTransactions || isLoadingProducts || isLoadingLoans || isLoadingCreditScore,
    getWalletBalance,
    getTotalBalance,
    deposit,
    withdraw,
    transfer,
    applyLoan,
  };
};
