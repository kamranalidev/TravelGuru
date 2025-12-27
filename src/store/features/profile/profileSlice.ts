import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../../supabaseClient";

export type UserProfile = {
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

export type ProfileState = {
  data: UserProfile;
  loading: boolean;
  error: string | null;
};

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (userId: string) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw new Error(error.message);
    return data as Exclude<UserProfile, null>;
  }
);

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.data = action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load profile";
      });
  },
});

export const { clearProfile, setProfile } = profileSlice.actions;
export default profileSlice.reducer;
