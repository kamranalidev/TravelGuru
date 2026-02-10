import { useEffect, useState, useContext, createContext } from "react";
import { supabase } from "../supabaseClient";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { login as loginAction, logout as logoutAction, } from "../store/features/auth/authSlice";
import { fetchUserProfile, clearProfile, } from "../store/features/profile/profileSlice";
import { clearCart } from "../store/features/cart/cartSlice";
import { clearServerCartState } from "../store/features/serverCart/serverCartSlice";
type Session = {
    access_token: string;
    refresh_token: string;
    expires_at?: number | undefined;
    expires_in: number;
    token_type: string;
    user: any;
} | null;
type UserProfile = {
    id: number;
    created_at: string;
    full_name: string | null;
    user_id: string;
    email: string | null;
    user_role: number | null;
    phone_number: string | null;
    profile_picture: string | null;
    bio: string | null;
    nationality: string | null;
    date_of_birth: string | null;
    address: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    passport_number: string | null;
    travel_preferences: string | null;
} | null;
const AuthContext = createContext<{
    session: Session;
    loading: boolean;
    profile: UserProfile;
    error: string | null;
    refreshProfile: () => Promise<void>;
}>({
    session: null,
    loading: true,
    profile: null,
    error: null,
    refreshProfile: async () => { },
});
export const AuthProvider = ({ children }: {
    children: React.ReactNode;
}) => {
    const [session, setSession] = useState<Session>(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile>(null);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 10000);
        return () => clearTimeout(timeout);
    }, []);
    
    const isSessionExpired = (session: Session) => {
        if (!session?.expires_at)
            return true;
        const now = Math.floor(Date.now() / 1000); 
        return session.expires_at <= now;
    };
    useEffect(() => {
        let mounted = true;
        const clearSupabaseAuthStorage = () => {
            try {
                
                localStorage.removeItem("supabase_session");
                
                
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (!key)
                        continue;
                    if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
                        localStorage.removeItem(key);
                    }
                }
                
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (!key)
                        continue;
                    if (key.toLowerCase().includes("supabase") &&
                        key.toLowerCase().includes("auth")) {
                        localStorage.removeItem(key);
                    }
                }
            }
            catch {
                
            }
        };
        const checkSession = async () => {
            try {
                
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Session check timeout")), 10000));
                const sessionPromise = supabase.auth.getSession();
                const { data: { session }, } = (await Promise.race([sessionPromise, timeoutPromise])) as any;
                if (!mounted)
                    return;
                if (session && !isSessionExpired(session)) {
                    setSession(session as Session);
                    dispatch(loginAction({
                        user: session.user,
                        token: session.access_token,
                    }));
                    
                    dispatch(fetchUserProfile(session.user.id));
                    
                    const fetchProfile = async () => {
                        try {
                            const { data: profileData } = await supabase
                                .from("user_profiles")
                                .select("*")
                                .eq("user_id", session.user.id)
                                .single();
                            if (mounted && profileData) {
                                setProfile(profileData as UserProfile);
                            }
                        }
                        catch {
                        }
                    };
                    fetchProfile();
                }
                else {
                    clearSupabaseAuthStorage();
                    setSession(null);
                    setProfile(null);
                    dispatch(logoutAction());
                    dispatch(clearProfile());
                    dispatch(clearCart());
                    dispatch(clearServerCartState());
                }
            }
            catch (error) {
                if (mounted) {
                    clearSupabaseAuthStorage();
                    setSession(null);
                    setProfile(null);
                    dispatch(logoutAction());
                    dispatch(clearProfile());
                    dispatch(clearCart());
                    dispatch(clearServerCartState());
                }
            }
            finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };
        checkSession();
        
        const { data: { subscription }, } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted)
                return;
            if (session && !isSessionExpired(session)) {
                setSession(session as Session);
                setError(null);
                dispatch(loginAction({
                    user: session.user,
                    token: session.access_token,
                }));
                dispatch(fetchUserProfile(session.user.id));
                
                const fetchProfile = async () => {
                    try {
                        const { data: profileData } = await supabase
                            .from("user_profiles")
                            .select("*")
                            .eq("user_id", session.user.id)
                            .single();
                        if (mounted && profileData) {
                            setProfile(profileData as UserProfile);
                        }
                    }
                    catch {
                    }
                };
                fetchProfile();
            }
            else {
                clearSupabaseAuthStorage();
                setSession(null);
                setProfile(null);
                dispatch(logoutAction());
                dispatch(clearProfile());
                dispatch(clearCart());
                dispatch(clearServerCartState());
            }
            if (mounted) {
                setLoading(false);
            }
        });
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [dispatch]);
    const refreshProfile = async () => {
        if (!session?.user?.id)
            return;
        try {
            
            await dispatch(fetchUserProfile(session.user.id)).unwrap();
            
            const { data: profileData, error: profileError } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", session.user.id)
                .single();
            if (profileError)
                throw profileError;
            setProfile((profileData ?? null) as UserProfile);
            setError(null);
        }
        catch (e: any) {
            setError(e?.message ?? "Failed to refresh profile");
        }
    };
    return (<AuthContext.Provider value={{
            session,
            loading,
            profile,
            error,
            refreshProfile,
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
