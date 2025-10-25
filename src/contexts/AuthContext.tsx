import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, Coordinator } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  coordinator: Coordinator | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, institution: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [coordinator, setCoordinator] = useState<Coordinator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadCoordinator(session.user.id);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadCoordinator(session.user.id);
        } else {
          setCoordinator(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadCoordinator = async (userId: string) => {
    const { data, error } = await supabase
      .from('coordinators')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setCoordinator(data);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string, institution: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const { error: profileError } = await supabase.from('coordinators').insert({
      id: authData.user.id,
      email,
      password_hash: '',
      full_name: fullName,
      institution,
    });

    if (profileError) throw profileError;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, coordinator, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
