'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (!session) {
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [session, status]);

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const requireAuth = (requiredRole?: string) => {
    if (status === 'loading') {
      return false;
    }

    if (!session) {
      router.push('/');
      return false;
    }

    if (requiredRole && session.user?.role !== requiredRole && session.user?.role !== 'ADMIN') {
      router.push('/');
      return false;
    }

    return true;
  };

  return {
    isAuthenticated: !!session,
    accessLevel: session?.user?.role?.toLowerCase() || null,
    loading: status === 'loading',
    logout,
    requireAuth,
    user: session?.user
  };
}
