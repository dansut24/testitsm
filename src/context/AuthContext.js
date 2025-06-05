import AuthService from "../services/AuthService";

useEffect(() => {
  const initAuth = async () => {
    const session = await AuthService.getSession();
    const user = session?.data?.session?.user;

    if (user) {
      const profile = await AuthService.getCurrentUserProfile();
      const role = profile?.role || "user";

      setUser({
        id: user.id,
        email: user.email,
        role,
        roles: [role],
        name: profile?.full_name || "",
      });
    } else {
      setUser(null);
    }

    setAuthLoading(false);
  };

  initAuth();

  const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
    if (user) {
      const profile = await AuthService.getCurrentUserProfile();
      const role = profile?.role || "user";

      setUser({
        id: user.id,
        email: user.email,
        role,
        roles: [role],
        name: profile?.full_name || "",
      });
    } else {
      setUser(null);
    }
  });

  return unsubscribe;
}, []);
