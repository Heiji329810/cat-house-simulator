export const CAMERA_POSITION = [0.031, 0.177, -0.320] as const;
export const CAMERA_TARGET = [0, 0.105, 0.13] as const;
export const CAD_TO_GLTF = ([x, y, z]: readonly number[]) => [x / 1000, z / 1000, -y / 1000];
export const normalizedName = (name: string) => name.toLowerCase().replace(/[_-]+/g, ' ');
export const isCat = (name: string) => /\bcat\b|\bcici\b/.test(normalizedName(name));
export const isRoof = (name: string) => /removable roof/.test(normalizedName(name));
export const isCutaway = (name: string) => /front insulated gable|right insulated wall|clear entrance flap/.test(normalizedName(name));
export const isHeater = (name: string) => /black heating strip/.test(normalizedName(name));
export function componentDescription(name: string) {
  const value = normalizedName(name);
  if (/camera|lens/.test(value)) return 'Interior camera assembly. Use Interior camera to see its synthetic 3D viewpoint.';
  if (/ultrasonic/.test(value)) return 'Ultrasonic occupancy sensor. Distance and presence are simulated in this demo.';
  if (/temperature|humidity|upper sensor/.test(value)) return 'Temperature and humidity sensor. Readings are generated locally for this demo.';
  if (/heating|heater/.test(value)) return 'Heating strip. Demo rule: on below 20 °C while the cat is present.';
  if (/relay/.test(value)) return 'Relay assembly. Its simulated state follows the heater rule.';
  if (/cat|cici/.test(value)) return 'Cici, a stylized cat added for the interactive scene. Toggle Cat present to show or hide.';
  if (/roof/.test(value)) return 'Removable roof panel. Hide the roof to inspect the equipment and interior.';
  if (/wall|gable|floor/.test(value)) return 'Insulated Cat House component, preserved from the CAD model.';
  if (/lead|cable|loop/.test(value)) return 'Illustrative cable routing from the CAD assembly.';
  return 'Component from the Cat House CAD assembly. Placement follows the supplied design.';
}
