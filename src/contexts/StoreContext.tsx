import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Database } from '../lib/database.types';

type Store = Database['public']['Tables']['stores']['Row'];
type StoreUser = Database['public']['Tables']['store_users']['Row'];

interface StoreContextType {
  currentStore: Store | null;
  stores: Store[];
  userRole: string | null;
  loading: boolean;
  setCurrentStore: (store: Store) => void;
  refreshStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentStore, setCurrentStoreState] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    if (!user) {
      setStores([]);
      setCurrentStoreState(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    const { data: ownedStores } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id);

    const { data: memberStores } = await supabase
      .from('store_users')
      .select('store_id, stores(*)')
      .eq('user_id', user.id);

    const allStores: Store[] = [
      ...(ownedStores || []),
      ...(memberStores?.map((m: any) => m.stores).filter(Boolean) || []),
    ];

    const uniqueStores = Array.from(
      new Map(allStores.map(store => [store.id, store])).values()
    );

    setStores(uniqueStores);

    if (uniqueStores.length > 0 && !currentStore) {
      const savedStoreId = localStorage.getItem('currentStoreId');
      const initialStore = savedStoreId
        ? uniqueStores.find(s => s.id === savedStoreId) || uniqueStores[0]
        : uniqueStores[0];
      setCurrentStoreState(initialStore);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, [user]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user || !currentStore) {
        setUserRole(null);
        return;
      }

      if (currentStore.owner_id === user.id) {
        setUserRole('Admin');
        return;
      }

      const { data } = await supabase
        .from('store_users')
        .select('role')
        .eq('store_id', currentStore.id)
        .eq('user_id', user.id)
        .maybeSingle();

      setUserRole(data?.role || null);
    };

    fetchUserRole();
  }, [user, currentStore]);

  const setCurrentStore = (store: Store) => {
    setCurrentStoreState(store);
    localStorage.setItem('currentStoreId', store.id);
  };

  const refreshStores = async () => {
    await fetchStores();
  };

  const value = {
    currentStore,
    stores,
    userRole,
    loading,
    setCurrentStore,
    refreshStores,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
