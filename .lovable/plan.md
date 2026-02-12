

# 📅 Scheduling Platform — Full Product Plan

## Overview
A modern, full-featured team scheduling platform (inspired by Calendly) with a unique, polished design. Users can sign up, set availability, create event types, accept bookings (including paid ones), and receive email notifications.

---

## 1. Marketing Landing Page
- Hero section with headline, subheadline, and CTA to sign up
- Feature highlights section (event types, team scheduling, payments, calendar sync)
- Pricing section
- Footer with links
- Modern, distinctive visual design with smooth animations

## 2. Authentication & User Profiles
- Sign up / Log in pages (email + password, Google OAuth)
- User profile with name, avatar, timezone, and personal booking link (e.g., `/username`)
- Team/organization support — invite members, manage team

## 3. Dashboard
- Overview of upcoming bookings
- Quick stats (bookings this week, pending, completed)
- Quick-access links to create event types and manage availability

## 4. Event Types Management
- Create and manage event types (e.g., "15-min intro call", "60-min consultation")
- Configure per event: duration, title, description, location (Zoom/Google Meet/phone/in-person), color, buffer time between meetings
- Toggle events as active/inactive
- Set pricing per event type (free or paid via Stripe)
- Shareable booking link per event type

## 5. Availability Settings
- Set weekly recurring availability (e.g., Mon–Fri 9am–5pm)
- Override specific dates (e.g., block off holidays)
- Timezone-aware — auto-detect and display in booker's timezone
- Per-event-type availability overrides

## 6. Public Booking Page
- Clean, branded booking page at `/{username}` showing available event types
- Date/time picker showing only available slots
- Booking form: name, email, optional notes
- Timezone selector for the person booking
- Confirmation screen after booking

## 7. Payments (Stripe Integration)
- Stripe integration for paid event types
- Payment collected at time of booking
- Payment status visible in dashboard
- Refund capability for cancelled bookings

## 8. Email Notifications
- Booking confirmation emails (to both host and guest)
- Reminder emails before meetings
- Cancellation/reschedule notification emails
- Powered by a Supabase Edge Function + email service

## 9. Booking Management
- View all upcoming and past bookings
- Cancel or reschedule bookings
- Add notes to bookings
- Filter/search bookings

## 10. Calendar Integration
- Google Calendar sync (read busy times to prevent double-booking, write new bookings as calendar events)
- Visual calendar view in the dashboard

## 11. Backend & Database (Lovable Cloud / Supabase)
- Tables: profiles, teams, event_types, availability, bookings, payments
- Row-level security for all tables
- Edge functions for email sending, Stripe webhooks, calendar sync
- Secure secrets management for API keys

---

## Design Direction
- Modern, unique aesthetic — not a direct copy of Calendly's design
- Clean typography, generous whitespace, subtle animations
- Light/dark mode support
- Fully responsive (mobile-friendly booking pages are critical)

## Build Order
1. Auth + profiles + dashboard shell
2. Event types CRUD
3. Availability settings
4. Public booking page with date/time selection
5. Booking management
6. Stripe payments
7. Email notifications
8. Calendar integration
9. Landing page + polish

