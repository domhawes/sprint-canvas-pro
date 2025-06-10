
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let authTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Clear any existing auth state first
        if (mounted) {
          setUser(null);
          setSession(null);
          setLoading(true);
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change:', event, session?.user?.email);
            
            if (!mounted) return;

            // Clear any pending timeout
            if (authTimeout) {
              clearTimeout(authTimeout);
            }

            if (event === 'SIGNED_OUT' || !session) {
              setSession(null);
              setUser(null);
            } else {
              setSession(session);
              setUser(session.user);
            }

            setLoading(false);
            setInitialized(true);
          }
        );

        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          authTimeout = setTimeout(() => reject(new Error('Auth timeout')), 5000);
        });

        try {
          const { data: { session }, error } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any;

          if (authTimeout) {
            clearTimeout(authTimeout);
          }

          if (!mounted) return;

          if (error) {
            console.error('Session error:', error);
            setSession(null);
            setUser(null);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          if (mounted) {
            setSession(null);
            setUser(null);
          }
        }

        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
          setSession(null);
          setUser(null);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
    };
  }, []);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!initialized) {
        console.log('Auth fallback timeout - forcing initialization');
        setLoading(false);
        setInitialized(true);
      }
    }, 10000); // 10 second fallback

    return () => clearTimeout(fallbackTimeout);
  }, [initialized]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Sign up without email confirmation to avoid email sending issues
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: fullName ? { full_name: fullName } : undefined,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Sign up successful:', data);
        toast({
          title: "Account created successfully",
          description: "You can now sign in with your credentials.",
        });
      }

      return { error };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Sign out successful');
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
        
        // Force reload to clear any remaining state
        setTimeout(() => {
          window.location.href = '/auth';
        }, 500);
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
