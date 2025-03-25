
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';
import * as financialService from '@/services/financial-service';
import { Transaction, Loan, Wallet, KYCDocument, Product } from '@/types/supabase';

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

  // Get user wallets
  const userWallets = useQuery({
    queryKey: ['userWallets', user?.id],
    queryFn: () => user ? financialService.getUserWallets(user.id) : [],
    enabled: !!user,
  });

  // Get wallet balance for a specific currency
  const getWalletBalance = (currency = 'KES') => {
    return useQuery({
      queryKey: ['walletBalance', user?.id, currency],
      queryFn: () => user ? financialService.getUserBalance(user.id, currency) : 0,
      enabled: !!user,
    });
  };

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

  // Get loan history
  const loanHistory = useQuery({
    queryKey: ['loanHistory', user?.id],
    queryFn: () => user ? financialService.getLoanHistory(user.id) : [],
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

  // Get all products
  const allProducts = useQuery({
    queryKey: ['products'],
    queryFn: () => financialService.getAllProducts(),
  });

  // Get user products
  const userProducts = useQuery({
    queryKey: ['userProducts', user?.id],
    queryFn: () => user ? financialService.getUserProducts(user.id) : [],
    enabled: !!user,
  });

  // Get KYC documents
  const kycDocuments = useQuery({
    queryKey: ['kycDocuments', user?.id],
    queryFn: () => user ? financialService.getKYCDocuments(user.id) : [],
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

  // Upload KYC document
  const uploadKYCDocument = useMutation({
    mutationFn: ({ docType, file }: { docType: KYCDocument['document_type'], file: File }) => {
      if (!user) throw new Error('User not authenticated');
      return financialService.uploadKYCDocument(user.id, docType, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycDocuments', user?.id] });
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded for verification.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "There was a problem uploading your document.",
      });
    },
  });

  // Create wallet
  const createWallet = useMutation({
    mutationFn: (currency: Wallet['currency']) => {
      if (!user) throw new Error('User not authenticated');
      return financialService.createWallet(user.id, currency);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWallets', user?.id] });
      toast({
        title: "Wallet Created",
        description: "Your new wallet has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Wallet Creation Failed",
        description: error.message || "There was a problem creating your wallet.",
      });
    },
  });

  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');
      return financialService.createTransaction({
        ...transaction,
        user_id: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userWallets', user?.id] });
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

  // Transfer money
  const transferMoney = useMutation({
    mutationFn: ({ recipientId, amount, currency, description }: { 
      recipientId: string, 
      amount: number, 
      currency: Transaction['currency'],
      description?: string
    }) => {
      if (!user) throw new Error('User not authenticated');
      return financialService.createTransaction({
        amount,
        currency,
        type: 'transfer',
        status: 'completed',
        description: description || `Transfer to user ${recipientId}`,
        recipient_id: recipientId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userWallets', user?.id] });
      toast({
        title: "Transfer Complete",
        description: "Your money transfer has been processed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message || "There was a problem processing your transfer.",
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

  // Apply for product financing
  const applyForProductFinancing = useMutation({
    mutationFn: ({ productId, loanDetails }: { 
      productId: string, 
      loanDetails: Omit<Loan, 'id' | 'created_at' | 'user_id' | 'product_id' | 'amount'> 
    }) => {
      if (!user) throw new Error('User not authenticated');
      return financialService.createLoanForProduct(user.id, productId, loanDetails);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLoans', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userProducts', user?.id] });
      toast({
        title: "Financing Application Submitted",
        description: "Your product financing application has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Application Failed",
        description: error.message || "There was a problem submitting your financing application.",
      });
    },
  });

  // Approve loan (admin/agent only)
  const approveLoan = useMutation({
    mutationFn: ({ loanId }: { loanId: string }) => {
      if (!user) throw new Error('User not authenticated');
      return financialService.approveLoan(loanId, user.id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeLoans'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['userWallets'] });
      toast({
        title: "Loan Approved",
        description: `Loan has been approved and funds disbursed to the borrower.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "There was a problem approving the loan.",
      });
    },
  });

  // Reject loan (admin/agent only)
  const rejectLoan = useMutation({
    mutationFn: ({ loanId, reason }: { loanId: string, reason: string }) => {
      if (!user) throw new Error('User not authenticated');
      return financialService.rejectLoan(loanId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLoans'] });
      toast({
        title: "Loan Rejected",
        description: "The loan application has been rejected.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: error.message || "There was a problem rejecting the loan.",
      });
    },
  });

  // Make loan repayment
  const makeLoanRepayment = useMutation({
    mutationFn: ({ 
      loanId, 
      amount, 
      currency, 
      paymentMethod 
    }: { 
      loanId: string, 
      amount: number, 
      currency: Transaction['currency'], 
      paymentMethod: Transaction['payment_method'] 
    }) => {
      if (!user) throw new Error('User not authenticated');
      return financialService.makeLoanRepayment(loanId, user.id, amount, currency, paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLoans', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userWallets', user?.id] });
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

  // Update Kifaa score
  const updateScore = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('User not authenticated');
      return financialService.updateKifaaScore(user.id);
    },
    onSuccess: (score) => {
      queryClient.invalidateQueries({ queryKey: ['kifaaScore', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['eligibleProducts', user?.id] });
      
      toast({
        title: "Kifaa Score Updated",
        description: `Your new Kifaa score is ${score}.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "There was a problem updating your score.",
      });
    },
  });

  return {
    isLoading: isLoading || userProfile.isLoading || userWallets.isLoading,
    userProfile: userProfile.data,
    userWallets: userWallets.data,
    transactionHistory: transactionHistory.data || [],
    activeLoans: activeLoans.data || [],
    loanHistory: loanHistory.data || [],
    kifaaScore: kifaaScore.data,
    eligibleProducts: eligibleProducts.data || [],
    allProducts: allProducts.data || [],
    userProducts: userProducts.data || [],
    kycDocuments: kycDocuments.data || [],
    
    // Mutations
    updateProfile: updateProfile.mutate,
    uploadKYCDocument: uploadKYCDocument.mutate,
    createWallet: createWallet.mutate,
    createTransaction: createTransaction.mutate,
    transferMoney: transferMoney.mutate,
    applyForLoan: applyForLoan.mutate,
    applyForProductFinancing: applyForProductFinancing.mutate,
    approveLoan: approveLoan.mutate,
    rejectLoan: rejectLoan.mutate,
    makeLoanRepayment: makeLoanRepayment.mutate,
    updateScore: updateScore.mutate,
    
    // Helpers
    getWalletBalance,
    refetchAll: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userWallets', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['activeLoans', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['loanHistory', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['kifaaScore', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['eligibleProducts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['userProducts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['kycDocuments', user?.id] });
    }
  };
}
