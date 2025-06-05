// src/services/AuthService.js

import { supabase } from "../supabaseClient";

const AuthService = {
  async signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(email, password, metadata = {}) {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getSession() {
    return await supabase.auth.getSession();
  },

  async onAuthStateChanged(callback) {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) =>
      callback(session?.user)
    );
    return () => subscription.unsubscribe();
  },

  async getCurrentUserProfile() {
    const session = await this.getSession();
    const userId = session.data?.session?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return error ? null : data;
  },

  getUserId() {
    return supabase.auth.getUser().then(res => res.data?.user?.id || null);
  },
};

export default AuthService;
