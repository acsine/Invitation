Implementation Plan - InviteManager
This plan outlines the steps to complete the InviteManager project, a SaaS platform for event invitations and badge management.

1. Project Initialization & Styling
 Migrate global styles and Sass helpers from unft-marketplace-main.
 Adapt the template's design system to Next.js 14 App Router.
 Create a root layout with Header and Footer components inspired by the template.
2. Authentication (Module 1)
 Implement NextAuth logic in src/app/api/auth/[...nextauth]/route.js.
 Create Login and Register pages using the template's form components.
 Setup middleware to protect dashboard routes.
3. Subscription & Plans (Module 2)
 Implement Plan management (Super Admin).
 Implement Subscription purchase flow with Stripe.
 Implement manual payment validation logic.
4. Visual Editor for Posters (Module 3)
 Build a Canvas-based editor in src/components/canvas/PosterEditor.jsx.
 Implement image upload to ImageKit.
 Add tools for drawing Rectangles/Circles for Text and Photo zones.
 Implement zone customization (font, size, color).
5. Invitation Sharing & Guest Form (Module 4)
 Implement the public invitation page src/app/invite/[shareCode]/page.jsx.
 Build the guest submission form with real-time preview on the poster.
 Implement image generation for guests (download/share).
6. Guest Management (Module 5)
 Implement the organizer dashboard for managing guests.
 Add filters, search, and CSV export.
7. Badge Management (Module 6)
 Implement the Badge Template editor (similar to the poster editor).
 Implement automatic badge generation for all guests.
 Implement PDF generation for printing multiple badges on A4.
8. Monetization (Module 7)
 Implement the logic for paid invitations.
 Setup Mobile Money payment simulation/integration.
 Implement the 3% commission logic and withdrawal requests.
9. Admin Dashboard
 Create the Super Admin dashboard for monitoring users, plans, and payments.




 git add .
git commit -m "Fix: Update database and production URLs"
git push origin main
DATABASE_URL_PRISMA_DATABASE_URL="postgres://13a46c7d472a546c3b283d15ac929dcb9bfb51a7e8d4f32b33da1f6eca85168e:sk__33OxfPlEEDeHZl4yhhfM@db.prisma.io:5432/postgres?sslmode=require"
DATABASE_URL_POSTGRES_URL="postgres://13a46c7d472a546c3b283d15ac929dcb9bfb51a7e8d4f32b33da1f6eca85168e:sk__33OxfPlEEDeHZl4yhhfM@db.prisma.io:5432/postgres?sslmode=require"
DATABASE_URL_PRISMA_DATABASE_URL="postgres://13a46c7d472a546c3b283d15ac929dcb9bfb51a7e8d4f32b33da1f6eca85168e:sk__33OxfPlEEDeHZl4yhhfM@db.prisma.io:5432/postgres?sslmode=require"