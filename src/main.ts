import './style.css';
import { SimulationSource } from './sensors';
import { HouseScene, type ViewMode } from './scene';
import { componentDescription } from './model-rules';

const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const simulation = new SimulationSource();
let scene: HouseScene | undefined;

function select(name: string | null) {
  element('selection').hidden = !name;
  if (name) { element('selection-name').textContent = name.replace(/ feature\b/gi, '').replace(/\s+/g, ' '); element('selection-description').textContent = componentDescription(name); }
}
try {
  scene = new HouseScene({
    host: element('scene'), source: simulation,
    onLoad: count => { element('model-status').hidden = true; element('model-error').hidden = true; element('scene').dataset.meshCount = String(count); },
    onError: () => {
      element('model-status').hidden = true; element('model-error').hidden = false;
      element('error-detail').textContent = 'The CAD asset is unavailable or could not be read. Check the model file, then try again.';
    },
    onSelect: select,
  });
} catch {
  element('model-status').hidden = true; element('model-error').hidden = false;
  element('error-detail').textContent = '3D rendering could not start. Enable WebGL in your browser, then reload this page.';
  element('retry-model').textContent = 'Reload page';
}
element('retry-model').addEventListener('click', () => {
  if (!scene) { location.reload(); return; }
  element('model-error').hidden = true; element('model-status').hidden = false; void scene.load();
});
function setView(view: ViewMode) {
  scene?.setView(view);
  ['orbit', 'interior'].forEach(mode => {
    element(`${mode}-view`).classList.toggle('active', mode === view);
    element(`${mode}-view`).setAttribute('aria-pressed', String(mode === view));
  });
  const interior = view === 'interior';
  element('camera-notice').hidden = !interior;
  element<HTMLInputElement>('cutaway-toggle').disabled = interior;
  element<HTMLInputElement>('explode-toggle').disabled = interior;
}
element('orbit-view').addEventListener('click', () => setView('orbit'));
element('interior-view').addEventListener('click', () => setView('interior'));
element('reset-view').addEventListener('click', () => scene?.resetView());
element('roof-toggle').addEventListener('change', event => scene?.setRoof((event.target as HTMLInputElement).checked));
element('cutaway-toggle').addEventListener('change', event => scene?.setCutaway((event.target as HTMLInputElement).checked));
element('explode-toggle').addEventListener('change', event => scene?.setExploded((event.target as HTMLInputElement).checked));
element('close-selection').addEventListener('click', () => scene?.clearSelection());
element('temperature-control').addEventListener('input', event => {
  const value = +(event.target as HTMLInputElement).value;
  simulation.setTemperature(value); element('temperature-output').textContent = `${value} °C`; clearPreset();
});
element('cat-toggle').addEventListener('change', event => { simulation.setCat((event.target as HTMLInputElement).checked); clearPreset(); });
element('play-toggle').addEventListener('click', () => {
  simulation.setPlaying(!simulation.isPlaying());
  element('play-toggle').textContent = simulation.isPlaying() ? 'Pause demo' : 'Play demo';
  element('play-toggle').setAttribute('aria-pressed', String(simulation.isPlaying()));
  element('demo-state').textContent = simulation.isPlaying() ? 'Demo running' : 'Demo paused';
});
function clearPreset() { document.querySelectorAll('[data-preset]').forEach(button => { button.classList.remove('selected'); button.setAttribute('aria-pressed', 'false'); }); }
document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(button => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    const preset = button.dataset.preset as 'cold' | 'comfortable' | 'empty';
    simulation.preset(preset); clearPreset(); button.classList.add('selected'); button.setAttribute('aria-pressed', 'true');
    const value = preset === 'cold' ? 12 : 23;
    element<HTMLInputElement>('temperature-control').value = String(value);
    element('temperature-output').textContent = `${value} °C`;
    element<HTMLInputElement>('cat-toggle').checked = preset !== 'empty';
  });
});
simulation.subscribe(reading => {
  element('temperature').textContent = reading.temperatureC.toFixed(1);
  element('humidity').textContent = reading.humidityPct.toFixed(1);
  element('distance').textContent = reading.distanceCm.toFixed(1);
  element('confidence').textContent = reading.catPresent ? `${Math.round(reading.catConfidence * 100)}%` : 'No cat detected';
  element('heater').textContent = reading.heaterOn ? 'On · Heating' : 'Off';
  element('heater-indicator').classList.toggle('on', reading.heaterOn);
  element('presence-tag').textContent = reading.catPresent ? 'Cat present' : 'House empty';
  element('presence-tag').classList.toggle('empty', !reading.catPresent);
  const date = new Date(reading.timestamp);
  element<HTMLTimeElement>('reading-time').dateTime = reading.timestamp;
  element('reading-time').textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
});
window.addEventListener('pagehide', () => { simulation.dispose(); scene?.dispose(); });
