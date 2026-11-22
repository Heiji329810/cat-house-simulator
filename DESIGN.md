---
name: Cici / Cat House
description: A quiet graphite surround for the textured house and its simulated environment.
colors:
  leaf: "#c0ddbb"
  graphite: "#181d1c"
  panel: "#202724"
  stage: "#242a29"
  foreground: "#edf1ed"
  muted: "#a9b5af"
  divider: "#37403b"
  heat: "#e5be8f"
typography:
  display:
    fontFamily: "Adwaita, Arial, sans-serif"
    fontSize: "clamp(1.5rem, 2.3vw, 2rem)"
    fontWeight: 560
    lineHeight: 1.16
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Adwaita, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 560
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Adwaita, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontFamily: "Adwaita, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 550
rounded:
  control: "6px"
  group: "9px"
  overlay: "12px"
  workspace: "14px"
spacing:
  small: "8px"
  medium: "16px"
  group: "24px"
  large: "32px"
components:
  view-active:
    backgroundColor: "#e2ebdc"
    textColor: "#202a21"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  quiet-button:
    textColor: "#d4dfd5"
    backgroundColor: "#242b27"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "40px"
---

# Design System: Cici / Cat House

## Overview

The brief pins a modern dark graphite interface that lets the actual house lead. The shell uses green-tinted graphite surfaces, readable restrained type, and a pale leaf accent for selection and simulation controls. The model supplies the material and color richness.

**Key Characteristics:**

- A dominant 3D stage with calm surrounding controls.
- Flat tonal surfaces and compact familiar inputs.
- Clear simulation labeling and measured values.

## Colors

Leaf marks active controls and focus. Warm heat color identifies the heater reading. Graphite, panel and stage tones define structure without decorative borders; muted text retains a green tint.

**The State Color Rule.** Color reinforces a text label; it never carries state alone.

## Typography

Adwaita Sans is self-hosted and used throughout. Headings use moderate weight and compact tracking. Sensor values use tabular numerals. The view controls sit directly above the model, without a heading or subtitle overlay; component headings stay compact. Small metadata uses 12–13px and regular control labels use 14px.

## Layout

The desktop workspace has a flexible stage and 340px sensor panel, growing to 380px above 1600px. Below 800px, the panel moves below the model. A two-column panel collapses into one below 520px. The stage remains large enough to orbit on touch devices; controls anchor to its top and bottom edges.

## Elevation & Depth

The shell uses flat tonal layers. Only selected-component details lift with a diffuse downward shadow (`0 12px 30px #111a1480`). Rendered shadows belong to the physical 3D scene.

## Shapes

Controls have gentle corners, grouped controls slightly larger corners, and the workspace a rounded outer edge. Pills identify concise status. Selection uses a precise box in the scene.

## Components

View controls are standard grouped buttons with `aria-pressed`; active state uses a pale filled surface. The roof, cutaway and exploded controls are native checkboxes. Temperature is a range input. Cat presence is a labeled checkbox styled as a switch. All controls have a leaf-colored focus outline and explicit disabled states. Loading and error states cover the model area and keep recovery visible.

## Do's and Don'ts

- Do preserve readable source and simulation labels.
- Do keep the textured model as the primary visual material.
- Do use authored SVG strokes for simple interface icons.
- Don't communicate heater or occupancy state with color alone.
- Don't add automatic camera motion.

This record describes implemented source. Parent-task browser review remains the authority on final rendered fit and framing; no visual approval is implied by this file.

## Photo reference material finish

The browser corrects the exported wood material to match the saved Cat House photos: a warmer roof, darker brown wall panels, subdued grain and a satin finish. The source color image is excluded from the normal-map slot because it contains color rather than surface normals. Side-wall grain follows the panel length. Thin acrylic remains clear in the synthetic interior camera. Softer lighting keeps the wood and equipment readable without sharp white glare.
