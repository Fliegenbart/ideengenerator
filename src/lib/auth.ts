export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export async function getCurrentUser(): Promise<AuthUser> {
  return {
    id: "demo-user",
    email: "founder@signalideas.local",
    name: "Demo Founder",
  };
}

export type AuthAdapter = {
  getCurrentUser: () => Promise<AuthUser | null>;
};

export const demoAuthAdapter: AuthAdapter = {
  getCurrentUser,
};
