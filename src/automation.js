// Automation - Parameter automation with breakpoint curves

export class AutomationLane {
  constructor(track, param) {
    this.track = track;
    this.param = param;
    this.points = [];
    this.armed = false;
  }

  addPoint(time, value) {
    this.points.push({ time, value });
    this.points.sort((a, b) => a.time - b.time);
  }

  removePoint(index) {
    if (index >= 0 && index < this.points.length) {
      this.points.splice(index, 1);
    }
  }

  clear() {
    this.points = [];
  }

  getValueAt(time) {
    if (this.points.length === 0) return null;
    if (this.points.length === 1) return this.points[0].value;

    let prevPoint = this.points[0];
    let nextPoint = this.points[this.points.length - 1];

    for (let i = 0; i < this.points.length - 1; i++) {
      if (time >= this.points[i].time && time <= this.points[i + 1].time) {
        prevPoint = this.points[i];
        nextPoint = this.points[i + 1];
        break;
      }
    }

    if (time <= this.points[0].time) return this.points[0].value;
    if (time >= this.points[this.points.length - 1].time)
      return this.points[this.points.length - 1].value;

    const duration = nextPoint.time - prevPoint.time;
    if (duration === 0) return prevPoint.value;

    const progress = (time - prevPoint.time) / duration;
    return prevPoint.value + (nextPoint.value - prevPoint.value) * progress;
  }

  export() {
    return {
      track: this.track,
      param: this.param,
      points: [...this.points],
    };
  }

  import(data) {
    this.track = data.track;
    this.param = data.param;
    this.points = [...data.points];
  }
}

export class AutomationManager {
  constructor() {
    this.lanes = new Map();
    this.recording = false;
    this.armedLanes = new Set();
  }

  createLane(track, param) {
    const key = `${track}:${param}`;
    if (!this.lanes.has(key)) {
      this.lanes.set(key, new AutomationLane(track, param));
    }
    return this.lanes.get(key);
  }

  getLane(track, param) {
    const key = `${track}:${param}`;
    return this.lanes.get(key);
  }

  armLane(track, param) {
    const lane = this.getLane(track, param);
    if (lane) {
      lane.armed = true;
      this.armedLanes.add(lane);
    }
  }

  disarmLane(track, param) {
    const lane = this.getLane(track, param);
    if (lane) {
      lane.armed = false;
      this.armedLanes.delete(lane);
    }
  }

  startRecording() {
    this.recording = true;
  }

  stopRecording() {
    this.recording = false;
  }

  recordValue(track, param, time, value) {
    if (!this.recording) return;
    const lane = this.getLane(track, param);
    if (lane?.armed) {
      lane.addPoint(time, value);
    }
  }

  getValuesAt(time) {
    const values = {};
    this.lanes.forEach((lane, key) => {
      const value = lane.getValueAt(time);
      if (value !== null) {
        values[key] = value;
      }
    });
    return values;
  }

  clear() {
    this.lanes.clear();
    this.armedLanes.clear();
  }
}
