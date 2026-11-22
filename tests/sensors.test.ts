import test from 'node:test';
import assert from 'node:assert/strict';
import { SimulationSource, heaterRule } from '../src/sensors.ts';
import { CAD_TO_GLTF, CAMERA_POSITION, isCat, isRoof, isCutaway } from '../src/model-rules.ts';

test('heater responds to presence and the exact 20 C boundary', () => {
  assert.equal(heaterRule(19.9, true), true);
  assert.equal(heaterRule(20, true), false);
  assert.equal(heaterRule(12, false), false);
});

test('simulation publishes consistent scenarios, timestamps and occupancy', () => {
  const source = new SimulationSource();
  try {
    source.setPlaying(false);
    const events: string[] = [];
    const unsubscribe = source.subscribe(reading => events.push(reading.timestamp));
    source.preset('cold');
    assert.equal(source.getSnapshot().heaterOn, true);
    assert.equal(source.getSnapshot().temperatureC, 12);
    source.preset('comfortable');
    assert.equal(source.getSnapshot().heaterOn, false);
    source.preset('empty');
    assert.equal(source.getSnapshot().catPresent, false);
    assert.equal(source.getSnapshot().catConfidence, 0);
    assert.ok(source.getSnapshot().distanceCm > 60);
    source.setTemperature(5); source.setCat(true);
    assert.equal(source.getSnapshot().heaterOn, true);
    assert.equal(source.getSnapshot().source, 'simulation');
    assert.equal(source.getSnapshot().connection, 'simulating');
    assert.ok(events.every(timestamp => Number.isFinite(Date.parse(timestamp))));
    const count = events.length; unsubscribe(); source.setCat(false);
    assert.equal(events.length, count);
  } finally { source.dispose(); }
});

test('CAD millimetres map to glTF metres with front on positive Z', () => {
  assert.deepEqual(CAD_TO_GLTF([31, 320, 177]), [...CAMERA_POSITION]);
  assert.deepEqual(CAD_TO_GLTF([0, -400, 0]), [0, 0, 0.4]);
});

test('semantic visibility matches the actual exported names', () => {
  assert.equal(isCat('Cat_head Cat_Root'), true);
  assert.equal(isCat('Camera lens glass'), false);
  assert.equal(isRoof('Right_removable_roof'), true);
  assert.equal(isCutaway('Front insulated gable'), true);
  assert.equal(isCutaway('Rear insulated gable'), false);
});
