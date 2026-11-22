# Cici / Cat House

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Delegated implementation: Three.js with TypeScript and Vite. Bundled browser assets; no runtime CDN dependency.

## Users
Jimmy is exploring the completed Cat House CAD design, its equipment placement, and a temporary sensor simulation before adding real sensor data.

## Product Purpose
Explore the actual textured model, switch between orbit and its physical interior camera position, and exercise simulated environmental and occupancy states.

## Capabilities and Constraints
The authoritative asset is `public/models/cat-house.glb`, exported from the existing CAD geometry. The house body is 450 × 800 mm. CAD axes map to glTF as `[x,z,-y]`. All readings, heater behavior and camera detection are simulated and explicitly labeled. No live sensor endpoint exists. The interior camera is a synthetic 3D view from the camera lens location.

## Brand Commitments
Name: Cici / Cat House. Brief-pinned dark graphite UI, dominant 3D model, right sensor panel, responsive mobile layout.

## Evidence on Hand
Existing CAD and export asset supplied by the parent task. No real hardware stream or live camera feed is available.

## Product Principles
Preserve geometry and semantic component names. Make simulation unmistakable. Keep the 3D artifact central. Prepare a replaceable sensor source.

## Assumptions
This subagent has no user-facing interview path. The implementation brief is the product record; no additional audience, commercial claims or preferences are inferred. Code-first app implementation is a session choice, not a stored user workflow preference.
