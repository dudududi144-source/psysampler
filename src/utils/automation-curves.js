// Automation Curves
// Advanced automation curve generation and interpolation

export const CURVE_TYPES = {
  LINEAR: 'linear',
  EXPONENTIAL: 'exponential',
  LOGARITHMIC: 'logarithmic',
  SINE: 'sine',
  TRIANGLE: 'triangle',
  SQUARE: 'square',
  SAWTOOTH: 'sawtooth',
  BEZIER: 'bezier',
  STEPPED: 'stepped',
  SMOOTH: 'smooth'
};

export class AutomationCurve {
  constructor(type = CURVE_TYPES.LINEAR, tension = 0.5) {
    this.type = type;
    this.tension = tension;
  }

  interpolate(t) {
    switch (this.type) {
      case CURVE_TYPES.LINEAR:
        return t;
      
      case CURVE_TYPES.EXPONENTIAL:
        return Math.pow(t, 2);
      
      case CURVE_TYPES.LOGARITHMIC:
        return Math.sqrt(t);
      
      case CURVE_TYPES.SINE:
        return (1 - Math.cos(t * Math.PI)) / 2;
      
      case CURVE_TYPES.TRIANGLE:
        return t < 0.5 ? t * 2 : 2 - t * 2;
      
      case CURVE_TYPES.SQUARE:
        return t < 0.5 ? 0 : 1;
      
      case CURVE_TYPES.SAWTOOTH:
        return t;
      
      case CURVE_TYPES.BEZIER:
        return this.bezierInterpolate(t);
      
      case CURVE_TYPES.STEPPED:
        return Math.floor(t * 4) / 4;
      
      case CURVE_TYPES.SMOOTH:
        return t * t * (3 - 2 * t);
      
      default:
        return t;
    }
  }

  bezierInterpolate(t) {
    const p0 = 0;
    const p1 = this.tension;
    const p2 = 1 - this.tension;
    const p3 = 1;
    
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
  }

  generatePoints(numPoints = 100) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      points.push({ t, value: this.interpolate(t) });
    }
    return points;
  }
}

export class AutomationLane {
  constructor() {
    this.points = [];
    this.curveType = CURVE_TYPES.LINEAR;
    this.defaultValue = 0;
  }

  addPoint(time, value, curveType = null) {
    const point = { time, value, curveType: curveType || this.curveType };
    this.points.push(point);
    this.points.sort((a, b) => a.time - b.time);
    return point;
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
    if (this.points.length === 0) return this.defaultValue;
    if (time <= this.points[0].time) return this.points[0].value;
    if (time >= this.points[this.points.length - 1].time) {
      return this.points[this.points.length - 1].value;
    }

    // Find surrounding points
    let prevPoint = this.points[0];
    let nextPoint = this.points[1];
    
    for (let i = 1; i < this.points.length; i++) {
      if (this.points[i].time > time) {
        nextPoint = this.points[i];
        break;
      }
      prevPoint = this.points[i];
    }

    // Calculate interpolation
    const duration = nextPoint.time - prevPoint.time;
    const progress = (time - prevPoint.time) / duration;
    
    const curve = new AutomationCurve(nextPoint.curveType || this.curveType);
    const curvedProgress = curve.interpolate(progress);
    
    return prevPoint.value + (nextPoint.value - prevPoint.value) * curvedProgress;
  }

  getPoints() {
    return [...this.points];
  }

  setCurveType(type) {
    this.curveType = type;
  }

  export() {
    return {
      points: [...this.points],
      curveType: this.curveType,
      defaultValue: this.defaultValue
    };
  }

  import(data) {
    this.points = data.points || [];
    this.curveType = data.curveType || CURVE_TYPES.LINEAR;
    this.defaultValue = data.defaultValue || 0;
  }
}
