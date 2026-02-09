import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET = "service-images";

// Helper function to get public URL for images
export const getImageUrl = (path) => {
  if (!path) return null;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl;
};

// Helper function to upload image
export const uploadImage = async (file, folder = "services") => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file);

  if (error) throw error;
  return data.path;
};

// Helper function to delete image
export const deleteImage = async (path) => {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) throw error;
};
