# Nimraproperties

Create the Nimra Properties full-stack real estate web application following the Technical Architecture & Database Specification and visual reference guide.

Include both access experiences:
1. Public Portal:
- Homepage with search bar (Location, Buy/Rent/Lease, Property Type, Budget), "Want to list your property?" highlight banner with 4 value pillars, featured "Properties in Pune" grid with category tabs, quick interest badge, and direct WhatsApp / phone contact.
- Properties Discovery & Search (/properties) with left sidebar filters (Location search, Buy/Rent/Lease toggle, Property Category checkboxes, Property Type checkboxes, BHK, Budget min/max slider/inputs, Area sq.ft.), view switchers (Grid / Map), sorting, and property cards showing price in Lakhs/Cr, configuration, carpet area, locality, and interest count.
- Property Detail View (/properties/:slug) matching the screenshot: multi-photo gallery with thumbnail grid and counter, "I'm Interested" lead capture card, "Ask an Enquiry" and "Schedule a Visit" modal actions, property key features, specifications table, description, and nearby landmarks.
- "List Your Property" Seller Submission Flow (/list-property): multi-step wizard (1. Property Details, 2. Location & Area with interactive pin-on-map / manual address, 3. Pricing, 4. Photos upload, 5. Owner Details, 6. Packages selection, 7. Review & Submit), side support cards with contact information and "How it works" steps.
- About and Contact pages with branding, phone (+91 9763344377, +91 9881666837), WhatsApp, and email (nimra.properties09@gmail.com).

2. Admin Application:
- Admin Login (/admin/login) matching the attached login design with branded left hero panel, email/password form, "Keep me signed in", and private area badge.
- Admin Dashboard (/admin/dashboard) with top metric cards (Total Properties, Published, Draft/Pending, Seller Applications, Enquiries, Buyer Interests, Site Visit Requests, Photo Shoot Requests), date range filter, Recent Seller Applications table, Recent Enquiries table, Property Overview donut breakdown, Leads Overview chart, Top Property Types, and Upcoming Site Visits with direct action buttons (Confirm, Reschedule, Mark Completed, Cancel).
- Properties Management (/admin/properties) with full table view, status filters (Draft, Published, Sold, Rented, Archived), Excel export, and the multi-step "Add New Property" wizard (/admin/properties/new) exactly as designed (Basic Details, Location & Area, Pricing, Photos & Media, Amenities & Features, Additional Details, Review & Publish) with automatic source_type = 'manual_entry'.
- Seller Applications (/admin/applications) with conversion workflow into published properties, package snapshots, and review status management.
- Enquiries & Interests (/admin/enquiries) tracking general enquiries and buyer interests with status updates and notes.
- Site Visits (/admin/site-visits) with separated requested vs confirmed dates/times.
- Photo Shoot Requests (/admin/photo-shoots) with configurable charges and payment statuses.
- Payments Tracking (/admin/payments) for manual external payment verification and logging.
- Listing Packages (/admin/packages) for configuring package tiers and pricing.
- Activity Logs (/admin/activity-logs) and Business Settings (/admin/settings).

Design & Brand Specs:
- Font: IBM Plex Sans with clean typography.
- Brand Colors: Deep forest green (#0D3B2E / #083326), warm cream/sand background accents (#FBF8F3 / #F5F1E9), gold/champagne badge accents (#D4AF37 / #C5A059).
- Use the official Nimra Properties logo provided in uploads/eabf7595-e9d1-4c70-95e2-dd1af28c5542 in both the public navigation header and admin sidebar/login.
- Full responsive design matching desktop and mobile viewports from the attached reference screenshots.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nimraproperties.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c557cee9-b875-46a5-8501-0e74a96f8cf5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
