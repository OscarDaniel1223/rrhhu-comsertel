---
name: Connectivity Core
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444653'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#003272'
  on-tertiary: '#ffffff'
  tertiary-container: '#00489e'
  on-tertiary-container: '#9cbbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  card-gap: 20px
  section-margin: 32px
---

## Brand & Style

This design system is built for the high-stakes environment of telecommunications infrastructure and management. The brand personality is rooted in **reliability, precision, and architectural clarity**. It conveys a sense of stable connectivity and enterprise-grade power without the clunky overhead of legacy software.

The chosen style is **Corporate / Modern**. It prioritizes functional density and logical grouping over decorative flair. By utilizing generous whitespace and a restricted, professional color palette, the UI directs the user’s focus toward critical performance metrics and system health. The emotional response is one of "calm control"—knowing that the network is stable and the data is accurate.

## Colors

The palette is anchored by **Deep Corporate Blue**, symbolizing trust and authority in the telecom sector. This is complemented by **Slate Grays** that manage the visual weight of secondary information and borders.

- **Primary Blue:** Used for brand presence, primary actions, and active states.
- **Support Blue:** A lighter, more vibrant blue used for highlights and informational accents.
- **Slate System:** A range of grays used for typography and structural elements to prevent the interface from feeling "heavy."
- **Backgrounds:** Clean white for primary surfaces, with a very light slate tint for the global canvas to create a subtle contrast with white cards.
- **Functional Colors:** Standardized Red (Error/Down), Amber (Warning), and Emerald (Active/Up) to provide immediate status feedback.

## Typography

This design system utilizes **Inter** exclusively to ensure maximum readability across technical dashboards and data-heavy views. Inter’s tall x-height and excellent legibility make it ideal for the Telecommunications sector where reading IP addresses, coordinates, and signal strengths is common.

The hierarchy is strictly maintained to differentiate between "System Context" (Headlines) and "Actionable Data" (Body/Labels). A specialized **Data Mono** style is used for numeric values and identifiers to ensure character alignment and rapid scanning.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with a max-width container for ultra-wide displays. It uses a 12-column system that adapts to screen real estate.

- **Dashboard Layout:** Utilizes a fixed left-hand navigation rail (narrow) to maximize the horizontal space for data visualization.
- **Card-Based Architecture:** Instead of long, scrolling tables, information is grouped into semantic cards. These cards can span 3, 4, 6, or 12 columns depending on the complexity of the data.
- **Rhythm:** An 8px base unit drives all padding and margins, ensuring a mathematical harmony throughout the interface.

## Elevation & Depth

To create a professional and modern feel, this design system uses **Tonal Layers** combined with **Ambient Shadows**. 

1.  **Canvas (Level 0):** The background layer, colored in a very soft slate gray to reduce eye strain.
2.  **Cards & Surfaces (Level 1):** Pure white surfaces with a subtle 1px border (#E2E8F0) and a soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)).
3.  **Interactive Elements (Level 2):** Buttons and dropdowns feature a slightly more pronounced shadow upon hover to indicate clickability.
4.  **Overlays (Level 3):** Modals and slide-outs use a backdrop blur (blur-md) and a high-contrast shadow to focus user attention.

## Shapes

The shape language is consistently **Rounded**, striking a balance between the "square" rigidity of legacy telecom software and the "circular" softness of consumer apps. 

- **Cards & Modals:** Use a 1rem (16px) radius to create a containerized, modern feel.
- **Buttons & Inputs:** Use a 0.5rem (8px) radius for a precise, professional look.
- **Status Indicators:** Use a pill-shaped (fully rounded) geometry to distinguish them from interactive buttons.

## Components

### Buttons
Primary buttons use the Corporate Blue background with white text. Secondary buttons use a slate border and no fill. For destructive actions, a subtle red outline is preferred over a solid red fill to maintain the professional tone.

### Data Cards
Cards are the primary vehicle for information. Each card should have a clear `title-sm` header, often accompanied by a small icon or status badge. Content within cards should use flexible flexbox layouts rather than rigid tables.

### Modern List Views
Where lists are necessary, avoid visible vertical grid lines. Use horizontal separators with high transparency and generous vertical padding (16px) between rows. Every row should have a clear "primary" data point in bold.

### Input Fields
Inputs are defined by clean 1px borders. Focus states use a 2px primary blue ring with a soft outer glow. Labels are always positioned above the input in `label-caps` for clarity.

### KPI Blocks
Specialized components for displaying critical metrics (e.g., "Active Connections"). These feature a large `display-lg` number, a concise label, and a sparkline or percentage indicator for trend analysis.

### Status Badges
Small, rounded-pill components used to indicate "Online," "Offline," or "Maintenance." These use high-contrast text on low-opacity backgrounds (e.g., dark green text on light green background) for readability without being overwhelming.