@AGENTS.md

# nkc-website — CLAUDE.md

## What this project is
Public-facing website for NKC at nkc.nu. Next.js 16 + React 19 + Firebase.
Deployed via Firebase App Hosting (see apphosting.yaml).

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
