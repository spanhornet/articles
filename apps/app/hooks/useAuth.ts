"use client"

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

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
        error: null,
    });

    // Function to fetch user session data
    const fetchSession = async () => {
        try {
            setSession(prev => ({ ...prev, loading: true })); // Set loading state

            const response = await fetchApi('/api/user'); // Fetch user session from API
            
            if (!response.ok) {
                if (response.status === 401) {
                    // User is not authenticated, reset session
                    setSession({ user: null, loading: false, error: null });
                    return;
                }
                throw new Error('Failed to fetch session'); // Handle other errors
            }

            const data = await response.json(); // Parse response data

            setSession({
                user: data.user, // Set authenticated user
                loading: false,  // Mark loading as complete
                error: null,
            });
        } catch (error) {
            setSession({
                user: null,
                loading: false,
                error: error instanceof Error ? error : new Error('Unknown error'), // Handle errors
            });
        }
    };

    // Function to sign out the user
    const signOut = async () => {
        try {
            await fetchApi('/api/user/sign-out', {
                method: 'POST',
            }); // Call API to sign out
            setSession({
                user: null,
                loading: false,
                error: null, // Clear session on sign out
            });
        } catch (error) {
            console.error('Sign out error:', error); // Log sign-out errors
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
