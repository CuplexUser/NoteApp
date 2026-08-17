import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchMe, loginUser, logoutUser, registerUser } from "../api/auth";
import {
  updateName as updateNameApi,
  changePassword as changePasswordApi,
  uploadAvatar as uploadAvatarApi,
  deleteAvatar as deleteAvatarApi,
} from "../api/users";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const loggedInUser = await loginUser({ email, password });
    setUser(loggedInUser);
  }

  async function register(email: string, password: string, name: string) {
    const newUser = await registerUser({ email, password, name });
    setUser(newUser);
  }

  async function logout() {
    await logoutUser();
    setUser(null);
  }

  async function updateName(name: string) {
    const updated = await updateNameApi(name);
    setUser(updated);
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await changePasswordApi(currentPassword, newPassword);
  }

  async function uploadAvatar(file: File) {
    const updated = await uploadAvatarApi(file);
    setUser(updated);
  }

  async function deleteAvatar() {
    const updated = await deleteAvatarApi();
    setUser(updated);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateName,
        changePassword,
        uploadAvatar,
        deleteAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
