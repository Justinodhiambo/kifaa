
import { useEffect, useState, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  isAdmin: () => boolean;
  isAgent: () => boolean;
  isCustomer: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "There was a problem signing in.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: userData?.first_name,
            last_name: userData?.last_name,
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (authData.user) {
        // 2. Create user profile in database
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            first_name: userData?.first_name,
            last_name: userData?.last_name,
            phone_number: userData?.phone_number,
            role: userData?.role || 'customer', // Default role
          });
          
        if (profileError) {
          // Rollback auth creation if profile creation fails
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw profileError;
        }
        
        // 3. Create initial wallet
        try {
          await supabase
            .from('wallets')
            .insert({
              user_id: authData.user.id,
              currency: 'KES',
              balance: 0
            });
        } catch (walletError) {
          console.error('Error creating initial wallet:', walletError);
          // Don't fail the sign-up if wallet creation fails
        }
      }
      
      toast({
        title: "Welcome to Kifaa!",
        description: "Your account has been created. Please check your email for verification.",
      });
      
      navigate('/verify-email');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "There was a problem creating your account.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message || "There was a problem signing out.",
      });
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link.",
      });
      
      navigate('/check-email');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: error.message || "There was a problem sending the password reset link.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "There was a problem updating your password.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      setLoading(true);
      
      if (!user) throw new Error('User not authenticated');
      
      // Update auth metadata if needed
      if (updates.email || updates.password) {
        const authUpdates: any = {};
        if (updates.email) authUpdates.email = updates.email;
        if (updates.password) authUpdates.password = updates.password;
        
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;
      }
      
      // Update profile data
      const profileUpdates = { ...updates };
      delete profileUpdates.password; // Don't store password in profile
      
      const { error: profileError } = await supabase
        .from('users')
        .update(profileUpdates)
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Refresh user profile
      await fetchUserProfile(user.id);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "There was a problem updating your profile.",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string | string[]) => {
    if (!userProfile || !userProfile.role) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userProfile.role);
    }
    
    return userProfile.role === role;
  };

  const isAdmin = () => hasRole('administrator');
  const isAgent = () => hasRole('agent');
  const isCustomer = () => hasRole('customer');

  const value = {
    session,
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    updateProfile,
    hasRole,
    isAdmin,
    isAgent,
    isCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
