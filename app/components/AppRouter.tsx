'use client';

/**
 * NOTE: This is a stub component for Next.js migration.
 *
 * In Vite, routing was handled by React Router in this file.
 * In Next.js, routing is handled by the file-based App Router in the app/ directory.
 *
 * TODO (Phase 4 - Manual Conversion Required):
 * - Convert Vite app/main.tsx <AppRouter /> to Next.js layout wiring
 * - Route mapping:
 *   - /login → app/login/page.tsx (already exists)
 *   - /register → app/register/page.tsx (already exists)
 *   - /dashboard → app/dashboard/page.tsx (already exists)
 *   - /join/:token → app/join/[token]/page.tsx (already exists)
 *   - / → redirects based on auth status
 *
 * All page.tsx files already exist. This component is no longer needed.
 */

// This file is kept for reference during migration
// Remove after all routing has been migrated to Next.js App Router

export const AppRouter = () => {
  console.warn('AppRouter component should not be used in Next.js. Use App Router routing instead.');
  return null;
};

export default AppRouter;
