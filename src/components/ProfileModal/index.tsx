import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { Close as CloseIcon, PhotoCamera } from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../supabaseClient";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ open, onClose }: ProfileModalProps) => {
  const { session, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    profile_picture: "",
    bio: "",
    nationality: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    passport_number: "",
    travel_preferences: "",
  });

  // Load existing profile data when modal opens
  useEffect(() => {
    if (open && session?.user) {
      setLoading(true);
      loadProfileData();
    }
  }, [open, session?.user]);

  const loadProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", session?.user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      // Set form data with existing profile or default values
      const profileData = {
        full_name:
          data?.full_name || session?.user?.user_metadata?.full_name || "",
        email: data?.email || session?.user?.email || "",
        phone_number: data?.phone_number || "",
        profile_picture:
          data?.profile_picture ||
          session?.user?.user_metadata?.avatar_url ||
          "",
        bio: data?.bio || "",
        nationality: data?.nationality || "",
        address: data?.address || "",
        emergency_contact_name: data?.emergency_contact_name || "",
        emergency_contact_phone: data?.emergency_contact_phone || "",
        passport_number: data?.passport_number || "",
        travel_preferences: data?.travel_preferences || "",
      };

      setFormData(profileData);
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear validation error for this field when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

  const uploadFile = async (file: File) => {
    try {
      if (!file || !session?.user?.id) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setUploading(true);
      setError("");

      // Delete old avatar if it exists and was uploaded to our storage
      if (
        formData.profile_picture &&
        formData.profile_picture.includes("profile-images")
      ) {
        try {
          const oldFileName = formData.profile_picture.split("/").pop();
          if (oldFileName) {
            const oldFilePath = `${session.user.id}/${oldFileName}`;
            await supabase.storage.from("profile-images").remove([oldFilePath]);
          }
        } catch (deleteError) {
          console.warn("Could not delete old avatar:", deleteError);
        }
      }

      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(fileName);

      // Update form data with new avatar URL
      setFormData((prev) => ({
        ...prev,
        profile_picture: publicUrl,
      }));

      // Automatically save the new avatar URL to the database
      try {
        const profileData = {
          user_id: session.user.id,
          profile_picture: publicUrl,
        };

        const { error: saveError } = await supabase
          .from("user_profiles")
          .upsert(profileData, {
            onConflict: "user_id",
            ignoreDuplicates: false,
          });

        if (saveError) {
          console.warn("Could not save avatar URL to profile:", saveError);
        } else {
          // Refresh profile context to update header
          await refreshProfile();
        }
      } catch (saveError) {
        console.warn("Could not update profile with new avatar:", saveError);
      }

      setMessage("Avatar uploaded successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setError(error?.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files[0]) {
      await uploadFile(files[0]);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!formData.full_name?.trim()) {
      errors.full_name = "Full name is required";
    }

    if (!formData.phone_number?.trim()) {
      errors.phone_number = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone_number)) {
      errors.phone_number = "Please enter a valid phone number";
    }


    if (!formData.nationality?.trim()) {
      errors.nationality = "Nationality is required";
    }

    if (!formData.address?.trim()) {
      errors.address = "Address is required";
    }

    // Optional but validated fields
    if (
      formData.passport_number &&
      !/^[A-Z0-9]{6,12}$/i.test(formData.passport_number.replace(/\s/g, ""))
    ) {
      errors.passport_number = "Please enter a valid passport number";
    }

    if (
      formData.emergency_contact_phone &&
      !/^\+?[\d\s\-\(\)]+$/.test(formData.emergency_contact_phone)
    ) {
      errors.emergency_contact_phone = "Please enter a valid phone number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;

    // Validate form before submission
    if (!validateForm()) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    setValidationErrors({});

    try {
      // Prepare data for upsert
      const profileData = {
        user_id: session.user.id,
        full_name: formData.full_name || null,
        email: formData.email || null,
        phone_number: formData.phone_number || null,
        profile_picture: formData.profile_picture || null,
        bio: formData.bio || null,
        nationality: formData.nationality || null,
        address: formData.address || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        passport_number: formData.passport_number || null,
        travel_preferences: formData.travel_preferences || null,
      };

      const { error } = await supabase
        .from("user_profiles")
        .upsert(profileData, {
          onConflict: "user_id",
          ignoreDuplicates: false,
        });

      if (error) {
        throw error;
      }

      setMessage("Profile updated successfully!");

      // Refresh the profile context to update header avatar
      await refreshProfile();

      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const calculateProfileCompletion = () => {
    const requiredFields = [
      "full_name",
      "phone_number",
      "nationality",
      "address",
    ];
    const optionalFields = [
      "bio",
      "travel_preferences",
      "emergency_contact_name",
      "emergency_contact_phone",
      "passport_number",
    ];

    const completedRequired = requiredFields.filter((field) =>
      formData[field as keyof typeof formData]?.trim()
    ).length;
    const completedOptional = optionalFields.filter((field) =>
      formData[field as keyof typeof formData]?.trim()
    ).length;

    const requiredPercentage = (completedRequired / requiredFields.length) * 70; // 70% for required fields
    const optionalPercentage = (completedOptional / optionalFields.length) * 30; // 30% for optional fields

    const profilePicture = formData.profile_picture ? 10 : 0; // Extra 10% for profile picture

    return Math.min(
      100,
      Math.round(requiredPercentage + optionalPercentage + profilePicture)
    );
  };

  const handleClose = () => {
    setError("");
    setMessage("");
    onClose();
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #FF621F, #FF8A4F)",
          color: "white",
          m: 0,
          p: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="600">
            My Profile
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
              Profile {calculateProfileCompletion()}% complete
            </Typography>
            <LinearProgress
              variant="determinate"
              value={calculateProfileCompletion()}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Profile Picture Section */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={3}
            >
              <Box
                position="relative"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  borderRadius: "50%",
                  border: dragOver
                    ? "3px dashed #FF621F"
                    : "3px dashed transparent",
                  padding: dragOver ? "8px" : "11px", // Adjust padding to maintain size
                  transition: "all 0.2s ease",
                  backgroundColor: dragOver
                    ? "rgba(255, 98, 31, 0.1)"
                    : "transparent",
                }}
              >
                <Avatar
                  src={formData.profile_picture}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: "4px solid #FF621F",
                    cursor: uploading ? "default" : "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: uploading ? "none" : "scale(1.05)",
                      boxShadow: uploading
                        ? "none"
                        : "0 8px 25px rgba(255, 98, 31, 0.3)",
                    },
                  }}
                >
                  {formData.full_name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
                <label htmlFor="avatar-upload">
                  <IconButton
                    component="span"
                    disabled={uploading}
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: -8,
                      backgroundColor: "#FF621F",
                      color: "white",
                      width: 40,
                      height: 40,
                      boxShadow: "0 4px 12px rgba(255, 98, 31, 0.4)",
                      "&:hover": {
                        backgroundColor: "#E5541B",
                        transform: "scale(1.1)",
                        boxShadow: "0 6px 16px rgba(255, 98, 31, 0.6)",
                      },
                      "&:disabled": {
                        backgroundColor: "#ccc",
                        transform: "none",
                        boxShadow: "none",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {uploading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <PhotoCamera fontSize="medium" />
                    )}
                  </IconButton>
                </label>
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {uploading
                    ? "Uploading image..."
                    : dragOver
                    ? "Drop image here!"
                    : "Click the camera icon or drag & drop an image"}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Supported: JPG, PNG, GIF, WebP (Max 5MB)
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Basic Information */}
            <Typography variant="h6" fontWeight="600" mb={2} color="#FF621F">
              Basic Information
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                (* Required fields)
              </Typography>
            </Typography>
            <Box display="flex" flexDirection="column" gap={3} mb={3}>
              <Box
                display="flex"
                gap={2}
                flexDirection={{ xs: "column", sm: "row" }}
              >
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.full_name}
                  onChange={handleInputChange("full_name")}
                  variant="outlined"
                  required
                  error={!!validationErrors.full_name}
                  helperText={validationErrors.full_name || ""}
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  variant="outlined"
                  disabled
                  helperText="Email cannot be changed"
                />
              </Box>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone_number}
                onChange={handleInputChange("phone_number")}
                variant="outlined"
                placeholder="+971 50 123 4567"
                required
                error={!!validationErrors.phone_number}
                helperText={
                  validationErrors.phone_number ||
                  "Include country code (e.g., +971)"
                }
              />
              <Box
                display="flex"
                gap={2}
                flexDirection={{ xs: "column", sm: "row" }}
              >
                <TextField
                  fullWidth
                  label="Nationality"
                  value={formData.nationality}
                  onChange={handleInputChange("nationality")}
                  variant="outlined"
                  placeholder="e.g., United States"
                  required
                  error={!!validationErrors.nationality}
                  helperText={
                    validationErrors.nationality ||
                    "Required for travel documentation"
                  }
                />
                <TextField
                  fullWidth
                  label="Passport Number"
                  value={formData.passport_number}
                  onChange={handleInputChange("passport_number")}
                  variant="outlined"
                  placeholder="e.g., A12345678"
                  error={!!validationErrors.passport_number}
                  helperText={
                    validationErrors.passport_number ||
                    "Optional - for international travel"
                  }
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Additional Information */}
            <Typography variant="h6" fontWeight="600" mb={2} color="#FF621F">
              Additional Information
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                (* Address is required)
              </Typography>
            </Typography>
            <Box display="flex" flexDirection="column" gap={3} mb={3}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleInputChange("address")}
                variant="outlined"
                multiline
                rows={2}
                placeholder="Your full address"
                required
                error={!!validationErrors.address}
                helperText={
                  validationErrors.address ||
                  "Required for billing and emergency contact"
                }
              />
              <TextField
                fullWidth
                label="Bio"
                value={formData.bio}
                onChange={handleInputChange("bio")}
                variant="outlined"
                multiline
                rows={3}
                placeholder="Tell us about yourself..."
              />
              <TextField
                fullWidth
                label="Travel Preferences"
                value={formData.travel_preferences}
                onChange={handleInputChange("travel_preferences")}
                variant="outlined"
                multiline
                rows={2}
                placeholder="Adventure, relaxation, culture, food, etc."
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Emergency Contact */}
            <Typography variant="h6" fontWeight="600" mb={2} color="#FF621F">
              Emergency Contact
            </Typography>
            <Box
              display="flex"
              gap={2}
              flexDirection={{ xs: "column", sm: "row" }}
            >
              <TextField
                fullWidth
                label="Emergency Contact Name"
                value={formData.emergency_contact_name}
                onChange={handleInputChange("emergency_contact_name")}
                variant="outlined"
                placeholder="Contact person name"
              />
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                value={formData.emergency_contact_phone}
                onChange={handleInputChange("emergency_contact_phone")}
                variant="outlined"
                placeholder="+971 50 123 4567"
                error={!!validationErrors.emergency_contact_phone}
                helperText={
                  validationErrors.emergency_contact_phone ||
                  "Include country code"
                }
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderColor: "#ddd",
            color: "#666",
            "&:hover": {
              borderColor: "#ccc",
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveProfile}
          variant="contained"
          disabled={saving}
          sx={{
            background: "linear-gradient(135deg, #FF621F, #FF8A4F)",
            "&:hover": {
              background: "linear-gradient(135deg, #E5541B, #E67B44)",
            },
            "&:disabled": {
              background: "#ccc",
            },
          }}
        >
          {saving ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Save Profile"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
