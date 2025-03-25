
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import * as financialService from '@/services/financial-service';
import { Transaction, Loan } from '@/types/supabase';

export function useFinancial() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get user profile
  const userProfile = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => user ? financialService.getUserProfile(user.id) : null,
    enabled: !!user,
  });

  // Get user balance
  const userBalance = useQuery({
    queryKey: ['userBalance', user?.id],
    queryFn: () => user ? financialService.getUserBalance(user.id) : 0,
    enabled: !!user,
  });

  // Get transaction history
  const transactionHistory = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => user ? financialService.getTransactionHistory(user.id) : [],
    enabled: !!user,
  });

  // Get active loans
  const activeLoans = useQuery({
    queryKey: ['activeLoans', user?.id],
    queryFn: () => user ? financialService.getActiveLoans(user.id) : [],
    enabled: !!user,
  });

  // Get Kifaa score
  const kifaaScore = useQuery({
    queryKey: ['kifaaScore', user?.id],
    queryFn: () => user ? financialService.calculateKifaaScore(user.id) : 0,
    enabled: !!user,
  });

  // Get eligible products
  const eligibleProducts = useQuery({
    queryKey: ['eligibleProducts', user?.id],
    queryFn: () => user ? financialService.getEligibleProducts(user.id) : [],
    enabled: !!user,
  });

  // Update user profile mutation
  const updateProfile = useMutation({
    mutationFn: (updates: any) => {
      if (!user) throw new Error('User not authenticated');
      return financialService.updateUserProfile(user.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "There was a problem updating your profile.",
      });
    },
  });

  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');
      return financialService.createTransaction({
        ...transaction,
        user_id: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userBalance', user?.id] });
      toast({
        title: "Transaction Complete",
        description: "Your transaction has been processed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error.message || "There was a problem processing your transaction.",
      });
    },
  });

  // Apply for loan mutation
  const applyForLoan = useMutation({
    mutationFn: (loan: Omit<Loan, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      return financialService.applyForLoan({
        ...loan,
        user_id: user.id,
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLoans', user?.id] });
      toast({
        title: "Loan Application Submitted",
        description: "Your loan application has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Application Failed",
        description: error.message || "There was a problem submitting your loan application.",
      });
    },
  });

  // Simulate loan approval (in real-world this would be done by admin/backend)
  const simulateApproval = async (loanId: string, amount: number) => {
    setIsLoading(true);
    
    try {
      if (!user) throw new Error('User not authenticated');
      
      // 1. Update loan status to approved
      await supabase
        .from('loans')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', loanId);
      
      // 2. Create disbursement transaction
      await financialService.createTransaction({
        user_id: user.id,
        amount,
        type: 'loan_disbursement',
        status: 'completed',
        description: `Loan ${loanId} disbursement`,
        reference_id: loanId
      });
      
      queryClient.invalidateQueries({ queryKey: ['activeLoans', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userBalance', user?.id] });
      
      toast({
        title: "Loan Approved",
        description: `Your loan of KES ${amount} has been approved and disbursed.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Process Failed",
        description: error.message || "There was a problem processing the loan approval.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Make loan repayment
  const makeLoanRepayment = useMutation({
    mutationFn: async ({ loanId, amount }: { loanId: string, amount: number }) => {
      if (!user) throw new Error('User not authenticated');
      
      // 1. Create repayment transaction
      await financialService.createTransaction({
        user_id: user.id,
        amount,
        type: 'repayment',
        status: 'completed',
        description: `Loan repayment for ${loanId}`,
        reference_id: loanId
      });
      
      // 2. Get the loan to check remaining amount
      const { data: loan } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();
      
      if (!loan) throw new Error('Loan not found');
      
      // 3. Calculate new remaining amount
      const newRemaining = (loan.remaining_amount || loan.amount) - amount;
      
      // 4. Update loan with new remaining amount and status if fully paid
      const updates: any = { remaining_amount: newRemaining };
      if (newRemaining <= 0) {
        updates.status = 'completed';
      }
      
      await supabase
        .from('loans')
        .update(updates)
        .eq('id', loanId);
      
      return { loanId, amount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLoans', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userBalance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['kifaaScore', user?.id] });
      
      toast({
        title: "Payment Successful",
        description: "Your loan repayment has been processed.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "There was a problem processing your payment.",
      });
    },
  });

  return {
    isLoading: isLoading || userProfile.isLoading || userBalance.isLoading,
    userProfile: userProfile.data,
    userBalance: userBalance.data,
    transactionHistory: transactionHistory.data || [],
    activeLoans: activeLoans.data || [],
    kifaaScore: kifaaScore.data,
    eligibleProducts: eligibleProducts.data || [],
    updateProfile: updateProfile.mutate,
    createTransaction: createTransaction.mutate,
    applyForLoan: applyForLoan.mutate,
    simulateApproval,
    makeLoanRepayment: makeLoanRepayment.mutate,
    refetchAll: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userBalance', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['activeLoans', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['kifaaScore', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['eligibleProducts', user?.id] });
    }
  };
}
