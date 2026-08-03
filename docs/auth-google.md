/**
 * Google / email auth setup for NeverMind (ops checklist).
 *
 * Site route after OAuth: https://nevermind.co.il/auth/callback
 * Supabase exchanges the code and the app sets session cookies there.
 *
 * Supabase Dashboard (this project only)
 * 1. Authentication → Providers → Google → enable
 *    Paste Google Cloud OAuth Client ID + Client Secret.
 * 2. Authentication → URL Configuration
 *    Site URL: https://nevermind.co.il
 *    Redirect URLs (Additional):
 *      https://nevermind.co.il/**
 *      http://localhost:3000/**
 *
 * Google Cloud Console
 * - Authorized redirect URI must be Supabase, not the Next.js route:
 *   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
 * - Authorized JavaScript origins (if asked):
 *   https://nevermind.co.il
 *   http://localhost:3000
 *
 * Smoke test
 * 1. Incognito → https://nevermind.co.il/my-list → Google
 * 2. Expect return to /my-list while signed in
 * 3. If something fails, expect /my-list?auth_error=... with visible Hebrew message
 *
 * Do not put https://nevermind.co.il/auth/callback in Google Cloud redirect URIs.
 * That path is only for the app after Supabase finishes.
 */

export {};
