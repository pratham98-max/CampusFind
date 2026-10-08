# CampusFind — Enterprise Lost & Found Management Platform

> Built for the Smart India Hackathon / S4I Hackathon Lost & Found Portal Challenge.  
> An automated institutional lost and found system for colleges, schools, and hospitals featuring AI semantic vector matching, courier-style lifecycle tracking, and official Student ID claim verification.

---

## 🏛️ Problem Statement & Architecture

Campus loss of personal belongings (laptops, identity cards, wallets, calculators, water bottles) is traditionally managed through chaotic WhatsApp groups, bulletin boards, and manual paper registers at security desks. This causes low return rates, fraudulent claims, and wasted administrative hours.

**CampusFind** solves this with an institutional multi-tenant platform:
- **Zero-Barrier Public Search**: Students and visitors can browse and search without login barriers.
- **AI-Powered Vector Matching**: High-dimensional semantic embeddings (`vector(384)`) pair items even when described with completely different wording (e.g., *"grey water bottle"* vs. *"steel hydro flask"*).
- **Courier-Style Chain of Custody**: Lifecycle tracking with tamper-evident audit history:
  $$\text{Reported} \longrightarrow \text{Matched} \longrightarrow \text{Verification} \longrightarrow \text{Returned}$$
- **Student ID Claim Verification**: Mandatory verification of institutional enrollment credentials before security releases any item.
- **Dense Operational Command Center**: Real-time event streams, recovery resolution rates, and categorization metrics for campus security desks.

---

## 🛠️ Stack Decisions & Technology Selection

Per the S4I pitch deck specifications, the architecture consolidates into a performant, deployable full-stack application:

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend & API** | **Next.js 14 (App Router, TypeScript)** | Unified full-stack framework; server-side rendering for public search, server actions/route handlers for API, responsive web app covering Stage 2 demo. |
| **Backend & DB** | **Supabase (PostgreSQL + pgvector)** | Native `vector(384)` support for semantic embeddings, Row Level Security, Storage for photos, Realtime for admin dashboard events. |
| **Styling & UI** | **Tailwind CSS + Custom UI Kit** | Strict brand palette: Deep Navy (`#0B1F4D`), Warm Gold (`#F5C542`), neutral grays. Inspired by Airbnb item cards, Linear/Stripe admin dashboard, and courier parcel trackers. |
| **AI Matching** | **Multi-factor Hybrid Scorer** | Hard category gate $\rightarrow$ Cosine similarity of 384-dim embeddings (HuggingFace `all-MiniLM-L6-v2` / Xenova) $\rightarrow$ Date proximity decay $\rightarrow$ Weighted confidence score $0.6 \times \text{embedding} + 0.4 \times \text{date}$. |
| **Notifications** | **Resend + In-App Center** | Transactional email delivery with local in-app fallback preview so the demo can run without email delivery dependencies. |

> **Note on Mobile App**: The Flutter mobile app referenced in early ideation is designated as **Future Scope** (Phase 2). A fully responsive, mobile-optimized web application covers all hackathon evaluation criteria and Stage 2 demo requirements.

---

## 🧠 AI Semantic Matching Engine

The matching engine automatically fires whenever a found item is registered:

1. **Category Hard Gate**: Only candidates within the exact same category are considered. Candidates in mismatched categories are never scored.
2. **Date Proximity Decay**:
   $$\text{DateScore} = \max\left(0, 1 - \frac{|\Delta\text{days}|}{30}\right)$$
3. **Dense Vector Cosine Similarity**:
   Both reports are projected into a 384-dimensional dense semantic vector space (aligned with `all-MiniLM-L6-v2`). Cosine similarity captures semantic intent regardless of phrasing differences:
   $$\cos(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\|_2 \|\vec{v}\|_2}$$
4. **Weighted Confidence Formula**:
   $$\text{Confidence Score} = 0.6 \times \text{EmbeddingScore} + 0.4 \times \text{DateScore}$$
5. **Threshold & Notification**: Candidates with $\text{Confidence} \ge 0.55$ are preserved (top 3 maximum) and logged to `matches` with `status = 'pending'`. A transactional notification is dispatched to the lost item reporter with a direct review link (`/match/[id]`).

---

## 🗄️ Multi-Tenant Database Schema

All tables include `org_id` for multi-institutional tenancy (colleges, schools, hospitals):

- `organizations`: `(id, name, type, categories, created_at)`
- `users`: `(id, org_id, full_name, email, student_id, role, created_at)`
- `lost_items`: `(id, org_id, reporter_id, title, description, category, date_lost, location, photo_url, embedding vector(384), status, created_at)`
- `found_items`: `(id, org_id, reporter_id, title, description, category, date_found, location, photo_url, embedding vector(384), status, created_at)`
- `matches`: `(id, lost_item_id, found_item_id, confidence_score, category_match, keyword_score, date_score, embedding_score, status, created_at, confirmed_at)`
- `claims`: `(id, match_id, claimant_id, student_id_input, verified, verified_by, verified_at)`
- `status_events`: `(id, item_type, item_id, from_status, to_status, actor_id, note, created_at)`
- `notifications`: `(id, user_id, match_id, channel, sent_at, opened_at)`

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- Node.js 18+ (tested on Node v25.9.0)
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/pratham98-max/CampusFind.git
cd CampusFind
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
The application comes pre-configured with a resilient dual-mode data persistence engine (`lib/data/store.ts`), enabling instant offline execution with seed data or live Supabase cloud connection.

### 3. Initialize Seed Data
```bash
node -e "const { runSeed } = require('./scripts/seed.ts'); runSeed();"
```

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎬 Stage 2 Demo Script (Step-by-Step Walkthrough)

Follow this exact sequence to demonstrate all capabilities during your pitch:

1. **Step 1: Public Browsing (No Login Required)**
   - Open `http://localhost:3000`.
   - Filter by category: click **Bottles & Tumblers** or **Electronics**.
   - Notice seeded item: *"Stainless Steel Hydro Flask (32oz)"* lost at *Main Library - 2nd Floor Reading Room*.
   - Proves zero-barrier student access.

2. **Step 2: Report Found Item (Semantic Challenge)**
   - Click **"Report Item"** or **"Report Found Item"**.
   - Fill in deliberately different wording:
     - **Title**: `Grey Water Bottle`
     - **Category**: `Bottles & Tumblers`
     - **Date Found**: Today's date
     - **Location**: `Library Reading Room Desk 14`
     - **Description**: `Grey insulated metal water bottle found under desk with small scratch on bottom.`
   - Click **"Register Found Item"**.

3. **Step 3: AI Matching Engine Execution**
   - The engine automatically executes and evaluates semantic cosine similarity ($\approx 87\%$) and date proximity ($\approx 97\%$).
   - Total confidence exceeds $85\%$.

4. **Step 4: Match Notification Review Link**
   - Click the **Bell Icon** on the navbar or navigate to the generated review link (e.g. `http://localhost:3000/match/match-wallet-01` or the new match link).

5. **Step 5: Side-by-Side Diff Review & Confirmation**
   - The `/match/[id]` page displays the side-by-side diff card:
     - Left: *Your Lost Report*
     - Right: *Recovered Found Item*
     - Top: Detailed gauge breakdown for Category Gate, Embedding Vector, Date Proximity, and Token Overlap.
   - Click **"Confirm Match — This is Mine"**.
   - Status transitions to `matched`.

6. **Step 6: Student ID Verification Claim**
   - Click **"Proceed to Student ID Claim"**.
   - Enter Student ID: `2024BCSE042`.
   - Click **"Submit Claim for Verification"**.
   - The claim enters the security queue. Click **"Verify & Return Item"** (authorized admin/security action).
   - Celebratory confetti triggers and item moves to `Returned`.

7. **Step 7: Courier Status Timeline Inspection**
   - Inspect the item page (`/item/[id]`).
   - Notice all 4 milestones filled: **Reported $\rightarrow$ Matched $\rightarrow$ Verification $\rightarrow$ Returned**.
   - Audit trail below displays the complete chronological event history with actor names, timestamps, and notes.

8. **Step 8: Admin Dashboard & Realtime Live Stream**
   - Navigate to `/admin/dashboard`.
   - Notice the live feed stream updating in real time with the new event without manual page refresh.
   - Metrics cards display updated Resolution Rate, Active Reports, and Category breakdown.

9. **Step 9: Physical Drop-Off Point QR Code**
   - Physical kiosk QR code is pre-generated at [`public/campus-dropoff-qr.png`](public/campus-dropoff-qr.png) linking directly to `/report?type=found` for on-site scanning at security booths.

---

## 📦 Build Checkpoints & Commit Log

| Milestone | Deliverables | Commit Hash |
|---|---|---|
| **0** | Next.js 14 App Router, Tailwind, Supabase project scaffold, env vars | `5b9d8ad` |
| **1** | Database schema (9 migrations) + realistic seed data engine | `4dda827` |
| **2** | Report Lost & Report Found tabbed forms with photo upload | `0be0534` |
| **3** | Public browsing catalog with multi-facet filters (no login required) | `bf626d3` |
| **4** | Hybrid matching engine (vector embedding + date proximity) | `2a20eb0` |
| **5** | Match notification email handler + side-by-side diff review page | `a525bfa` |
| **6** | Student ID claim verification flow | `f46f539` |
| **7** | Courier-style status timeline on item detail page | `c391628` |
| **8** | Admin dashboard: live feed (Realtime) + analytics metrics | `85cf08d` |
| **9** | Full UI polish pass: empty states, responsive navigation, error guards | `b236244` |
| **10** | README, drop-off QR code asset, and demo prep | Pending push |

---

## 🔒 Security & Privacy Measures

- **Row Level Security (RLS)**: Enforced across all Supabase tables.
- **Privacy Masking**: Private student contact details are kept secure until ownership is verified.
- **Multi-Tenant Scoping**: All queries are strictly scoped by `org_id` to prevent cross-institution data leakage.
- **Tamper-Evident Audit Trail**: Status changes are append-only rows in `status_events`.

---

© 2026 CampusFind. Created for the Smart India Hackathon.
