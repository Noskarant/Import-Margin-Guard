# Import Margin Guard — Product + Technical Blueprint (Implementation Ready)

## 1. EXECUTIVE PRODUCT SUMMARY

**What the app is**  
Import Margin Guard is a focused B2B SaaS web application that helps importers compare sourcing/import scenarios, estimate landed cost, and understand margin impact before committing purchase decisions.

**Exact target user**  
Primary users are Heads of Purchasing, Supply Chain Managers, Import/Export Managers, and Finance/Controlling leaders in SMEs and mid-market importers (starting in France, then the USA).

**Exact problem solved**  
Import decisions are often made with spreadsheet-based assumptions spread across teams, causing inconsistent calculations, slower decisions, and hidden margin erosion.

**Commercial angle**  
Sell as a lightweight, low-friction decision layer that complements ERP/accounting tools: “faster decision quality, lower margin leakage, better internal alignment.”

**Why this can work for SMEs/mid-market**
- Clear ROI from avoided bad purchase decisions.
- Faster than building/maintaining internal spreadsheet frameworks.
- Lower complexity and faster adoption than enterprise trade suites.
- Immediately useful with CSV/XLSX imports (no integration dependency for MVP).

---

## 2. PRODUCT POSITIONING

### What the product is
- A **scenario comparison and landed cost estimation tool**.
- A **decision support workspace** for import-related sourcing choices.
- A **professional reporting tool** (PDF summary) for internal decision alignment.

### What it is not
- Not ERP, not TMS, not customs automation platform.
- Not accounting/bookkeeping software.
- Not an enterprise procurement suite.

### Core value proposition
“Compare import scenarios quickly, estimate total landed cost, and protect margin before making sourcing decisions.”

### Key differentiators
**Vs spreadsheets**
- Structured scenario model, standardized formulas, traceable assumptions.
- Faster collaboration and cleaner output (professional PDF).

**Vs ERP usage**
- ERP systems are transaction systems; this is a pre-decision simulation layer.
- Lower setup friction for scenario iteration.

**Vs accountant/compliance support**
- Not replacing experts; instead accelerating early-stage decision modeling.
- Provides transparent estimates before engaging deeper compliance/accounting workflows.

**Vs enterprise trade tools**
- Easier onboarding, lower price point, less implementation overhead.
- Prioritizes practical “80/20” scenario comparisons over broad enterprise feature depth.

---

## 3. ICP (IDEAL CUSTOMER PROFILE)

### Best company profiles
- Import-heavy SMEs/mid-market businesses with recurring international purchase cycles.
- Companies with 5–200 import SKUs managed per period and frequent supplier/country comparisons.

### Best industries to start with
- Consumer goods / retail importers.
- Home goods / furniture.
- Light industrial components.
- Food/non-perishable packaged products (excluding heavily regulated complexity in MVP messaging).

### Company size
- 20–500 employees.
- €5M–€150M annual revenue (or equivalent USD for US market).

### Operational maturity
- Uses spreadsheets + ERP/accounting basics.
- Has recurring sourcing decisions but no dedicated trade analytics platform.

### Countries
- First: France.
- Second: USA.

### Best buyer personas
- Economic buyer: COO / GM / CFO.
- Functional buyer: Head of Purchasing / Supply Chain.
- Power user: Import/Export manager or purchasing analyst.

### Best internal champion
- Cross-functional operator responsible for “cost-to-serve” and purchase decision quality.

### Buying triggers
- Margin compression.
- Supplier diversification projects.
- Freight volatility.
- New country sourcing exploration.
- Internal conflicts caused by inconsistent spreadsheet assumptions.

### Red flags / bad fit
- Wants full customs compliance automation now.
- Requires deep ERP/TMS integration before first use.
- Very low import volume / rare import decisions.
- Expects AI autopilot decisions without transparent assumptions.

---

## 4. MVP SCOPE

### Included in v1 MVP
- Multi-tenant auth + organization workspace.
- CSV/XLSX upload.
- Column mapping UI.
- Row preview + validation flags.
- Scenario creation (2–3 scenarios per analysis baseline).
- Landed cost calculations with explicit assumptions.
- Comparison view (best/worst + deltas).
- Optional gross margin estimate when sales price exists.
- Save/reopen analyses.
- PDF export with branded professional summary.
- Basic subscription paywall (Stripe) for usage limits and exports.

### Excluded from v1 MVP
- ERP/TMS connectors.
- Automated customs classification/tariff intelligence.
- Workflow approvals/chains.
- Forecasting and advanced planning.
- AI recommendations or autonomous decisioning.
- Deep BI dashboarding.
- Multi-currency hedging intelligence.

### Justification for exclusions
- Keeps delivery risk low and speed high.
- Protects clear positioning as decision support tool.
- Avoids long-tail edge cases that dilute PMF learning.

---

## 5. CORE USER JOURNEYS

### A) Sign up / organization creation
**Happy path**
1. User signs up (email magic link or password).
2. Creates organization (name, country, default currency, logo optional).
3. User becomes org owner.
4. Lands on dashboard with CTA: “Create first analysis.”

**Failure points**
- Email verification delay/failure.
- Organization slug/name conflict.
- Weak onboarding completion (drop-off).

### B) Upload import file
**Happy path**
1. User selects CSV/XLSX.
2. System parses file and validates structure.
3. User sees sheet picker (for XLSX) and preview.

**Failure points**
- Unsupported encoding/format.
- File too large for plan limit.
- Missing required data columns.

### C) Map columns
**Happy path**
1. App suggests mappings based on header similarity.
2. User confirms required field mappings.
3. Validation summary appears (valid rows / warnings / errors).
4. User proceeds with import.

**Failure points**
- Required fields unmapped.
- Value-type mismatch (text in numeric fields).
- Currency or incoterm values unrecognized.

### D) Create scenarios
**Happy path**
1. User duplicates baseline scenario.
2. Changes supplier/country/incoterm/transport/duty assumptions.
3. Adds 2–3 scenarios.
4. Saves analysis version.

**Failure points**
- Incomplete scenario inputs.
- Invalid percentages or negative values.

### E) Compare scenarios
**Happy path**
1. App computes totals per scenario.
2. User sees ranked scenarios by landed cost/unit and optional margin.
3. Delta table highlights material differences.
4. User selects “recommended scenario” manually.

**Failure points**
- Missing required values for computation.
- Misinterpretation risk if estimates look too precise.

### F) Export PDF
**Happy path**
1. User opens export panel.
2. Chooses language, branding options, included sections.
3. Generates PDF.
4. Downloads and shares.

**Failure points**
- Export timeout.
- Missing scenario results due to validation errors.

### G) Save and reopen analysis
**Happy path**
1. User saves analysis with title and labels.
2. Analysis appears in saved analyses list.
3. User reopens and edits scenarios.

**Failure points**
- Permission denied for non-member.
- Version confusion without timestamps.

### H) Upgrade to paid plan
**Happy path**
1. User hits free-tier limit.
2. Sees premium modal with concrete value.
3. Starts Stripe Checkout.
4. Webhook confirms subscription.
5. Plan entitlements unlocked.

**Failure points**
- Checkout cancel/failure.
- Webhook sync delay causing temporary access mismatch.

---

## 6. USER STORIES

### Authentication
1. **As a user, I want to sign up quickly so I can start a first analysis in minutes.**
   - Acceptance:
     - Can sign up with email.
     - Receives verification and can access workspace after verify.
     - Redirected to onboarding.
2. **As a user, I want to reset my password so I can recover access.**
   - Acceptance:
     - Reset email sent.
     - Password update invalidates old sessions.

### Organization/workspace
1. **As an owner, I want to create an organization so my team’s analyses are shared.**
   - Acceptance: org created with owner role.
2. **As an owner/admin, I want to invite members so colleagues can collaborate.**
   - Acceptance: invite email + role assignment.

### File import
1. **As a user, I want to upload CSV/XLSX files so I can avoid manual data entry.**
   - Acceptance: supports .csv/.xlsx under defined size.
2. **As a user, I want upload validation feedback so I can fix issues before calculating.**
   - Acceptance: clear row-level error report.

### Mapping
1. **As a user, I want automatic mapping suggestions so setup is faster.**
   - Acceptance: header matching confidence shown.
2. **As a user, I want to save mapping templates so future uploads are faster.**
   - Acceptance: template scoped per organization.
   - Note: can be MVP-lite (single template) or post-MVP if timeline tight.

### Scenario management
1. **As a user, I want to duplicate and edit scenarios so I can compare alternatives quickly.**
   - Acceptance: clone scenario and edit key assumptions.
2. **As a user, I want scenario naming/notes so results are understandable.**
   - Acceptance: name required, note optional.

### Calculation engine
1. **As a user, I want transparent formulas so I trust the outputs.**
   - Acceptance: every output has formula tooltip.
2. **As a user, I want recalculation on input change so I can iterate quickly.**
   - Acceptance: recalculation < 1 second for typical dataset size.

### Result visualization
1. **As a user, I want side-by-side scenario comparison so I can identify best option fast.**
   - Acceptance: delta columns and ranked order.
2. **As a user, I want best/worst highlighting so decision meetings are faster.**
   - Acceptance: visual badges + ranking explanation.

### PDF export
1. **As a user, I want a professional summary PDF so I can share decisions with leadership.**
   - Acceptance: includes assumptions, outputs, and recommendation framing.

### Saved analyses
1. **As a user, I want to save analyses so I can reopen and update later.**
   - Acceptance: persisted list with last updated timestamp.

### Billing/subscription
1. **As an owner, I want to upgrade plan so team limits are removed.**
   - Acceptance: Stripe checkout + entitlement update.
2. **As an owner, I want billing history visibility so finance can track subscriptions.**
   - Acceptance: invoices link and plan status in account billing page.

### Admin/system
1. **As system admin, I want audit logs for key actions so support can resolve issues.**
   - Acceptance: records login, import created, analysis deleted, subscription changes.

---

## 7. INFORMATION ARCHITECTURE

### Top-level navigation (authenticated)
- Dashboard
- New Analysis
- Saved Analyses
- Imports
- Settings
- Billing (owner/admin only)

### Pages/screens with purpose/actions/data
1. **Dashboard**
   - Purpose: quick entry + recent activity.
   - Primary: create analysis.
   - Secondary: reopen recent analysis.
   - Data: recent analyses, usage meter, plan status.

2. **Upload**
   - Purpose: ingest source file.
   - Primary: upload file.
   - Secondary: download sample template.
   - Data: file metadata + parse preview.

3. **Column Mapping**
   - Purpose: map input schema.
   - Primary: confirm mappings.
   - Secondary: save mapping template.
   - Data: source columns, target fields, confidence, validation summary.

4. **Analysis Builder**
   - Purpose: create/edit scenarios and assumptions.
   - Primary: add scenario.
   - Secondary: duplicate scenario, save analysis.
   - Data: scenario cards, editable assumptions.

5. **Scenario Comparison**
   - Purpose: compare outputs.
   - Primary: mark recommendation, export.
   - Secondary: sort/filter metrics.
   - Data: totals, per-unit metrics, deltas, best/worst.

6. **PDF Export Panel**
   - Purpose: configure output.
   - Primary: generate PDF.
   - Secondary: preview sections.
   - Data: branding settings, language, included sections.

7. **Saved Analyses**
   - Purpose: find/reopen prior work.
   - Primary: open analysis.
   - Secondary: duplicate/delete/archive.
   - Data: title, owner, updated date, status, labels.

8. **Account/Billing**
   - Purpose: manage subscription and invoices.
   - Primary: upgrade/change plan.
   - Secondary: cancel/reactivate.
   - Data: plan, seats/limits, renewal date, invoice links.

9. **Organization Settings**
   - Purpose: org profile and membership.
   - Primary: update branding/invite members.
   - Secondary: manage roles.
   - Data: org info, logo, default currency, members list.

---

## 8. PAGE-BY-PAGE SPECIFICATION

### 8.1 Landing Page
- **Purpose:** Convert visitors into trial/signup.
- **Main components:** hero, value bullets, product shots, pricing teaser, CTA, FAQ.
- **Key fields:** email capture optional.
- **States:** logged out/logged in.
- **Empty:** n/a.
- **Error:** signup CTA failure banner.
- **Loading:** skeleton on pricing/testimonials if async.
- **Primary CTA:** “Start free trial”.
- **Success behavior:** redirect to signup.

### 8.2 Sign In / Sign Up
- **Purpose:** Authenticate users.
- **Components:** sign in form, sign up form, magic-link option, forgot password.
- **Fields:** email, password.
- **States:** verify pending, authenticated.
- **Errors:** invalid credentials, unverified email.
- **Loading:** button spinner.
- **Primary CTA:** “Create account”.
- **Success:** onboarding redirect.

### 8.3 Onboarding / Organization Setup
- **Purpose:** Create initial workspace.
- **Components:** org form, optional logo upload, locale/currency defaults.
- **Fields:** org name, country, default currency, timezone.
- **States:** first org, invited user join flow.
- **Errors:** org name already exists.
- **Primary CTA:** “Create organization”.
- **Success:** dashboard + first analysis prompt.

### 8.4 Upload Page
- **Purpose:** Ingest source dataset.
- **Components:** dropzone, supported format help, sample file link, parse preview table.
- **Fields:** file, sheet selector (xlsx), delimiter (advanced optional).
- **States:** initial, parsing, parsed, failed.
- **Empty:** callout “Upload your first import file”.
- **Errors:** invalid file type, row limit exceeded.
- **Loading:** parse progress.
- **Primary CTA:** “Continue to mapping”.
- **Success:** navigate mapping page.

### 8.5 Column Mapping Page
- **Purpose:** Map source columns to required schema.
- **Components:** two-column mapping UI, validation panel, sample row preview.
- **Fields:** each target field mapped to source column.
- **States:** auto-mapped, manual corrections.
- **Empty:** no source columns found.
- **Errors:** missing required mapping, invalid data type.
- **Loading:** mapping suggestion computation.
- **Primary CTA:** “Validate and import rows”.
- **Success:** import created, proceed to analysis builder.

### 8.6 Analysis Builder Page
- **Purpose:** Build scenarios and edit assumptions.
- **Components:** base dataset selector, scenario list, assumption editor panel.
- **Fields:** scenario name; supplier, country, incoterm, transport cost, duty rate, ancillary fees, currency conversion rate override, optional sales price.
- **States:** draft, unsaved changes, saved.
- **Empty:** no scenarios yet.
- **Errors:** invalid percentage, required field missing.
- **Loading:** scenario compute spinner.
- **Primary CTA:** “Compare scenarios”.
- **Success:** navigates to comparison with computed results.

### 8.7 Scenario Comparison Page
- **Purpose:** Present decision table and ranking.
- **Components:** summary cards, comparison table, delta heatmap, recommendation notes.
- **Fields:** metric selection (landed total/unit/margin).
- **States:** with or without margin metrics.
- **Empty:** scenarios incomplete.
- **Errors:** compute mismatch due to invalid rows.
- **Loading:** recompute state when inputs change.
- **Primary CTA:** “Export summary PDF”.
- **Success:** opens export panel.

### 8.8 PDF/Export Panel
- **Purpose:** Configure and generate PDF.
- **Components:** section toggles, language toggle FR/EN, branding preview.
- **Fields:** title, subtitle, include assumptions, include comments, recommendation text.
- **States:** generating, ready, failed.
- **Empty:** unavailable if no scenario results.
- **Errors:** generation timeout.
- **Loading:** progress state.
- **Primary CTA:** “Generate PDF”.
- **Success:** downloadable file + export history entry.

### 8.9 Saved Analyses Page
- **Purpose:** Manage analysis library.
- **Components:** table/list with filters, search, status tags.
- **Fields:** filter by creator/date/label.
- **States:** results, filtered empty.
- **Errors:** fetch failed.
- **Loading:** list skeleton.
- **Primary CTA:** “New analysis”.
- **Success:** selected analysis opens in builder.

### 8.10 Account / Billing Page
- **Purpose:** Subscription and payment controls.
- **Components:** plan card, usage stats, invoices table, checkout/manage billing buttons.
- **Fields:** plan selector.
- **States:** trial, active, past_due, canceled.
- **Errors:** portal access failure.
- **Loading:** billing status refresh.
- **Primary CTA:** “Upgrade plan”.
- **Success:** entitlements updated after webhook.

### 8.11 Organization Settings Page
- **Purpose:** Manage workspace configuration.
- **Components:** org profile form, branding, members, invites, role controls.
- **Fields:** logo, company name, default currency/language.
- **States:** normal, invite pending.
- **Errors:** unauthorized role change.
- **Loading:** settings fetch.
- **Primary CTA:** “Save settings”.
- **Success:** toast + persisted changes.

---

## 9. CALCULATION ENGINE SPECIFICATION

### Core formulas (MVP)
For each row *r* in scenario *s*:
- `purchase_cost_r = unit_purchase_price_r * quantity_r`
- `transport_cost_r = estimated_transport_cost_r` (or scenario override model)
- `duty_base_r = purchase_cost_r + transport_cost_r` (simplified assumption)
- `duty_cost_r = duty_base_r * duty_rate_r`
- `ancillary_cost_r = estimated_ancillary_fees_r`
- `landed_total_r = purchase_cost_r + transport_cost_r + duty_cost_r + ancillary_cost_r`
- `landed_unit_r = landed_total_r / quantity_r`

Scenario totals:
- `scenario_landed_total = SUM(landed_total_r)`
- `scenario_quantity_total = SUM(quantity_r)`
- `scenario_landed_unit_weighted = scenario_landed_total / scenario_quantity_total`

Optional margin:
- If `sales_price_r` exists: `gross_margin_unit_r = sales_price_r - landed_unit_r`
- `gross_margin_pct_r = gross_margin_unit_r / sales_price_r`
- Scenario weighted margin from aggregated revenue and landed totals.

### Assumptions
- Duty rate is user-provided estimate, not authoritative legal duty.
- Transport and ancillary inputs are estimates.
- Currency conversion uses provided rate/date snapshot (no live FX in MVP by default).

### Editable inputs
- Duty rate, transport, ancillary, incoterm, optional sales price, conversion rate override.

### Scenario comparison logic
- Rank by selected KPI (default: lowest landed_unit_weighted).
- Compute deltas vs baseline and vs best scenario.
- Highlight best/worst with confidence note (“estimate quality depends on input quality”).

### Margin logic
- Margin section appears only if at least X% rows have sales price (recommend 80% threshold, configurable).
- Rows missing sales price excluded from margin aggregates with transparent note.

### Presenting uncertainty
- Add confidence badges per scenario:
  - High: all required fields + low missing optional.
  - Medium: minor gaps.
  - Low: significant missing/overridden estimates.
- Show “estimate” label on all computed financial outputs.

### Avoid black-box feel
- Formula tooltip on every major metric.
- Assumption panel visible alongside results.
- “What changed” diff between scenarios.

### Deterministic vs estimate
- Deterministic: arithmetic results from provided inputs.
- Estimates: any inputs manually estimated (transport, duty rate, ancillary, FX).

---

## 10. DATA MODEL / DATABASE SCHEMA (SUPABASE POSTGRES)

### Core tables

#### `profiles`
- `id uuid pk` (matches auth.users.id)
- `full_name text`
- `created_at timestamptz default now()`

#### `organizations`
- `id uuid pk`
- `name text not null`
- `slug text unique`
- `country_code text`
- `default_currency text`
- `default_locale text default 'fr-FR'`
- `logo_path text`
- `created_by uuid references auth.users(id)`
- `created_at timestamptz`
- Indexes: `slug unique`, `created_by`

#### `organization_members`
- `id uuid pk`
- `organization_id uuid fk organizations`
- `user_id uuid fk auth.users`
- `role text check in ('owner','admin','member','viewer')`
- `status text check in ('active','invited','disabled')`
- `invited_by uuid`
- `created_at timestamptz`
- Unique: `(organization_id, user_id)`
- Indexes: `(organization_id, role)`

#### `imports`
- `id uuid pk`
- `organization_id uuid fk`
- `uploaded_by uuid`
- `file_name text`
- `file_path text` (Supabase Storage path)
- `file_type text`
- `file_size_bytes bigint`
- `source_sheet text null`
- `status text check in ('uploaded','mapped','processed','failed')`
- `raw_header jsonb`
- `created_at timestamptz`
- Indexes: `(organization_id, created_at desc)`

#### `import_rows`
- `id uuid pk`
- `import_id uuid fk imports on delete cascade`
- `row_index int`
- `raw_data jsonb`
- `normalized_data jsonb`
- `validation_status text check in ('valid','warning','error')`
- `validation_errors jsonb`
- `created_at timestamptz`
- Unique: `(import_id, row_index)`
- Indexes: `(import_id, validation_status)`

#### `analyses`
- `id uuid pk`
- `organization_id uuid fk`
- `import_id uuid fk imports`
- `title text`
- `description text`
- `status text check in ('draft','finalized','archived')`
- `created_by uuid`
- `updated_by uuid`
- `created_at timestamptz`
- `updated_at timestamptz`
- Indexes: `(organization_id, updated_at desc)`, `(import_id)`

#### `scenarios`
- `id uuid pk`
- `analysis_id uuid fk analyses on delete cascade`
- `name text not null`
- `description text`
- `is_baseline boolean default false`
- `rank_order int`
- `assumption_overrides jsonb`
- `created_by uuid`
- `created_at timestamptz`
- Indexes: `(analysis_id, rank_order)`

#### `scenario_inputs`
- `id uuid pk`
- `scenario_id uuid fk scenarios on delete cascade`
- `import_row_id uuid fk import_rows`
- `unit_purchase_price numeric(14,4)`
- `quantity numeric(14,4)`
- `currency text`
- `transport_cost numeric(14,4)`
- `duty_rate numeric(7,4)`
- `incoterm text`
- `ancillary_fees numeric(14,4)`
- `sales_price numeric(14,4) null`
- `target_margin numeric(7,4) null`
- `weight numeric(14,4) null`
- `volume numeric(14,4) null`
- `transport_mode text null`
- `comments text null`
- `product_category text null`
- `project_label text null`
- Unique: `(scenario_id, import_row_id)`
- Indexes: `(scenario_id)`

#### `scenario_results`
- `id uuid pk`
- `scenario_id uuid fk scenarios on delete cascade`
- `computed_at timestamptz`
- `result_summary jsonb` (totals + deltas + confidence)
- `row_results jsonb` (optional MVP, can be deferred if heavy)
- Indexes: `(scenario_id, computed_at desc)`

#### `exports`
- `id uuid pk`
- `organization_id uuid fk`
- `analysis_id uuid fk`
- `scenario_ids uuid[]`
- `format text check in ('pdf')`
- `file_path text`
- `language text`
- `created_by uuid`
- `created_at timestamptz`

#### `subscriptions`
- `id uuid pk`
- `organization_id uuid unique fk`
- `stripe_customer_id text unique`
- `stripe_subscription_id text unique`
- `plan_code text`
- `status text`
- `current_period_end timestamptz`
- `cancel_at_period_end boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `billing_events`
- `id uuid pk`
- `organization_id uuid fk`
- `stripe_event_id text unique`
- `event_type text`
- `payload jsonb`
- `processed_at timestamptz`
- `created_at timestamptz`

#### `activity_logs` (recommended)
- `id uuid pk`
- `organization_id uuid fk`
- `actor_user_id uuid`
- `entity_type text`
- `entity_id uuid`
- `action text`
- `metadata jsonb`
- `created_at timestamptz`
- Indexes: `(organization_id, created_at desc)`

### Core vs optional
- **Core now:** organizations, members, imports, import_rows, analyses, scenarios, scenario_inputs, scenario_results, subscriptions, billing_events.
- **Optional now / can add later:** exports metadata depth, activity_logs granularity, mapping_templates table.

### RLS intent
- Tenant isolation via `organization_id` membership checks.
- Only active members can read org data.
- Role-based restrictions for destructive/billing actions.

---

## 11. AUTHORIZATION / PERMISSIONS MODEL

### Roles
- **owner:** full rights incl. billing, org deletion, role management.
- **admin:** manage members (except owner transfer), analyses/imports, branding.
- **member:** create/edit analyses/imports, export PDF, cannot billing.
- **viewer (optional MVP):** read-only analyses/results/exports.

### Key permissions
- View analyses: all active members (+viewer).
- Edit analyses/scenarios: owner/admin/member.
- Delete analyses: owner/admin; members only own-created optional policy.
- Manage billing: owner (admin optional if needed).
- Manage organization branding/settings: owner/admin.

### RLS protections
- Every table with `organization_id` checks membership via `organization_members`.
- For `scenario_*` tables, enforce access through parent `analysis -> organization` join.
- Billing tables readable by owner/admin only.

---

## 12. FILE IMPORT SYSTEM DESIGN

### Supported formats
- `.csv` UTF-8 (preferred)
- `.xlsx` first sheet default + selectable sheet

### Validation strategy
1. File-level validation (size/type/encoding).
2. Header-level validation (required fields presence after mapping).
3. Row-level validation (type ranges and business constraints).

### Column mapping behavior
- Auto-suggest mapping via normalized header matching dictionary (FR/EN synonyms).
- User confirmation required before processing.
- Required fields must be mapped.

### Duplicate handling
- Detect duplicates by composite key candidate (SKU + supplier + unit_price + quantity).
- Do not auto-delete duplicates in MVP; flag and let user decide (keep all / skip flagged).

### Row validation
- Numeric checks for prices/qty/rates.
- Allowed incoterm list (basic set e.g., EXW, FOB, CIF, DDP, FCA).
- Country code normalization.

### User correction flow
- Inline row editor for invalid rows (MVP-lite: downloadable error CSV + reupload).

### Error reporting
- Summary counters + downloadable error report with row index and reason.

### Storage strategy
- Raw source file in Supabase Storage.
- Raw row JSON retained for audit.
- Normalized fields stored for calculation.

---

## 13. PDF EXPORT SPECIFICATION

### Output sections
1. Cover (analysis name, org branding, date).
2. Executive summary (selected recommendation + rationale note).
3. Scenario assumptions table.
4. Landed cost comparison table.
5. Delta highlights (best vs baseline / worst).
6. Optional margin impact section.
7. Disclaimer and estimate assumptions.

### Hierarchy
- Business decision first, technical detail second.

### Branding handling
- Org logo + org name in header.
- Optional primary color (safe palette).

### Mandatory assumption transparency
- Include duty rate source type (“user estimate”).
- Include transport/fees assumption notes.
- Include FX rate and date if used.

### Recommendation framing
- Never “the system decides.”
- Use language: “Based on provided assumptions, Scenario B shows lowest estimated landed cost.”

### Credibility/non-misleading rules
- Show confidence indicator and data completeness.
- Explicit disclaimer: estimate, not legal/compliance advice.

### Localization FR/EN
- All labels template-driven.
- Number/currency/date formatting per locale.

### White-label readiness
- Keep template tokens for logo/name/color.
- Full white-label (custom domain/templates) post-MVP.

---

## 14. BILLING / PAYMENTS MODEL (STRIPE)

### Recommendation
- 14-day free trial **without card** for acquisition speed in SMB segment.

### Plan options
- Monthly + annual (annual 15–20% discount).
- Quarterly optional post-MVP if demand appears.

### Suggested initial plans
1. **Starter** (€79/$89 per org/month)
   - 3 users
   - 20 analyses/month
   - PDF export included
2. **Growth** (€199/$229 per org/month)
   - 10 users
   - 100 analyses/month
   - Priority support
3. **Pilot/Custom** (manual invoicing optional)
   - for design partners; temporary negotiated pricing.

### Free vs paid boundary
- Free trial full features with capped analyses and watermark on PDF optional.
- Paid removes usage caps/watermark.

### Pricing test ladder
- Test A: lower entry Starter.
- Test B: higher starter + stronger annual discount.
- Measure trial-to-paid conversion and 60-day retention.

### Minimum viable billing implementation
- Stripe Checkout for upgrade.
- Stripe Billing Portal for self-serve management.
- Webhooks: checkout.session.completed, customer.subscription.updated/deleted, invoice.payment_failed.

### Postpone until later
- Seat-based prorations complexity.
- Multi-entity invoicing.
- In-app coupon management UI.

---

## 15. ANALYTICS MODEL (LEAN)

### Essential events
- `signup_started`
- `signup_completed`
- `org_created`
- `file_uploaded`
- `mapping_completed`
- `scenario_created`
- `analysis_saved`
- `pdf_exported`
- `premium_modal_opened`
- `checkout_started`
- `subscription_started`
- `subscription_canceled`

### PMF/conversion metrics to monitor
- Activation: `% users reaching mapping_completed within 24h`.
- Core value: `% analyses with >=2 scenarios and comparison viewed`.
- Shareability value: `% analyses exported to PDF`.
- Monetization: trial->paid conversion.
- Retention: orgs creating analysis in week 4+.

---

## 16. NON-FUNCTIONAL REQUIREMENTS

### Performance
- First meaningful page load < 2.5s on desktop broadband.
- Scenario recalc < 1s for 1k rows x 3 scenarios target.

### Browser support
- Latest Chrome, Edge, Safari, Firefox (last 2 major versions).

### Security
- Supabase RLS mandatory on all tenant data.
- Signed URLs for private exports.
- Stripe webhooks signature verification.
- Secure secrets via Vercel env vars.

### Privacy
- Data minimization; no unnecessary PII.
- Clear retention policy for files/exports.
- GDPR-ready consent/legal pages for FR/EU launch.

### Reliability
- 99.5%+ uptime target for MVP.
- Graceful retry for async jobs (PDF/billing webhook).

### Localization
- FR and EN UI strings from day 1 (can prioritize FR fully and EN core).

### Accessibility
- Keyboard navigable forms/tables.
- Basic WCAG 2.1 AA contrast and labels.

### Maintainability
- Domain-oriented code structure.
- Type-safe schemas with shared validation (zod).
- Clear boundaries between UI, domain logic, and data layer.

---

## 17. TECHNICAL ARCHITECTURE

### Frontend
- Next.js App Router + TypeScript.
- Server Components for data-heavy pages; Client Components for interactive mapping/scenario editors.
- Tailwind + design system components.

### Backend/service structure
- Supabase Postgres + Auth + Storage.
- Next.js server actions/API routes for privileged workflows (imports, billing webhook, PDF generation).

### Business logic location
- Calculation logic in shared domain module (`features/scenarios/lib/calculate.ts`) used by server actions.
- Validation in `zod` schemas shared client/server.

### Supabase usage
- Client SDK for user-scoped operations.
- Service-role key only in secure server routes for admin tasks/webhook processing.

### Client-side vs server-side
- Client: mapping interactions, scenario input editing UX.
- Server: persisted compute, billing ops, export generation, access checks.

### PDF generation
- Preferred: server-side HTML-to-PDF (Playwright or headless Chromium on Vercel-compatible function/queue).
- Fallback: client-side print/PDF for early prototype; move to server for consistency.

### Stripe integration
- Checkout session creation endpoint.
- Billing portal endpoint.
- Webhook route updating `subscriptions` and `billing_events` idempotently.

### Analytics integration
- Plausible events triggered from client and key server events (server-side mirror for critical conversion steps).

### Recommended architecture notes
- Keep synchronous UX for small compute; optionally queue heavy PDF jobs later.
- Use optimistic UI where safe, but always reconcile from DB state.

---

## 18. RECOMMENDED REPO / FOLDER STRUCTURE

```txt
import-margin-guard/
  app/
    (marketing)/
      page.tsx
      pricing/page.tsx
    (auth)/
      sign-in/page.tsx
      sign-up/page.tsx
      reset-password/page.tsx
    (app)/
      dashboard/page.tsx
      analyses/page.tsx
      analyses/[analysisId]/builder/page.tsx
      analyses/[analysisId]/compare/page.tsx
      imports/new/page.tsx
      imports/[importId]/mapping/page.tsx
      settings/account/page.tsx
      settings/organization/page.tsx
      settings/billing/page.tsx
    api/
      imports/parse/route.ts
      imports/commit/route.ts
      scenarios/calculate/route.ts
      exports/pdf/route.ts
      billing/checkout/route.ts
      billing/portal/route.ts
      billing/webhook/route.ts
  components/
    ui/
    layout/
    forms/
    tables/
    charts/
  features/
    auth/
      components/
      lib/
    organizations/
      components/
      lib/
    imports/
      components/
      lib/
      schemas/
    analyses/
      components/
      lib/
      schemas/
    scenarios/
      components/
      lib/
      schemas/
    exports/
      components/
      lib/
    billing/
      components/
      lib/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    stripe/
      client.ts
      server.ts
    analytics/
      plausible.ts
    i18n/
      config.ts
      messages/
        fr.json
        en.json
    utils/
      currency.ts
      dates.ts
  types/
    db.ts
    domain.ts
  styles/
    globals.css
  docs/
    blueprint/
      product-spec.md
      data-model.md
      roadmap.md
  supabase/
    migrations/
    seed.sql
    policies.sql
  tests/
    unit/
    integration/
    e2e/
```

---

## 19. API / ACTION DESIGN

### Auth-related
- Supabase auth flows (mostly built-in), plus protected middleware for app routes.

### Upload handling
- `POST /api/imports/parse`
  - Input: file metadata + storage path.
  - Output: preview headers, sample rows, parse warnings.

- `POST /api/imports/commit`
  - Input: import id + mapping config.
  - Output: normalized row counts, validation summary.

### Mapping save
- `POST /api/imports/{id}/mapping`
  - Save mapping JSON and status.

### Analysis CRUD
- `POST /api/analyses`
- `PATCH /api/analyses/{id}`
- `DELETE /api/analyses/{id}`

### Scenario calculate
- `POST /api/scenarios/calculate`
  - Input: analysis id + scenario configs.
  - Output: scenario_results summary/deltas/confidence.

### Export PDF
- `POST /api/exports/pdf`
  - Input: analysis id, scenario ids, language, branding opts.
  - Output: export job/file URL.

### Billing checkout
- `POST /api/billing/checkout`
  - Input: org id + plan code.
  - Output: Stripe checkout URL.

### Webhook handling
- `POST /api/billing/webhook`
  - Verify signature.
  - Idempotently persist event.
  - Update subscription entitlements.

---

## 20. DELIVERY ROADMAP

### Phase 0: Discovery / final validation (1 week)
- **Objectives:** validate top ICP and pricing hypothesis.
- **Deliverables:** 10–15 discovery calls, refined MVP scope, messaging draft.
- **Dependencies:** founder/customer access.
- **Risks:** building for wrong segment.

### Phase 1: Foundations (1 week)
- **Objectives:** establish app skeleton and core infra.
- **Deliverables:** Next.js app setup, Supabase project, auth, org model, base UI kit.
- **Dependencies:** domain model draft.
- **Risks:** poor tenant model causing rework.

### Phase 2: Import + mapping (1.5 weeks)
- **Objectives:** ingest real customer files.
- **Deliverables:** upload, parse, mapping UI, validation pipeline.
- **Dependencies:** required field contract.
- **Risks:** file variability complexity.

### Phase 3: Scenarios + calculation (1.5 weeks)
- **Objectives:** make core value loop usable.
- **Deliverables:** scenario CRUD, calculation engine, result persistence.
- **Dependencies:** normalized import rows.
- **Risks:** formula ambiguity; trust issues.

### Phase 4: Result UI + PDF (1 week)
- **Objectives:** decision-ready outputs.
- **Deliverables:** comparison UI, ranking, deltas, export PDF v1.
- **Dependencies:** scenario results stable.
- **Risks:** PDF quality/performance.

### Phase 5: Saved analyses + role permissions (1 week)
- **Objectives:** collaboration and reusability.
- **Deliverables:** saved analysis library, org settings, invite flows, RLS hardening.
- **Dependencies:** organization/member model.
- **Risks:** permission bugs.

### Phase 6: Billing + premium gating (1 week)
- **Objectives:** monetize.
- **Deliverables:** Stripe checkout, webhook sync, plan limits UI, billing page.
- **Dependencies:** usage counters.
- **Risks:** entitlement sync failure.

### Phase 7: Polish + beta release (1 week)
- **Objectives:** reliable beta with initial design partners.
- **Deliverables:** bug fixes, analytics events, onboarding polish, docs.
- **Dependencies:** end-to-end test pass.
- **Risks:** weak activation without guided onboarding.

---

## 21. DETAILED BUILD ORDER (MINIMIZE REWORK)

1. Define canonical domain types and required input fields (`zod` + TS types).
2. Create Supabase schema + RLS for org/members first.
3. Implement auth + org onboarding before any analysis features.
4. Build upload pipeline (storage + parse service) with fixed sample files.
5. Build mapping UI with hard validation gates.
6. Persist normalized rows and validation statuses.
7. Implement analysis + scenario core tables and CRUD.
8. Implement calculation engine as pure deterministic functions.
9. Add scenario comparison UI and delta computation.
10. Add save/reopen analysis flows.
11. Add PDF export using stable comparison payload.
12. Add billing and plan gates around usage/export.
13. Add analytics events across funnel.
14. Harden security/RLS and edge-case QA.
15. Polish onboarding/UX copy for non-technical users.

---

## 22. QA / TEST PLAN

### Unit tests
- Formula correctness (duty, landed total, per-unit, margin).
- Validation schema tests for imports/mappings.
- Role permission helper tests.

### Integration tests
- Upload -> mapping -> import commit pipeline.
- Analysis + scenario create/update + calculate.
- PDF generation endpoint with sample payload.
- Stripe webhook handling idempotency.

### Manual QA
- Full happy path from signup to PDF export.
- Multi-role collaboration within same org.
- Billing upgrade/cancel cycle.

### Import edge cases
- Missing headers.
- Mixed decimal separators (comma/dot for FR).
- Empty rows, duplicated rows, invalid currencies.
- Very large file near limit.

### Calculation edge cases
- Zero quantity (reject).
- Negative costs (reject unless explicit credits not in MVP).
- Extreme duty rates.
- Missing sales price for margin view.

### PDF edge cases
- Long scenario names/comments overflow.
- Missing logo.
- FR/EN formatting and pagination.

### Auth/permission edge cases
- User removed from org during active session.
- Viewer attempting edit.
- Cross-org data access attempt.

### Billing edge cases
- Failed payment and grace behavior.
- Canceled checkout return.
- Duplicate webhook events.

---

## 23. RISKS / WATCHOUTS + MITIGATIONS

1. **Overbuilding product scope**
   - Mitigation: strict MVP guardrails and weekly scope review.
2. **Wrong ICP selection**
   - Mitigation: early design partners in target verticals.
3. **Spreadsheet replacement objection**
   - Mitigation: emphasize faster comparison + professional sharing, not total replacement.
4. **Bad data quality from uploads**
   - Mitigation: robust validation, visible confidence indicators.
5. **Low usage frequency**
   - Mitigation: focus on recurring sourcing cycles and multi-scenario reviews.
6. **Positioning confusion with ERP/compliance tools**
   - Mitigation: explicit messaging and website “what it is / is not.”
7. **Trust issues around calculations**
   - Mitigation: transparent formulas, assumptions always visible, PDF disclaimers.
8. **Billing friction in SMB**
   - Mitigation: no-card trial and simple transparent plans.
9. **RLS/security mistakes in multi-tenant app**
   - Mitigation: policy tests + explicit auth boundaries.

---

## 24. POST-MVP OPPORTUNITIES

- Supplier portfolio trend view (historical scenario outcomes).
- Tariff/duty watchlist alerts (manual feeds first).
- Country risk overlay (lead time/risk score).
- Scenario templates per incoterm/transport mode.
- Organization-wide cost assumption libraries.
- ERP connectors (e.g., Netsuite, Odoo, SAP Business One).
- AI-generated executive summary draft for management memo.
- Approval workflows for larger teams.

(Explicitly post-MVP to protect focus.)

---

## 25. FINAL RECOMMENDATION TO THE BUILDER

Keep MVP narrowly focused on one repeatable value loop:
**upload -> map -> compare 2–3 scenarios -> export credible decision summary**.

Prioritize:
1. Data import reliability.
2. Transparent and trusted calculations.
3. Clean comparison UX for non-technical stakeholders.
4. Professional PDF output that helps internal decision alignment.

Do not spend early cycles on:
- Deep integrations,
- Advanced compliance intelligence,
- Complex workflow automation,
- Broad BI dashboards.

Business value comes first from helping teams make better sourcing decisions in under 30 minutes with confidence.

---

## 26. FIRST CODING SPRINT PROPOSAL (5–7 DAYS)

### Sprint goal
Deliver a usable “thin-slice” MVP flow for one user in one organization:
**sign up -> create org -> upload CSV -> map required columns -> create 2 scenarios -> view landed cost comparison (no PDF yet).**

### Exact priorities
1. Tenant/auth foundations.
2. Import + mapping path.
3. Minimal scenario + calculation screen.

### Exact deliverables by day
- **Day 1:** Next.js + Tailwind + Supabase project wiring; auth screens; protected app shell.
- **Day 2:** Organization onboarding and membership table + RLS basics.
- **Day 3:** CSV upload to Supabase Storage + parse preview endpoint.
- **Day 4:** Column mapping UI with required field validation and import commit.
- **Day 5:** Analysis + scenario tables, minimal create/edit UI.
- **Day 6:** Calculation engine integration and comparison table.
- **Day 7 (buffer):** QA fixes, seed demo dataset, internal walkthrough script.

### End-of-sprint usable outcome
A user can log in, create an organization, upload and map a file, define two scenarios, and see an auditable landed-cost comparison in-app. This is enough to demo the core value proposition to design partners and collect immediate product feedback.
