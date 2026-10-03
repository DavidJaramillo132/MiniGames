---
name: PlayHub
description: Monochrome Stealth + Hyper-Accent — Tactical, precision dark interface with Electric Volt hyper-accent
colors:
  primary: "#d4ff00"
  primary-glow: "rgba(212, 255, 0, 0.35)"
  primary-dark: "#08080a"
  primary-hover: "#e2ff33"
  secondary: "#f4f4f6"
  accent-volt: "#d4ff00"
  accent-volt-light: "#e2ff33"
  accent-emerald: "#00f5a0"
  accent-crimson: "#ff3355"
  accent-amber: "#ffaa00"
  podium-gold: "#d4ff00"
  podium-silver: "#e4e4e7"
  podium-bronze: "#a1a1aa"
  white: "#ffffff"
  background: "#08080a"
  surface: "rgba(17, 17, 20, 0.94)"
  surface-elevated: "rgba(23, 23, 29, 0.96)"
  border: "rgba(255, 255, 255, 0.08)"
  border-glow: "rgba(212, 255, 0, 0.45)"
  text-primary: "#f4f4f6"
  text-muted: "#8c8c9a"
typography:
  display:
    fontFamily: "Rajdhani, sans-serif"
    fontWeight: 700
    letterSpacing: "0.04em"
  headline:
    fontFamily: "Rajdhani, sans-serif"
    fontWeight: 700
    letterSpacing: "0.03em"
  body:
    fontFamily: "Sora, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Rajdhani, sans-serif"
    fontWeight: 700
    letterSpacing: "0.14em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "18px"
  xl: "26px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  button-surface:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  badge-primary:
    backgroundColor: "rgba(212, 255, 0, 0.12)"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
---

# Design System: Monochrome Stealth + Hyper-Accent

## Overview

PlayHub embodies **Monochrome Stealth + Hyper-Accent**: a deep matte carbon and obsidian dark canvas (`#08080a`), surgical hairline borders (`rgba(255, 255, 255, 0.08)`), and crisp high-contrast monochrome surfaces energized by a singular, piercing **Electric Volt hyper-accent (`#d4ff00`)**.

The aesthetic draws inspiration from modern aerospace telemetry, precision audio gear, and stealth tactical hardware. It eliminates decorative noise, AI-slop purple nebulae, and generic gradients in favor of razor-sharp hierarchy, tactical physical depth, and high-performance multiplayer feedback.

## Colors

### The Hyper-Accent
- **Electric Volt (`#d4ff00`)**: The sole high-voltage kinetic accent. Pierces the monochrome stealth foundation with instant clarity. Utilized for primary calls to action, active turn beacons, Player X duel tokens, focused input outlines, and live tournament highlights.
  - Contrast ratio against `#08080a`: **16.5:1** (vastly exceeds WCAG AAA).
  - Primary button ink: `#08080a` on `#d4ff00` for unmatched daylight readability.

### Stealth Monochrome Foundations
- **Obsidian Canvas (`#08080a`)**: Deep, low-reflectance carbon black base.
- **Carbon Chassis (`#111114` / `rgba(17, 17, 20, 0.94)`)**: Primary enclosure fill for game bays, telemetry modules, and arena cards.
- **Elevated Carbon (`#17171d` / `rgba(23, 23, 29, 0.96)`)**: Secondary action triggers, modal cards, and interactive tiles.
- **Inset Surface (`#0d0d10`)**: Recessed game boards, input fields, and telemetry wells.
- **Hairline Borders (`rgba(255, 255, 255, 0.08)` / `#232328`)**: Architectural 1px containment lines, brightening to `rgba(212, 255, 0, 0.45)` on active or focused states.

### Semantic Accents (Controlled & Functional)
- **Stark Ice White (`#ffffff` / `#f4f4f6`)**: Primary typography and Player O duel token.
- **Tactical Stealth Gray (`#8c8c9a`)**: Secondary subtitles and metadata labels (> 5:1 contrast against surface).
- **Hyper Emerald (`#00f5a0`)**: SignalR live hub status, confirmed pairs, and victory banners.
- **Tactical Amber (`#ffaa00`)**: Match waiting alerts and pending player slots.
- **Hyper Crimson (`#ff3355`)**: Defeat indicators, error fallbacks, and destructive actions.

## Typography

- **Display & Telemetry (`Rajdhani`)**: Used for page headers, arena callouts, countdowns, scores, room codes, and uppercase labels. Weights: 600 (SemiBold), 700 (Bold).
- **Interface & Body (`Sora`)**: Used for descriptions, labels, form controls, and body reading. Weights: 400 (Regular), 500 (Medium), 600 (SemiBold).

## Layout & Rhythm

- **Maximum Widths**:
  - Landing hero / presentation: `1280px`
  - Lobby arena / match rooms: `1120px`
  - Dual-column battle decks: `1140px`
  - Authentication terminals: `1120px`
- **Spacing Rhythm**: Modular 4px/8px baseline rhythm (`4px`, `8px`, `16px`, `24px`, `32px`, `48px`).

## Elevation & Depth

- **Tactical Layering**: Surfaces step cleanly from Canvas (`#08080a`) -> Chassis (`#111114`) -> Elevated Module (`#17171d`).
- **Precision Glows**: Directional volt aura (`0 0 20px rgba(212, 255, 0, 0.25)`) reserved strictly for active turns and primary button hover states.
- **Depth Shadows**: Smooth vertical y-offset drop shadows (`0 24px 70px rgba(0, 0, 0, 0.7)`).

## Components

### Buttons (`src/components/ui/Button.tsx`)
- **Primary**: Solid Electric Volt `#d4ff00` with deep carbon `#08080a` bold text. Active scale `0.98`, focus ring with `#08080a` offset.
- **Surface**: Elevated carbon `#17171d` with `#f4f4f6` text and crisp `rgba(255,255,255,0.08)` border.
- **Ghost**: Minimal padding with subtle white hover fill for secondary navigation.

### Badges (`src/components/ui/Badge.tsx`)
- Pill badges with geometric borders and high-contrast status fills (`primary` with Electric Volt, `success` with Emerald, `warning` with Amber, `neutral` with carbon/white).

### Game Cards (`src/components/game/GameCard.tsx`)
- Matte carbon physical cartridges with high-contrast banners, live telemetry badges, and 1-click launch triggers.

### Terminals & Modals (`src/components/game/CreateRoomModal.tsx`)
- Stealth obsidian backdrop with hairline border highlights, keyboard escape listener, and accessible focus management.

## Do's and Don'ts

### Do
- Keep 90-95% of the UI in disciplined monochrome stealth (carbon, graphite, white, gray).
- Use Electric Volt (`#d4ff00`) strictly as a purposeful hyper-accent for key interactive and state-defining moments.
- Use uppercase `Rajdhani` for telemetry, scores, and duel codes.
- Maintain high contrast on all buttons and labels (WCAG AA/AAA).
- Keep interactive cards tactile with physical hover feedback.

### Don't
- Never use decorative two-axis hairline grid backgrounds.
- Never place ungrounded blurred neon or multi-color purple orbs behind cards.
- Never use heading eyebrows or kickers that repeat obvious category names.
- Never use gradient text. Emphasis comes from weight or size.
- Never break or alter SignalR real-time event subscriptions or game logic.
