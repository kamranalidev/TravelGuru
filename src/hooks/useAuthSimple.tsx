import { useEffect, useState, useContext, createContext } from "react";
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

const AuthContext = createContext<{
  session: Session;
  loading: boolean;
  profile: UserProfile;
  error: string | null;
}>({
  session: null,
  loading: true,
  profile: null,
  error: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [error, setError] = useState<string | null>(null);

  // helper to check expiry
  const isSessionExpired = (session: Session) => {
    if (!session?.expires_at) return true;
    const now = Math.floor(Date.now() / 1000); // current epoch seconds
    return session.expires_at <= now;
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get session from Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session && !isSessionExpired(session)) {
          setSession(session as Session);

          // Try to get user profile (optional)
          try {
            const { data: profileData } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("user_id", session.user.id)
              .single();

            if (profileData) {
              setProfile(profileData as UserProfile);
            }
          } catch (profileError) {
            console.warn("Could not load user profile, continuing without it");
          }
        } else {
          // expired or missing → sign out
          localStorage.removeItem("supabase_session");
          setSession(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setError("Failed to check authentication status");
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && !isSessionExpired(session)) {
        setSession(session as Session);
        setError(null);

        // Try to get user profile (optional)
        try {
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (profileData) {
            setProfile(profileData as UserProfile);
          }
        } catch (profileError) {
          console.warn("Could not load user profile");
        }
      } else {
        setSession(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, profile, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
