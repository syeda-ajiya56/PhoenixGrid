---
name: Phoenix Grid
colors:
  surface: '#0e1320'
  surface-dim: '#0e1320'
  surface-bright: '#343948'
  surface-container-lowest: '#090e1b'
  surface-container-low: '#161b29'
  surface-container: '#1a1f2d'
  surface-container-high: '#252a38'
  surface-container-highest: '#303443'
  on-surface: '#dee2f5'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#dee2f5'
  inverse-on-surface: '#2b303e'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf3'
  primary: '#c3f5ff'
  on-primary: '#00363d'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#006875'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#b1ffb5'
  on-tertiary: '#003912'
  tertiary-container: '#49ed72'
  on-tertiary-container: '#006727'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#69ff87'
  tertiary-fixed-dim: '#3ce36a'
  on-tertiary-fixed: '#002108'
  on-tertiary-fixed-variant: '#00531e'
  background: '#0e1320'
  on-background: '#dee2f5'
  surface-variant: '#303443'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  mono-label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-gap: 24px
---

## Brand & Style
The design system is engineered for high-stakes environments, prioritizing rapid data synthesis and elite technical precision. It targets emergency responders, data scientists, and mission commanders who require a "God-view" of chaotic events.

The aesthetic is **Tactical Glassmorphism**. It combines the utilitarian rigor of military interfaces with the sophisticated depth of futuristic aerospace HUDs. The interface must feel like a singular, integrated glass cockpit—lightweight yet structurally indestructible. High-frequency information is contained within translucent layers that utilize background blurs to maintain legibility against dynamic, moving map backgrounds. Visual interest is driven by "data-glow"—subtle inner shadows and outer blooms that suggest active power and real-time processing.

## Colors
The palette is rooted in **Deep Space Black** and **Dark Navy** to maximize contrast and reduce eye strain during long-duration operations. 

- **Base Surfaces:** Use `#0A0F1C` for the global canvas. Primary containers use `#111827` with a low-opacity border.
- **Accents:** Neon Cyan is the "Action Color," used for primary interactions and active states. Electric Blue is used for informational data streams.
- **Status Indicators:** Emergency Red, Tactical Green, and Warning Amber follow strict semantic rules. These colors should possess a subtle `0 0 8px` outer glow to simulate high-priority LED alerts.
- **Transparency:** All modal and card surfaces must use 80% opacity with a `12px` backdrop blur to achieve the glassmorphic effect.

## Typography
Typography is split between **Inter** for high-readability UI and **JetBrains Mono** for technical data and telemetry.

- **Headlines:** Use Inter with tight tracking and heavy weights. This creates an authoritative, modern feel.
- **Data & Telemetry:** All numeric values, timestamps, and coordinates must use JetBrains Mono. The monospaced nature prevents "jumping" layouts during real-time data updates.
- **Case Styling:** Use `uppercase` for `mono-label-sm` to mimic military briefing documents. 
- **Hierarchy:** Maintain a clear distinction between "Instructional Text" (Inter) and "System Output" (JetBrains Mono).

## Layout & Spacing
The system utilizes a **12-column fluid grid** for the main dashboard, with a fixed sidebar for primary navigation (width: 80px collapsed, 260px expanded).

- **The Grid:** Use a 24px gap between dashboard widgets. Internal widget padding should follow a strict 16px or 24px rhythm.
- **Dense Mode:** For data-heavy views, reduce gutters to 8px and internal padding to 12px to maximize "Information Density" without sacrificing clarity.
- **Responsive Behavior:** On mobile, widgets stack vertically. On tablet/desktop, use a "Bento Box" arrangement where critical alerts span 12 columns and secondary telemetry metrics span 3 or 4 columns.

## Elevation & Depth
Depth is not communicated via traditional shadows, but through **Luminance and Blur**.

1.  **Floor (Level 0):** Deep Space Black (`#0A0F1C`). No blur.
2.  **Basal (Level 1):** Primary UI panels. Dark Navy (`#111827`) at 80% opacity. 1px stroke in `#1E293B`.
3.  **Raised (Level 2):** Modals and pop-overs. Same as Level 1 but with a primary color (`#00E5FF`) top-border stroke (2px) and a subtle Cyan drop-shadow (`0 8px 32px rgba(0, 229, 255, 0.1)`).
4.  **Active (Level 3):** Interactive elements. High-contrast borders and inner glow effects.

All elevated elements must utilize `backdrop-filter: blur(12px)` to maintain the "glass" physical metaphor.

## Shapes
The system uses a "Soft Tech" approach. Avoid full circles (except for status pips) and avoid sharp 90-degree corners. 

- **Primary Radius:** `0.25rem` (4px) provides a precise, engineered feel. 
- **Large Components:** Cards and modals use `0.5rem` (8px).
- **Interactive Details:** Buttons and input fields use the primary 4px radius. 
- **Clipping:** Use "Notched Corners" (45-degree angled cuts) for high-priority mission buttons to reinforce the military-grade aesthetic.

## Components
- **Dashboard Cards:** Must feature a `1px` border using a semi-transparent version of the primary or neutral-medium color. Headers should have a subtle horizontal gradient background.
- **Holographic Buttons:** Primary buttons use a solid Neon Cyan fill with black text. Secondary buttons use a "Ghost" style: transparent background, Cyan border, and a subtle Cyan outer glow on hover.
- **Data Tables:** Row lines should be faint (`rgba(255,255,255,0.05)`). Hovering over a row should trigger a "scanning" highlight—a subtle Cyan vertical line on the left edge.
- **Chips/Status Tags:** Use a semi-transparent fill of the status color (Red/Green/Amber) at 10% opacity with a 100% opacity text and border.
- **Inputs:** Dark backgrounds with a bottom-only border that glows (expands from center) when focused.
- **Specialty Components:** 
    - **Threat Level Meter:** A vertical segment-based gauge.
    - **Coordinates HUD:** A floating mono-spaced text overlay for map views.
    - **AI Pulse:** A glowing, animated waveform icon used when the AI is processing data.