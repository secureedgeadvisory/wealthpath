// ─── Mock Auth for Development ───
// Simulates an always-authenticated user
// Swap for real Supabase auth later

import { MOCK_USER } from "./mock-data";

export function getMockUser() {
  return MOCK_USER;
}

export function isAuthenticated() {
  return true;
}
