// src/common/services/AuthService.js

import { supabase } from "../utils/supabaseClient";

const AuthService = {
  signIn: ({ email, password }) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getUser: () => supabase.auth.getUser(),

  signUp: ({ email, password }) =>
    supabase.auth.signUp({ email, password }),

  refreshSession: () => supabase.auth.refreshSession(),
};

export default AuthService;
