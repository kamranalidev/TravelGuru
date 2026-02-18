
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let isMounted = true;
        const initializeAuth = async () => {
            try {
                
                const { data: { session }, error, } = await supabase.auth.getSession();
                if (error) {
                    if (isMounted)
                        setLoading(false);
                    return;
                }
                if (isMounted) {
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        await fetchUserProfile(session.user.id);
                    }
                    else {
                        setLoading(false);
                    }
                }
            }
            catch (error) {
                if (isMounted)
                    setLoading(false);
            }
        };
        initializeAuth();
        
        const { data: { subscription }, } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted)
                return;
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchUserProfile(session.user.id);
            }
            else {
                setUserProfile(null);
                setLoading(false);
            }
        });
        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);
    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle();
            if (error)
                throw error;
            setUserProfile(data);
        }
        catch (error) {
            setUserProfile(null);
        }
        finally {
            setLoading(false);
        }
    };
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };
    const isAdmin = userProfile?.user_role === 1;
    const value = {
        user,
        userProfile,
        loading,
        signIn,
        signOut,
        isAdmin,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
