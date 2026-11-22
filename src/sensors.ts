export interface SensorReading {
  source: 'simulation' | 'live';
  connection: 'simulating' | 'connected' | 'disconnected';
  timestamp: string;
  temperatureC: number;
  humidityPct: number;
  distanceCm: number;
  catPresent: boolean;
  catConfidence: number;
  heaterOn: boolean;
}

export interface SensorSource {
  subscribe(listener: (reading: SensorReading) => void): () => void;
  getSnapshot(): SensorReading;
  dispose(): void;
}

export const heaterRule = (temperatureC: number, catPresent: boolean) => catPresent && temperatureC < 20;

/** Browser-local demonstration only. Replace this adapter when hardware is ready. */
export class SimulationSource implements SensorSource {
  private listeners = new Set<(reading: SensorReading) => void>();
  private elapsed = 0;
  private baseTemperature = 18;
  private baseHumidity = 54;
  private cat = true;
  private playing = true;
  private timer: ReturnType<typeof setInterval>;
  private reading: SensorReading;

  constructor() {
    this.reading = this.makeReading();
    this.timer = setInterval(() => {
      if (!this.playing) return;
      this.elapsed += 0.5;
      this.emit();
    }, 500);
  }

  private makeReading(): SensorReading {
    const temperatureC = +(this.baseTemperature + (this.playing ? Math.sin(this.elapsed / 17) * 0.35 : 0)).toFixed(1);
    return {
      source: 'simulation', connection: 'simulating', timestamp: new Date().toISOString(),
      temperatureC,
      humidityPct: +(this.baseHumidity + (this.playing ? Math.sin(this.elapsed / 21) * 2 : 0)).toFixed(1),
      distanceCm: +(this.cat ? 24 + Math.sin(this.elapsed / 4) * 1.3 : 68 + Math.sin(this.elapsed / 8) * 0.5).toFixed(1),
      catPresent: this.cat, catConfidence: this.cat ? +(0.97 + Math.sin(this.elapsed / 7) * 0.012).toFixed(3) : 0,
      heaterOn: heaterRule(temperatureC, this.cat),
    };
  }

  private emit() { this.reading = this.makeReading(); this.listeners.forEach(listener => listener(this.reading)); }
  getSnapshot() { return this.reading; }
  subscribe(listener: (reading: SensorReading) => void) { this.listeners.add(listener); listener(this.reading); return () => { this.listeners.delete(listener); }; }
  setTemperature(value: number) { this.baseTemperature = Math.min(30, Math.max(5, value)); this.emit(); }
  setCat(value: boolean) { this.cat = value; this.emit(); }
  setPlaying(value: boolean) { this.playing = value; this.emit(); }
  isPlaying() { return this.playing; }
  preset(preset: 'cold' | 'comfortable' | 'empty') {
    this.elapsed = 0;
    this.baseTemperature = preset === 'cold' ? 12 : 23;
    this.baseHumidity = preset === 'cold' ? 63 : 49;
    this.cat = preset !== 'empty';
    this.emit();
  }
  dispose() { clearInterval(this.timer); this.listeners.clear(); }
}
