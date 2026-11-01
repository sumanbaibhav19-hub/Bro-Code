import { supabase } from "./supabase";

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: displayName } },
  });
  if (error) {
    throw new Error("We could not create your account. If you already have one, try signing in.");
  }
  return data.session !== null;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error("That email and password do not match our records.");
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error("We could not sign you out. Please try again.");
  }
}
