export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  emailVerifiedAt: string | null;
}

export interface AuthDevTokenResponse {
  devToken?: string;
}
