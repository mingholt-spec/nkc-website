@AGENTS.md

# nkc-website — CLAUDE.md

## What this project is
Public-facing website for NKC at nkc.nu. Next.js 16 + React 19 + Firebase.
Deployed via Firebase App Hosting (see apphosting.yaml).

## Rules
- **Every new piece of user-facing text must be added in both Swedish and English in the same change.** Use `lib/translations.ts`'s `useT('namespace')` (client components) or `getT('namespace', lang)` (server components, where `lang` is `getServerLanguage()` or a prop) — add the key to both the `sv` and `en` blocks, never hardcode display text in only one language. Confirmed as a standing rule 2026-09-13 after a full-site sv/en audit — the goal is to never need a repeat of that audit. See "Language: sv/en" below for how language is actually determined (client-only, cookie doesn't reach the server through the custom domain).

## Language: sv/en — client-only, cookie does NOT reach the server via nkc.nu
The site's only language mechanism is client-side: `localStorage` (`flowroll_lang`),
set by `PublicLayoutClient.tsx`'s `toggleLanguage`. It also mirrors the value into
a cookie of the same name, but **that cookie does not reach the Next.js server when
requests come through the `nkc.nu` custom domain** — Firebase Hosting's CDN layer for
custom domains drops it before it reaches the App Hosting backend (confirmed via
`curl` against both `nkc.nu` and the direct `*.hosted.app` URL — same request, cookie
respected on one, silently dropped on the other). This is Google-managed
infrastructure, not something fixable in this repo's config.

Practical consequences:
- `generateMetadata()`, JSON-LD, and the root `<html lang>` are intentionally left
  static/Swedish-default — reading the cookie there was tried and reverted because it
  forces the whole route out of static rendering (`next build`'s `○`→`ƒ`), which is
  unacceptable given fast static pages are a deliberate SEO/ranking advantage here.
  Returning English-preference visitors instead get the tab title patched client-side
  after hydration via `<ClientTitleOverride enTitle={...} />` (zero server cost).
- `/bekrafta` (the waitlist confirmation page, reached via an emailed link) is the one
  page where the language genuinely matters server-side and already pays the dynamic-
  rendering cost (it does live Firestore writes). It does NOT rely on the cookie either
  though — a cookie only helps if the link is opened on the same device/browser used to
  sign up. Instead the language is encoded directly in the link itself: the waitlist
  signup records `Lead.lang` (added to `types/core.ts` in bjj-premium), and
  `bjj-premium/api/campaigns.ts`'s `sendWaitlistNotification` writes `?lang=en` into the
  `/bekrafta` URL it emails. `/bekrafta/page.tsx` reads that query param first, falling
  back to the cookie only if absent.
- If a future page needs a real server-side language signal, prefer encoding it in the
  URL the way `/bekrafta` does, not the cookie — the cookie only works for same-device
  same-browser return visits and is `nkc.nu`-CDN-dependent.

## This repo is one half of a pair — read before touching registration or leads
nkc-website and bjj-premium (~/Desktop/Projects/bjj-premium,
github.com/mingholt-spec/bjj-manager-pro) are two parts of the same system.
They are separate git repos but share the same Firebase project
(bjj-manager-pro) and the same Firestore database.

### Two registration paths — must stay in sync
Event registration logic exists in TWO separate codebases. Changes to one
must always be mirrored in the other:
- nkc-website/app/api/event/register/route.ts  ← public website registrations (this repo)
- bjj-premium/api/campaigns.ts                 ← portal registrations

Both files maintain a `standardFields` set. Any new registration field MUST
be added to BOTH sets or it will leak into `customFields` on the lead document,
causing it to appear as a raw custom field in the UI.

### The upsert-lead pattern (intentional — do not change)
One lead document per person (identified by email). When someone registers:
- First time ever → new document created → onLeadCreated fires (bjj-premium Cloud Function)
- Returning registrant → existing document updated → onLeadUpdated fires, onLeadCreated does NOT

This is intentional (avoids duplicate leads). Any logic that should run
"when someone registers" must exist in BOTH onLeadCreated AND onLeadUpdated
over in bjj-premium/functions/src/index.ts — missing one causes silent
failures for returning participants. (Tim Johansson bug, 2026-06.)

### Key Firestore relationships
- leads.matchedUserId → users/{id}   (enables MEMBER badge; set by Cloud Functions)
- leads.campaignId → campaigns/{id}  (which event they are registered for)
- leads.tags → synced to users.tags by onLeadUpdated
- automation_dedup/{triggerEventId}  (source of truth: has this automation run?)
  Never delete from this collection.

### Two public-block-rendering paths — must also stay in sync
Every page-builder block type has TWO separate rendering components:
- nkc-website/components/blocks/*.tsx          ← the REAL public site (this repo, nkc.nu)
- bjj-premium/components/public/blocks/*.tsx   ← admin-portal live preview only

A visual/behavioral/accessibility fix made to one is invisible on the actual
live site unless mirrored into the other. This repo's versions are Next.js
'use client' components using dangerouslySetInnerHTML + normalizeLinks/safeStr
(not RichTextContent like bjj-premium's). This repo has no GitHub Actions CI —
it deploys via Firebase App Hosting's native git integration on push to main,
so there's no `gh run list` to poll; just push and allow a short delay before
it's live.

### Where the Cloud Functions, deploy order, and tests live
All Cloud Functions (onLeadCreated, onLeadUpdated, processAutomationRuns,
dailyAutomationBackfill, ogShare, etc.) and their tests live in bjj-premium,
not here. This repo has its own deploy pipeline (Firebase App Hosting) that
is independent of bjj-premium's Hosting+Functions deploy — but both write to
the same Firestore collections, so a schema or field change here can still
break automations over there. When in doubt, check bjj-premium/CLAUDE.md.
