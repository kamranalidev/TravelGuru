import { create } from "zustand";
import { supabase } from "../lib/supabase";
const AUTH_TIMEOUT = 15000; 
const PROFILE_TIMEOUT = 8000; 

const withTimeout = (promise, ms, errorMessage) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms)),
    ]);
};
export const useAuthStore = create((set, get) => ({
    
    user: null,
    userProfile: null,
    loading: true,
    initialized: false,
    error: null,
    _lastAuthEvent: null,
    
    initialize: async () => {
        
        if (get().initialized) {
            return;
        }
        try {
            set({ loading: true, error: null });
            
            const { data: { session }, error: sessionError, } = await withTimeout(supabase.auth.getSession(), AUTH_TIMEOUT, "Session fetch timed out");
            if (sessionError) {
                throw sessionError;
            }
            if (session?.user) {
                set({ user: session.user, initialized: true });
                
                get().fetchUserProfile(session.user.id);
            }
            else {
                set({ loading: false, initialized: true });
            }
            
            const { data: { subscription }, } = supabase.auth.onAuthStateChange(async (event, session) => {
                
                const eventKey = `${event}-${session?.user?.id || "none"}`;
                if (get()._lastAuthEvent === eventKey) {
                    return;
                }
                set({ _lastAuthEvent: eventKey });
                if (event === "SIGNED_OUT") {
                    set({
                        user: null,
                        userProfile: null,
                        loading: false,
                    });
                }
                else if (session?.user) {
                    set({ user: session.user });
                    // Only fetch profile on actual sign in, not on token refresh
                    if (event === "SIGNED_IN") {
                        get().fetchUserProfile(session.user.id);
                    }
                }
            });
            // Store subscription cleanup function
            set({
                _unsubscribe: () => subscription.unsubscribe(),
            });
        }
        catch (error) {
            set({
                loading: false,
                initialized: true,
                error: error.message,
                user: null,
                userProfile: null,
            });
        }
    },
    fetchUserProfile: async (userId) => {
        try {
            const { data, error } = await withTimeout(supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle(), PROFILE_TIMEOUT, "Profile fetch timed out");
            if (error) {
                // Don't treat profile fetch failure as critical
                set({ userProfile: null, loading: false });
                return;
            }
            set({ userProfile: data, loading: false });
        }
        catch (error) {
            // Profile fetch timeout is not critical - user can still use the app
            set({ userProfile: null, loading: false });
        }
    },
    signIn: async (email, password) => {
        try {
            set({ loading: true, error: null });
            const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }), AUTH_TIMEOUT, "Sign in timed out");
            if (error) {
                set({ loading: false, error: error.message });
                return { data: null, error };
            }
            // User will be set by onAuthStateChange listener
            return { data, error: null };
        }
        catch (error) {
            set({ loading: false, error: error.message });
            return { data: null, error };
        }
    },
    signOut: async () => {
        try {
            set({ loading: true, error: null });
            const { error } = await withTimeout(supabase.auth.signOut(), AUTH_TIMEOUT, "Sign out timed out");
            if (error) {
                set({ loading: false, error: error.message });
                return { error };
            }
            set({ user: null, userProfile: null, loading: false });
            return { error: null };
        }
        catch (error) {
            // Even if signout fails, clear local state
            set({
                user: null,
                userProfile: null,
                loading: false,
                error: error.message,
            });
            return { error };
        }
    },
    clearError: () => set({ error: null }),
    // Computed
    get isAdmin() {
        return get().userProfile?.user_role === 1;
    },
    get isAuthenticated() {
        return !!get().user;
    },
}));
// Selector hooks for performance
export const useUser = () => useAuthStore((state) => state.user);
export const useUserProfile = () => useAuthStore((state) => state.userProfile);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useIsAdmin = () => useAuthStore((state) => state.userProfile?.user_role === 1);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
