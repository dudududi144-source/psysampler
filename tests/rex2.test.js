// REX2 Parser Tests

import { REX2Parser } from '../src/rex2-parser.js';

describe('REX2Parser', () => {
  let parser;

  beforeEach(() => {
    parser = new REX2Parser();
  });

  test('initializes with version 2.0', () => {
    expect(parser.version).toBe('2.0');
  });

  test('export creates valid REX2 buffer', () => {
    const loopData = {
      tempo: 140,
      signature: { numerator: 4, denominator: 4 },
      slices: [
        { start: 0, end: 1, reverse: false, mute: false },
        { start: 1, end: 2, reverse: true, mute: false },
      ],
    };

    const buffer = parser.export(loopData);
    const view = new DataView(buffer);

    expect(
      String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)),
    ).toBe('REX2');
    expect(view.getFloat32(8, true)).toBe(140);
    expect(view.getUint32(16, true)).toBe(2);
  });

  test('validate accepts valid data', () => {
    const validData = {
      tempo: 140,
      signature: { numerator: 4, denominator: 4 },
      slices: [],
    };

    expect(parser.validate(validData)).toBe(true);
  });

  test('validate rejects invalid tempo', () => {
    const invalidTempo = {
      tempo: 10,
      signature: { numerator: 4, denominator: 4 },
      slices: [],
    };

    expect(parser.validate(invalidTempo)).toBe(false);
  });
});
