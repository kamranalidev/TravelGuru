import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import { useAuth } from "../../../../hooks/useAuth";
import { supabase } from "../../../../supabaseClient";
import "./index.css";

type FormState = {
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
};

export const ProfilePage = () => {
  const { session, profile, refreshProfile } = useAuth();
  const user = session?.user;

  const [formState, setFormState] = useState<FormState>({
    fullName: "",
    phoneNumber: "",
    avatarUrl: "",
  });
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsInitializing(false);
      return;
    }

    if (!profile) {
      setIsInitializing(true);
      refreshProfile()
        .catch((error) => {
          console.error("Unable to load profile:", error);
        })
        .finally(() => setIsInitializing(false));

      setFormState({
        fullName:
          user.user_metadata?.full_name || user.user_metadata?.name || "",
        phoneNumber: user.user_metadata?.phone_number || "",
        avatarUrl:
          user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
      });
      return;
    }

    setFormState({
      fullName: profile.full_name || "",
      phoneNumber: profile.phone_number ? String(profile.phone_number) : "",
      avatarUrl: profile.profile_picture || "",
    });
    setIsInitializing(false);
  }, [user, profile, refreshProfile]);

  const initials = useMemo(() => {
    if (formState.fullName.trim()) {
      return formState.fullName
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
    }
    return (
      profile?.email?.[0]?.toUpperCase() ??
      user?.email?.[0]?.toUpperCase() ??
      "U"
    );
  }, [formState.fullName, profile?.email, user?.email]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setStatusMessage(null);
    if (profile) {
      setFormState({
        fullName: profile.full_name || "",
        phoneNumber: profile.phone_number ? String(profile.phone_number) : "",
        avatarUrl: profile.profile_picture || "",
      });
      return;
    }

    if (user) {
      setFormState({
        fullName:
          user.user_metadata?.full_name || user.user_metadata?.name || "",
        phoneNumber: user.user_metadata?.phone_number || "",
        avatarUrl:
          user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const sanitizedPhone = formState.phoneNumber.replace(/[^\d]/g, "");

      const profilePayload = {
        user_id: user.id,
        email: user.email,
        full_name: formState.fullName.trim() || null,
        phone_number: sanitizedPhone || null,
        profile_picture: formState.avatarUrl.trim() || null,
      };

      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert(profilePayload, { onConflict: "user_id" });

      if (profileError) {
        throw profileError;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formState.fullName,
          phone_number: sanitizedPhone || null,
          avatar_url: formState.avatarUrl || null,
        },
      });

      if (authError) {
        throw authError;
      }

      await refreshProfile();

      const {
        data: { session: updatedSession },
      } = await supabase.auth.getSession();

      if (updatedSession) {
        localStorage.setItem(
          "supabase_session",
          JSON.stringify(updatedSession)
        );
      }

      setStatusMessage({
        type: "success",
        message: "Profile updated successfully.",
      });
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      setStatusMessage({
        type: "error",
        message:
          error?.message || "Unable to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Please log in to manage your profile.
        </Typography>
      </Box>
    );
  }

  if (isInitializing) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const emailDisplay = profile?.email || user.email;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 960,
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Profile settings
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 4 }}>
        Update your personal information so we can personalize your travel
        experience.
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 3,
              textAlign: "center",
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Avatar
                src={formState.avatarUrl || undefined}
                alt={formState.fullName || "User avatar"}
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: formState.avatarUrl ? "transparent" : "#FFE4D6",
                  color: formState.avatarUrl ? "inherit" : "#FF621F",
                  fontSize: "1.75rem",
                }}
              >
                {!formState.avatarUrl ? initials : null}
              </Avatar>
              <Typography sx={{ fontWeight: 600 }}>{emailDisplay}</Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                This information is shared with your booking confirmations.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              p: { xs: 3, md: 4 },
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {statusMessage && (
                  <Alert
                    severity={statusMessage.type}
                    onClose={() => setStatusMessage(null)}
                  >
                    {statusMessage.message}
                  </Alert>
                )}
                <TextField
                  label="Full name"
                  name="fullName"
                  value={formState.fullName}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="e.g. Ryman Alex"
                />
                <TextField
                  label="Phone number"
                  name="phoneNumber"
                  value={formState.phoneNumber}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="+971 55 123 4567"
                />
                <TextField
                  label="Avatar URL"
                  name="avatarUrl"
                  value={formState.avatarUrl}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="https://example.com/avatar.png"
                  helperText="Paste a link to your profile photo."
                />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="flex-end"
                >
                  <Button
                    type="button"
                    variant="outlined"
                    color="inherit"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disableElevation
                    sx={{
                      backgroundColor: "#FF621F",
                      "&:hover": { backgroundColor: "#f0550f" },
                      minWidth: 140,
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
