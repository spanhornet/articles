"use client"

import { useState, useEffect } from 'react';

// Utilities
import { fetchApi } from '@/lib/api';

// Drizzle ORM
import type { User } from "@repo/database"

interface Session {
  user: User | null;  // Holds user data if authenticated, otherwise null
  loading: boolean;   // Indicates if authentication check is in progress
  error: Error | null; // Stores any errors that occur during fetching
}

// Custom hook to manage user authentication state
export function useAuth(): Session & {
  refetch: () => Promise<void>;  // Function to refetch session data
  signOut: () => Promise<void>;  // Function to sign out user
} {
  const [session, setSession] = useState<Session>({
    user: null,
    loading: true,
    error: null
  });

  // Function to fetch user session data
  const fetchSession = async () => {
    try {
      setSession(prev => ({ ...prev, loading: true })); // Set loading state

      const { data, error } = await fetchApi('/api/user', {
        showSuccessToast: false,
        showErrorToast: false
      }); 
      
      if (error) {
        // User is not authenticated, reset session
        setSession({ user: null, loading: false, error: null });
        return;
      }

      setSession({
          user: data.user, // Set authenticated user
          loading: false, // Mark loading as complete
          error: null,
      });
    } catch (error) {
        setSession({
            user: null,
            loading: false,
            error: null
        });
    }
  };

  // Function to sign out the user
  const signOut = async () => {
    const { data, error } = await fetchApi('/api/user/sign-out', {
      method: 'POST',
      showSuccessToast: false,
      showErrorToast: true
    });
    
    if (!error) {
      setSession({
        user: null,
        loading: false,
        error: null, // Clear session on sign out
      });
    }
  };

  useEffect(() => {
    fetchSession(); // Fetch session data on component mount
  }, []);

  return {
    ...session,
    refetch: fetchSession, // Expose refetch function
    signOut, // Expose signOut function
  };
}
