# Cici / Cat House web app

Three.js exploration of the actual CAD assembly. All sensor values, occupancy, detection and heater state are **simulated locally**. The interior camera is a synthetic 3D render, not a real video stream.

```sh
npm install
npm test
npm run build
npm run dev
```

Local URL: http://127.0.0.1:4173. Static production output: `dist/`.

## Model

`public/models/cat-house.glb` is the textured asset exported from Blender from the CAD bodies. The model is in metres; CAD `[x,y,z]` millimetres map to glTF `[x,z,-y] / 1000`. The default displays the entire house. Roof, cutaway and exploded controls are optional. Interior view restores cutaway/exploded geometry while honoring the user's roof visibility choice.

The app takes the exported **Sensor_Camera** node's world position, quaternion, vertical field of view and near clip. The current camera is at approximately `[0.031, 0.177, -0.319]` metres. A documented physical-position fallback exists only for older exports lacking that camera. Pan/orbit/zoom apply to Global view. Mesh picking shows semantic component details. GLB failure displays a retry state; no substitute house is rendered.

## Sensor adapter contract

`src/sensors.ts` exports `SensorReading` and `SensorSource`.

- `subscribe(listener)` immediately provides the current reading, then subsequent updates; returns an unsubscribe function.
- `getSnapshot()` returns the most recent immutable-by-convention reading.
- `dispose()` closes timers or future hardware connections.
- Readings carry an ISO 8601 `timestamp`, `source` (`simulation` or `live`), and `connection` (`simulating`, `connected`, `disconnected`).
- Units: `temperatureC` Celsius, `humidityPct` relative humidity percent, `distanceCm` centimetres, `catConfidence` 0–1. `catPresent` and `heaterOn` are booleans.

`SimulationSource` is independent of Three.js and the DOM. Both UI and scene subscribe to it. Play introduces slow deterministic variation; Pause freezes automatic updates. Controls still publish immediately while paused. The illustrative heater rule is `catPresent && temperatureC < 20`. It does not control hardware.

For real data, implement a `LiveSource` conforming to this interface, validate incoming readings/units and timestamps, explicitly signal disconnection/staleness, and inject it in `src/main.ts`. Update visible source labeling, distinguish device-reported heater status from demo rules, and remove simulation controls when a live source is active. No endpoint or credentials are embedded or assumed. Real hardware must supply and enforce its own control/safety logic.

## Assets and accessibility

Three.js is bundled locally. Font: Adwaita Sans (OFL), self-hosted in `public/fonts/`. GLB textures are embedded. Controls use native buttons, checkboxes and range inputs with visible keyboard focus. Layout places sensors below the canvas on mobile. Reduced motion disables decorative loading animation; the 3D model has no automatic camera movement or cat animation.

## GitHub Pages

The `Deploy simulator to GitHub Pages` workflow tests and builds this app on every push to `main`, then publishes `dist/`. In the repository's **Settings → Pages**, select **GitHub Actions** as the build source. The first deployment then produces the public site URL.

Relative asset URLs support the `/cat-house-simulator/` repository path while keeping `npm run dev` working at the local root. The model and font are bundled; no credentials or live sensor endpoint are needed by the published app.
