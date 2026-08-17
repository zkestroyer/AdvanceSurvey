---
id: "doc-07"
title: "Design Handoff and Tokens"
status: "draft"
version: "1.0.0"
---
# 04: The Master UI/UX Aesthetic Constitution & Design Tokens

> **CRITICAL RULE FOR ALL AI AGENTS & DEVELOPERS:**
> This software house DOES NOT build basic, generic, or boring user interfaces. Every single Web and Mobile application must look "Devastatingly Premium" (Tabahi qism ka UI). 
> While we take the Client's Colors and Logo from the Onboarding Questionnaire, **OUR STRUCTURAL AESTHETICS ARE FIXED AND NON-NEGOTIABLE**. 

---

## 1. The Core Aesthetic Philosophy
Every project delivered by this swarm MUST strictly adhere to the following 6 principles:
1. **Light Mode Default (MANDATORY):** **Light Mode is the absolute default** for all development. The AI must structure the codebase for Light Mode first, ensuring a clean, airy, high-contrast base. Dark Mode is an always-included, secondary toggle option.
2. **Bento Box & Whitespace:** Use modern "Bento Box" style grid layouts for dashboards. Interfaces must breathe; use generous whitespace and padding (`p-6` or `p-8` for containers) to avoid clutter.
3. **Glassmorphism & Gradients:** UIs must feel layered. Use translucent backgrounds over subtle, blurred radial gradients to avoid "dead" white spaces. No flat, dead containers.
4. **Fluid Micro-Interactions:** Buttons must bounce or scale on hover, active, and focus-visible states. Transitions must be buttery smooth (`300ms ease-out`).
5. **High-Contrast Typography:** Browser default fonts are strictly banned. Use `Inter`, `Outfit`, or `Space Grotesk`. Establish visual hierarchy using strong font weights (e.g., `font-bold` for primary, `font-medium` for secondary) rather than just varying sizes.
6. **Data Visualization & Fancy Graphs:** Dashboards must include rich, visually stunning, animated charts and graphs. Data presentation should be breathtaking, using smooth gradients and modern chart libraries.

---

## 2. Client Branding Injection (Dynamic Variables)
*The client's identity is injected into our Master UI structural engine.*

- **Client Brand Identity:** [e.g., Healthcare Professional, Aggressive Fintech, Neon Cyberpunk]
- **Primary Brand Color (Hex):** `#______` -> Maps to CSS `--color-primary`
- **Secondary Accent Color (Hex):** `#______` -> Maps to CSS `--color-accent`
- **Background Base:** We default to Deep Space Dark (`#030712`) or Frosted Light (`#F8FAFC`) depending on client preference.

---

## 3. Web Development Standards (React + Tailwind CSS)
*When building for the Web, you MUST use these predefined Tailwind aesthetic patterns.*

### A. The Glass Panel (Cards & Containers)
Never use a solid white or solid black box. Use the frosted glass effect:
```css
/* Tailwind Standard Class List for Containers */
.glass-panel {
  @apply bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl;
}
/* For Dark Mode */
.glass-panel-dark {
  @apply bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl;
}
```

### B. The Premium Button (CTA)
Buttons must feel alive and tactile.
```css
.btn-premium {
  @apply bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300;
}
```

### C. Text & Gradients
Headings should often use background clipping for a high-end feel.
```css
.text-gradient {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400;
}
```

---

## 4. Mobile App Standards (Flutter)
*When building for iOS/Android, the Web Aesthetics must flawlessly translate into Flutter code.*

### A. The Glass Container (Flutter Translation)
Instead of standard `Container` widgets, use `ClipRRect` with `BackdropFilter`:
```dart
// The Standard Mobile Glass Container
ClipRRect(
  borderRadius: BorderRadius.circular(24.0),
  child: BackdropFilter(
    filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
    child: Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
        borderRadius: BorderRadius.circular(24.0),
      ),
      child: child,
    ),
  ),
)
```

### B. Tactile Animations
Never use a generic `ElevatedButton`. Wrap tappable areas in `GestureDetector` or use animation packages to create a "squeeze/bounce" effect when the user taps the screen.

---

## 5. Global Spacing & Layout Tokens
- **Border Radius:** We do not use sharp edges. Minimum radius is `12px` (Mobile) and `16px` (Web).
- **Paddings:** Interfaces must breathe. Minimum container padding is `24px` (`p-6` in Tailwind).
- **Responsive Breakpoints:** 
  - Mobile: `< 768px`
  - Tablet: `768px - 1024px`
  - Desktop: `> 1024px` (Always constrain max-width to `1280px` centered, never let UIs stretch infinitely on ultrawides).

---
**Sign-off Check:**
- [ ] UI perfectly maps to the "Software House Master Aesthetic".
- [ ] Client's branding colors have been mathematically mapped to Primary/Secondary tokens.
- [ ] Transitions and Hover states are implemented.
