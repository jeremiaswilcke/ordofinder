# Ordofinder Design Brief for Claude Design

This document is the canonical design brief for visual and UX work on Ordofinder.

Use it when redesigning screens, refining the UI system, or improving interaction quality. The goal is not to replace the product identity, but to elevate it without drifting away from its editorial, archival, city-first character.

## Product Frame

Ordofinder is not a generic church directory.

It should feel like:
- an editorial archive
- a living index of worthy Catholic celebrations
- a calm, serious, beautiful product with conviction
- international, but not bland
- reverent, but not dusty

It should not feel like:
- a parish management dashboard
- a startup SaaS template
- a tourist booking site
- a generic map app
- a dark luxury concept
- a “Catholic Pinterest”

The product self-frames as:
- `Ordofinder Archive`
- city-first discovery
- trusted review and stewardship
- liturgical seriousness plus living community

## Design Objective

Claude Design should improve the interface so that it feels:
- more refined
- more intentional
- more coherent across pages
- more premium in spacing, typography, and composition
- more editorial in its image treatment and page rhythm
- more trustworthy in how information is presented

The redesign should preserve the existing architectural direction:
- Next.js app with App Router
- Tailwind CSS v3
- Stitch / Material 3 token system via CSS variables
- Noto Serif for headlines
- Public Sans for body and labels
- Material Symbols Outlined

Do not redesign the product into a new brand. Refine and sharpen the existing one.

## Core Aesthetic

The visual language should combine:
- editorial Catholic archive
- quiet museum catalog
- civic cultural institution
- thoughtful global directory

The UI should feel:
- flat, not glassy
- layered through composition, not heavy shadow
- typographic first
- image-aware
- calm and structured

There should be:
- strong hierarchy
- generous spacing
- clear information grouping
- occasional dramatic image framing
- subtle movement only where it supports rhythm

There should not be:
- excessive color
- bubbly SaaS UI
- soft purple gradients
- oversized rounded corners everywhere
- playful icon overload
- loud CTA spam

## Non-Negotiable Visual Rules

Keep these constraints unless explicitly changed by the product owner:

### Typography

- Headline font: `Noto Serif`
- Body and labels: `Public Sans`
- Headlines should carry emotional weight and editorial dignity.
- Body text should stay readable, modern, and understated.
- Avoid excessive font weight variation.
- Avoid trendy condensed or futuristic typography.

### Tokens and Colors

- Use only the Stitch / Material token palette already defined in `app/globals.css`.
- No ad-hoc hex colors unless explicitly approved.
- No redesign that changes the core palette away from the muted blue-grey archival direction.
- Contrast and legibility matter more than novelty.

### Shape Language

- Overall geometry should stay restrained and mostly flat.
- Default radius is small.
- Cards may use `rounded-lg`.
- Images may use `rounded-xl`.
- Avoid pill-heavy UI except where chips intentionally use it.

### Shadow and Depth

- Prefer flat surfaces and quiet tonal layering.
- Use shadows sparingly.
- The existing `archival-shadow` is acceptable, but should never dominate the page.
- Build hierarchy with spacing, contrast, framing, and typography first.

### Imagery

- Church imagery should feel editorial, not stocky.
- Prefer architectural presence, atmosphere, sacred interiority, and context.
- Mild grayscale treatment is welcome.
- Overlays should remain elegant and readable.
- Images should support the archive tone, not compete with it.

## Existing Design Direction to Preserve

These are already part of the product and should remain conceptually intact:

### City-first navigation

City is the main public entry point.

The user journey should continue to feel like:
`Landing -> City Picker -> City Archive -> Church Detail`

### Bento composition

The interface already relies on asymmetric editorial grids and should continue to do so.

Preserve and improve:
- hero plus side-card structures
- asymmetric city and church grids
- strong image blocks next to quieter informational surfaces
- mixed aspect ratios that create rhythm

### Metric storytelling

The church detail page should continue to foreground the four dimensions:
- Liturgy
- Music
- Homily
- Vibrancy

These metrics should feel serious, legible, and premium.

### Archival framing

Labels such as:
- `Ordofinder Archive`
- `Architect's Note`
- `Submission Guidelines`
- `Invite Redemption`

support the identity and should not be flattened into generic product copy.

## Priority Screens

If design work is scoped, prioritize these pages first:

1. Landing page
2. City picker
3. City detail page
4. Church detail page
5. Submit page
6. Map page
7. Reviewer/Admin dashboards

The public product matters more visually than the internal dashboards.

## Page-by-Page Guidance

### 1. Landing Page

The landing page should feel like the front page of a living archive.

Desired qualities:
- immediate sense of seriousness and beauty
- strong city context
- a hero that feels editorial, not marketing-generic
- top-city grid that invites browsing
- clear path into cities and map

Improve:
- stronger opening composition
- better balance between headline, subtitle, and CTA
- more dramatic but restrained city/archive framing
- clearer visual transition from hero to content sections

Avoid:
- startup-style hero blobs
- over-animated entrances
- generic “discover churches worldwide” landing clichés

### 2. City Picker

This page should feel like browsing a curated archive index, not a filter table.

Desired qualities:
- searchable, but beautiful
- cards with strong typographic hierarchy
- city count presentation that feels archival
- visual cadence in the grid

Improve:
- the search area as a stronger top-level interface moment
- clearer grouping of featured vs standard cities if helpful
- more compelling density without clutter

### 3. City Detail Page

This page should feel like opening a city dossier.

Desired qualities:
- strong city identity
- asymmetrical flow of church cards
- clear reading order
- mix of hero church and supporting archives

Improve:
- stronger city header
- more intentional orchestration of card sizes
- better relationship between imagery, score, and metadata

### 4. Church Detail Page

This is the product’s emotional center.

It should feel:
- reverent
- informed
- elegant
- globally legible

Desired qualities:
- powerful image framing
- strong metric block presentation
- schedule area with confident information design
- tags and metadata treated as archival evidence, not as app clutter

Improve:
- hero layout drama
- rating presentation and explanatory text
- metadata grouping
- overall rhythm from hero to schedule to community/location

Avoid:
- dashboard-like density
- long flat walls of text
- overly decorative sacred motifs

### 5. Submit Page

This page should feel trustworthy and calm.

Desired qualities:
- serious contribution flow
- excellent section hierarchy
- a sense of stewardship
- form that feels substantial but not bureaucratic

Preserve:
- section separators
- sticky guidelines sidebar
- “Lebendigkeit des Glaubens” wording as an intentional cultural note

Improve:
- form spacing
- input hierarchy
- labels, helper text, and narrative framing
- perceived quality of the moderation/submission process

### 6. Map Page

The map should feel like a research tool inside an editorial product.

Desired qualities:
- clean frame
- good relationship between map surface and surrounding UI
- clustered markers that feel integrated into the brand

Improve:
- the chrome around the map
- loading and empty states
- popups so they feel like archival excerpts, not default Leaflet UI

### 7. Reviewer and Admin

These pages matter, but they should stay simpler and more utilitarian than the public archive.

Desired qualities:
- trustworthy
- efficient
- structurally consistent with the rest of the product

Improve:
- hierarchy
- card consistency
- invite and queue presentation

Do not:
- turn them into enterprise admin dashboards
- overload them with decorative flourishes

## Interaction Principles

- Motion should be sparse and meaningful.
- Hover states should feel slow, calm, and premium.
- Page transitions should not become theatrical.
- Buttons and chips should remain crisp and legible.
- Filters and controls should be easy to scan and hard to misuse.

Prefer:
- staggered reveal only in key moments
- subtle image scaling
- calm hover transitions
- intentional focus states

Avoid:
- bounce
- spring-heavy playful motion
- constant pulsing or shimmer
- excessive microinteraction noise

## Information Design Principles

Ordofinder’s trust depends on information clarity.

Design should communicate:
- what is editorial
- what is verified
- what is structural metadata
- what is community signal

Make distinctions visually clear between:
- church identity
- liturgical ratings
- schedule information
- tags/community signals
- geographic metadata
- review/moderation context

Use typography and spacing to create these layers instead of piling on more borders.

## Church Photography Guidance

When selecting or presenting church images:
- prioritize authentic architecture and liturgical space
- avoid cheesy HDR looks
- avoid touristy postcard framing when possible
- prefer quiet, dignified, well-composed imagery
- allow stone, wood, shadow, candles, vaulting, and depth to breathe

Best image types:
- frontal exterior with architectural presence
- nave/interior with real atmosphere
- apse, altar, or vaulting details when composition is strong
- context-rich urban placement if it supports the city archive feel

Avoid:
- low-quality mobile snapshots for hero use
- overexposed or muddy imagery
- random crowds unless the image genuinely captures communal vibrancy

## Accessibility and Product Quality

Design improvements must not reduce usability.

Always preserve or improve:
- color contrast
- readable font sizes
- keyboard focus visibility
- mobile usability
- responsive layouts
- text wrapping and safe spacing for German

German strings are often longer than English. Layouts must survive both.

## What Claude Design Should Deliver

When working on design, Claude should aim to deliver:
- improved page composition
- refined visual hierarchy
- better spacing and typography decisions
- more coherent card system usage
- stronger public-facing archive identity

Claude should explain:
- what visual problem is being solved
- what changed in hierarchy or rhythm
- why the redesign better expresses the archive concept

## Hard Constraints

Do not:
- replace the design system with a different brand language
- introduce arbitrary new colors
- switch fonts
- redesign everything into dark mode
- turn the product into a mobile-app-style card stack everywhere
- remove the city-first structure
- remove the four metric dimensions
- flatten the archival tone into generic marketplace language

## Preferred Redesign Mindset

Think:
- editorial redesign
- refinement through discipline
- stronger pacing
- better density control
- better visual confidence

Not:
- visual novelty for its own sake
- maximalism
- trend-chasing
- Dribbble-style concept art disconnected from product reality

## Suggested Claude Design Prompt

Use this if you want a direct handoff:

`Please redesign Ordofinder’s interface using the attached Design.md as the governing brief. Keep the existing brand direction, Stitch token system, and editorial Catholic archive tone, but significantly improve hierarchy, composition, visual rhythm, and premium feel. Prioritize the public experience first: landing, city picker, city page, and church detail page. Avoid generic SaaS aesthetics and preserve the city-first archival identity.`

