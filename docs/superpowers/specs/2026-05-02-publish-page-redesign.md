# Publish Page Redesign - "Frosted Playground"

## 1. Overview
Redesign the `Publish` page (`src/pages/Publish.tsx`) to match the "Frosted Playground" aesthetic: glassmorphism, high-blur backgrounds, vibrant gradients, and elastic interactions.

## 2. Design Details

### 2.1 Layout & Atmosphere
- **Container:** Full-screen height with `bg-transparent`.
- **Blur Overlay:** A `fixed` inset layer with `backdrop-blur-3xl` and `bg-white/10` to create the frosted effect over the global mesh gradient.
- **Scroll Behavior:** Hide scrollbar while maintaining functionality.

### 2.2 Header
- **Structure:** `flex justify-between items-center px-4 py-3`.
- **Back Button:** `X` icon from `lucide-react`. Glass circle background (`bg-white/20`), `elastic-press`.
- **Title:** "发布" (Publish) using `font-display` (Plus Jakarta Sans), `text-white`, `font-bold`.
- **Publish Button:** Pill shape, `bg-gradient-to-r from-primary to-accent`, `text-white`, `font-bold`, `elastic-press`, `shadow-lg shadow-primary/20`.

### 2.3 Input Area
- **Textarea:** 
  - `bg-transparent`, `border-none`, `outline-none`.
  - `text-xl`, `font-medium`, `text-white`, `placeholder:text-white/40`.
  - `resize-none`, `flex-1`.
  - Padding: `px-6 py-4`.

### 2.4 Media Section
- **Image Preview Grid:** 
  - `grid grid-cols-3 gap-3 px-4`.
  - Images: `aspect-square`, `rounded-2xl`, `object-cover`, `ring-1 ring-white/20`.
  - Remove Button: Floating glass circle at top-right of each image.
- **Add More Button:** 
  - Glass card with `ring-2 ring-dashed ring-white/20`.
  - `Plus` icon in `text-white/60`.

### 2.5 Toolbar
- **Floating Bar:** 
  - Positioned at the bottom (above keyboard area or fixed bottom).
  - Material: `glass` (from `index.css`).
  - Rounded capsule shape (`rounded-full`).
  - Icons: Camera, Gallery, Emoji, Hash, MapPin.
  - Colors: Use vibrant gradients or consistent theme colors for icons.

### 2.6 Settings (Anonymous, Visibility, etc.)
- **Items:** `glass` cards or rows with `rounded-2xl`.
- **Toggle:** Redesigned with `bg-accent` for active state.
- **Text:** `text-white` for primary labels, `text-white/60` for secondary.

## 3. Technical Implementation
- **Icons:** `lucide-react`.
- **Styling:** Tailwind CSS v4 utility classes (`glass`, `elastic-press`, `bg-primary`, etc.).
- **Transitions:** CSS transitions for all interactive elements.

## 4. Accessibility
- Ensure placeholder text contrast is sufficient (use `white/40` or `white/50`).
- Touch targets for buttons are at least 44x44px.
