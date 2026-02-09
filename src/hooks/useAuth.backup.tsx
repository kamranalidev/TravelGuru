import { useCallback, useContext, useEffect, useReducer, createContext, } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
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
} | null;
type AuthState = {
    session: Session;
    profile: UserProfile;
    loading: boolean;
    error: string | null;
};
type AuthAction = {
    type: "INIT";
} | {
    type: "SET_SESSION";
    payload: Session;
} | {
    type: "SET_PROFILE";
    payload: UserProfile;
} | {
    type: "CLEAR_SESSION";
} | {
    type: "SET_ERROR";
    payload: string | null;
} | {
    type: "FINISH_LOADING";
};
const initialState: AuthState = {
    session: null,
    profile: null,
    loading: true,
    error: null,
};
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case "INIT":
            return { ...state, loading: true, error: null };
        case "SET_SESSION":
            return { ...state, session: action.payload };
        case "SET_PROFILE":
            return { ...state, profile: action.payload };
        case "CLEAR_SESSION":
            return { ...state, session: null, profile: null };
        case "SET_ERROR":
            return { ...state, error: action.payload ?? null };
        case "FINISH_LOADING":
            return { ...state, loading: false };
        default:
            return state;
    }
};
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
    const [state, dispatch] = useReducer(authReducer, initialState);
    const navigate = useNavigate();
    const isSessionExpired = (session: Session) => {
        if (!session?.expires_at)
            return true;
        const now = Math.floor(Date.now() / 1000);
        return session.expires_at <= now;
    };
    const syncUserProfile = useCallback(async (authUser: any) => {
        if (!authUser?.id) {
            dispatch({ type: "SET_PROFILE", payload: null });
            return;
        }
        try {
            const payload = {
                user_id: authUser.id,
                email: authUser.email ?? null,
                full_name: authUser.user_metadata?.full_name ||
                    authUser.user_metadata?.name ||
                    null,
                profile_picture: authUser.user_metadata?.avatar_url ||
                    authUser.user_metadata?.picture ||
                    null,
            };
            const { data, error } = await supabase
                .from("user_profiles")
                .upsert(payload, {
                onConflict: "user_id",
                ignoreDuplicates: false,
            })
                .select()
                .single();
            if (error)
                throw error;
            dispatch({
                type: "SET_PROFILE",
                payload: data as UserProfile,
            });
        }
        catch (error: any) {
            console.error("Failed to sync user profile:", error);
            dispatch({
                type: "SET_ERROR",
                payload: error?.message || "Unable to sync profile.",
            });
        }
    }, []);
    const refreshProfile = useCallback(async () => {
        const userId = state.session?.user?.id;
        if (!userId) {
            dispatch({ type: "SET_PROFILE", payload: null });
            return;
        }
        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle();
            if (error)
                throw error;
            if (data) {
                dispatch({ type: "SET_PROFILE", payload: data as UserProfile });
            }
        }
        catch (error: any) {
            console.error("Failed to refresh user profile:", error);
            dispatch({
                type: "SET_ERROR",
                payload: error?.message || "Failed to refresh profile.",
            });
        }
    }, [state.session?.user?.id]);
    useEffect(() => {
        const checkSession = async () => {
            dispatch({ type: "INIT" });
            try {
                const stored = localStorage.getItem("supabase_session");
                const localSession = stored ? JSON.parse(stored) : null;
                const { data: { session }, error, } = await supabase.auth.getSession();
                if (error)
                    throw error;
                const activeSession = localSession || session;
                if (activeSession && !isSessionExpired(activeSession)) {
                    dispatch({ type: "SET_SESSION", payload: activeSession as Session });
                    await syncUserProfile(activeSession.user);
                }
                else {
                    localStorage.removeItem("supabase_session");
                    await supabase.auth.signOut();
                    dispatch({ type: "CLEAR_SESSION" });
                }
            }
            catch (error: any) {
                console.error("Error verifying session:", error);
                dispatch({ type: "CLEAR_SESSION" });
                dispatch({
                    type: "SET_ERROR",
                    payload: error?.message || "Unable to verify session.",
                });
                localStorage.removeItem("supabase_session");
            }
            finally {
                dispatch({ type: "FINISH_LOADING" });
            }
        };
        checkSession();
        const { data: { subscription }, } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (newSession && !isSessionExpired(newSession)) {
                dispatch({ type: "SET_SESSION", payload: newSession as Session });
                await syncUserProfile(newSession.user);
            }
            else {
                dispatch({ type: "CLEAR_SESSION" });
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [navigate, syncUserProfile]);
    return (<AuthContext.Provider value={{
            session: state.session,
            loading: state.loading,
            profile: state.profile,
            error: state.error,
            refreshProfile,
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => useContext(AuthContext);
