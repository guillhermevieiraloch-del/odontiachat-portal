import { google, type Auth } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

export function createOAuth2Client(): Auth.OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth não configurado: defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REDIRECT_URI no .env",
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthorizationUrl(state: string): string {
  const oauth = createOAuth2Client();
  return oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth = createOAuth2Client();
  const { tokens } = await oauth.getToken(code);
  return tokens;
}

export async function fetchAccountEmail(accessToken: string): Promise<string | null> {
  const oauth = createOAuth2Client();
  oauth.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ version: "v2", auth: oauth });
  const { data } = await oauth2.userinfo.get();
  return data.email ?? null;
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const oauth = createOAuth2Client();
  try {
    await oauth.revokeToken(refreshToken);
  } catch {
    // ignorar — usuário pode ter revogado manualmente na conta Google
  }
}
