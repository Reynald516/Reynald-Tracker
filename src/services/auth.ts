import { supabase } from "@/lib/supabase";

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Create profile row
  await supabase.from("profiles").insert({
    id: data.user?.id,
    full_name: email.split("@")[0],
  });

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}