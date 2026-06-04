import { supabaseClient } from "../../lib/supabase";

export async function logout() {
  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    throw error;
  }

  return true;
}