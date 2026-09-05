// Automation Tests

import { AutomationLane, AutomationManager } from '../src/automation.js';

describe('AutomationLane', () => {
  let lane;

  beforeEach(() => {
    lane = new AutomationLane(0, 'volume');
  });

  test('initializes with empty points', () => {
    expect(lane.points.length).toBe(0);
    expect(lane.track).toBe(0);
    expect(lane.param).toBe('volume');
  });

  test('addPoint adds and sorts points', () => {
    lane.addPoint(2, 0.8);
    lane.addPoint(1, 0.5);
    lane.addPoint(3, 1.0);

    expect(lane.points.length).toBe(3);
    expect(lane.points[0].time).toBe(1);
    expect(lane.points[1].time).toBe(2);
    expect(lane.points[2].time).toBe(3);
  });

  test('removePoint removes point', () => {
    lane.addPoint(1, 0.5);
    lane.addPoint(2, 0.8);

    lane.removePoint(0);

    expect(lane.points.length).toBe(1);
    expect(lane.points[0].time).toBe(2);
  });

  test('clear removes all points', () => {
    lane.addPoint(1, 0.5);
    lane.addPoint(2, 0.8);

    lane.clear();

    expect(lane.points.length).toBe(0);
  });

  test('getValueAt returns null for empty lane', () => {
    expect(lane.getValueAt(1)).toBeNull();
  });

  test('getValueAt returns value for single point', () => {
    lane.addPoint(1, 0.5);

    expect(lane.getValueAt(0)).toBe(0.5);
    expect(lane.getValueAt(1)).toBe(0.5);
    expect(lane.getValueAt(2)).toBe(0.5);
  });

  test('getValueAt interpolates between points', () => {
    lane.addPoint(0, 0);
    lane.addPoint(2, 1);

    expect(lane.getValueAt(0)).toBe(0);
    expect(lane.getValueAt(1)).toBeCloseTo(0.5, 2);
    expect(lane.getValueAt(2)).toBe(1);
  });

  test('export and import preserve state', () => {
    lane.addPoint(1, 0.5);
    lane.addPoint(2, 0.8);

    const exported = lane.export();

    const newLane = new AutomationLane(1, 'pan');
    newLane.import(exported);

    expect(newLane.track).toBe(0);
    expect(newLane.param).toBe('volume');
    expect(newLane.points.length).toBe(2);
  });
});

describe('AutomationManager', () => {
  let manager;

  beforeEach(() => {
    manager = new AutomationManager();
  });

  test('createLane creates new lane', () => {
    const lane = manager.createLane(0, 'volume');

    expect(lane).toBeDefined();
    expect(lane.track).toBe(0);
    expect(lane.param).toBe('volume');
  });

  test('createLane returns existing lane', () => {
    const lane1 = manager.createLane(0, 'volume');
    const lane2 = manager.createLane(0, 'volume');

    expect(lane1).toBe(lane2);
  });

  test('armLane and disarmLane work', () => {
    manager.createLane(0, 'volume');

    manager.armLane(0, 'volume');
    expect(manager.armedLanes.size).toBe(1);

    manager.disarmLane(0, 'volume');
    expect(manager.armedLanes.size).toBe(0);
  });

  test('recordValue adds point when armed and recording', () => {
    manager.createLane(0, 'volume');
    manager.armLane(0, 'volume');
    manager.startRecording();

    manager.recordValue(0, 'volume', 1.0, 0.5);

    const lane = manager.getLane(0, 'volume');
    expect(lane.points.length).toBe(1);
  });

  test('recordValue does not add point when not recording', () => {
    manager.createLane(0, 'volume');
    manager.armLane(0, 'volume');

    manager.recordValue(0, 'volume', 1.0, 0.5);

    const lane = manager.getLane(0, 'volume');
    expect(lane.points.length).toBe(0);
  });

  test('clear removes all lanes', () => {
    manager.createLane(0, 'volume');
    manager.createLane(1, 'pan');

    manager.clear();

    expect(manager.lanes.size).toBe(0);
  });
});
