# Project Proposal: WeekendWanderer

## One-Line Description
An AI-powered weekend trip planner for foreigners studying or working in Europe who want curated, budget-friendly travel itineraries without the chaos of searching across a dozen different sites.

## The Problem
When you're a foreign student or worker living in a European city, weekend travel is one of the best parts of the experience — but actually planning a trip is a mess. Train tickets live on one site, hostels on another, and if you're not familiar with the European booking ecosystem (ÖBB, RailJet, Hostelworld vs. Booking.com), it's hard to know which sites to trust or where to even start. There's no central place to go from "I have this weekend free" to "here's my plan." This is a problem the builder lived personally while working in Vienna.

## Target User
A foreign student or young professional on a work/internship program in a European city — typically American or from outside Europe — who wants to explore on weekends but has no baseline knowledge of European rail or hostel booking. They have a rough budget in mind and a weekend free, but don't know where to go or where to look.

## Core Features (v1)
1. **Trip generation**: User inputs their current city, available dates, and rough budget — AI returns 3–4 curated weekend trip options.
2. **Itinerary cards**: Each option shows the destination, estimated total cost (train + hostel range), a short description of what makes it worth visiting, and what to expect.
3. **Booking links**: Each itinerary card links out to Omio (trains) and Booking.com or Hostelworld (hostels) with pre-filled search parameters where possible.
4. **Saved trips**: Authenticated users can save itineraries to their profile and return to them later.
5. **Saved trips dashboard**: A personal page where users can view, revisit, and manage their saved trip ideas.

## Tech Stack
- **Frontend**: Next.js — already familiar with it, and it handles both the UI and API routes cleanly
- **Styling**: Tailwind — fast, consistent, already comfortable
- **Database**: Supabase — for storing saved trips and user data
- **Auth**: Clerk — for user login/signup; necessary since users save trips across sessions
- **APIs**:
  - Anthropic API (Claude) — core AI engine for generating trip itineraries
  - Booking.com Affiliate API — for hostel search links and data
  - Rome2Rio API (read-only, free tier) — for routing and estimated travel times between cities
- **Deployment**: Vercel
- **MCP Servers**:
  - Supabase MCP — for database schema management and querying during development
  - Potentially a web search MCP — to give Claude access to current travel context when generating itineraries

## Stretch Goals
- **Shareable itineraries**: Users can share a saved trip as a public link — useful for recommending trips to friends in the same program
- **Community notes**: After returning from a trip, users can leave a short note on a saved itinerary ("trains were sold out, took FlixBus instead — just as good") that others can see
- **Social layer**: See what other foreign students at your city/university have saved or taken — turns the tool into a network effect product
- **Personalization**: Ask upfront about travel style (city vs. nature, nightlife vs. culture, solo vs. group) and tailor itinerary suggestions accordingly
- **Budget tracker**: Compare estimated vs. actual trip cost after the fact
- **Multi-city starting points**: Expand to suggest connecting trips (e.g., Vienna → Prague → Berlin over a long weekend)

## Biggest Risk
The app could feel like a thin wrapper around ChatGPT if the itineraries aren't meaningfully better than just asking an AI directly. The real product value lives in the UX specificity (designed for budget travelers who are new to Europe), the pre-populated booking links, the saved trips layer, and eventually the community features. Price estimates will be AI-generated approximations, not real-time data — this needs to be clearly communicated to users so expectations are set correctly. The other risk: constructing useful deep links to Omio and Booking.com with pre-filled search parameters requires digging into their URL structures, which may be less clean than expected.

## Week 5 Goal
A working web app where a user can enter their current European city, available weekend dates, and a rough budget — and receive 3–4 AI-generated weekend trip itineraries, each with a destination, estimated cost range, brief description, and links to book trains and hostels. Users can log in, save trips to their profile, and view a personal dashboard of saved trips.
