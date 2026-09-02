// REX2 Parser - Import/export REX2 files

export class REX2Parser {
  constructor() {
    this.version = '2.0';
  }

  // Parse REX2 file
  async parse(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const result = {
      version: this.version,
      tempo: 0,
      signature: { numerator: 4, denominator: 4 },
      slices: [],
      audio: null
    };

    // REX2 header (simplified - real format is proprietary)
    // This is a placeholder implementation
    const magic = String.fromCharCode(
      view.getUint8(0),
      view.getUint8(1),
      view.getUint8(2),
      view.getUint8(3)
    );

    if (magic !== 'REX2') {
      throw new Error('Invalid REX2 file');
    }

    // Parse tempo
    result.tempo = view.getFloat32(8, true);

    // Parse signature
    result.signature.numerator = view.getUint8(12);
    result.signature.denominator = view.getUint8(13);

    // Parse slices
    const numSlices = view.getUint32(16, true);
    for (let i = 0; i < numSlices; i++) {
      const offset = 20 + i * 12;
      const start = view.getFloat32(offset, true);
      const end = view.getFloat32(offset + 4, true);
      const flags = view.getUint32(offset + 8, true);

      result.slices.push({
        start,
        end,
        reverse: (flags & 1) !== 0,
        mute: (flags & 2) !== 0
      });
    }

    return result;
  }

  // Export to REX2 format
  export(loopData) {
    const { tempo, signature, slices, audio } = loopData;

    // Calculate buffer size
    const headerSize = 20;
    const sliceSize = slices.length * 12;
    const totalSize = headerSize + sliceSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // Write header
    this.writeString(view, 0, 'REX2');
    view.setFloat32(8, tempo, true);
    view.setUint8(12, signature.numerator);
    view.setUint8(13, signature.denominator);
    view.setUint32(16, slices.length, true);

    // Write slices
    slices.forEach((slice, i) => {
      const offset = 20 + i * 12;
      view.setFloat32(offset, slice.start, true);
      view.setFloat32(offset + 4, slice.end, true);

      let flags = 0;
      if (slice.reverse) flags |= 1;
      if (slice.mute) flags |= 2;
      view.setUint32(offset + 8, flags, true);
    });

    return buffer;
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // Convert REX2 to internal format
  toInternalFormat(rexData) {
    return {
      tempo: rexData.tempo,
      timeSignature: rexData.signature,
      slices: rexData.slices.map(s => ({
        start: s.start,
        end: s.end,
        reverse: s.reverse,
        mute: s.mute
      }))
    };
  }

  // Convert internal format to REX2
  fromInternalFormat(internalData) {
    return {
      tempo: internalData.tempo,
      signature: internalData.timeSignature,
      slices: internalData.slices,
      audio: internalData.audio
    };
  }

  // Validate REX2 data
  validate(rexData) {
    if (!rexData.tempo || rexData.tempo < 20 || rexData.tempo > 300) {
      return false;
    }
    if (!rexData.signature || !rexData.slices) {
      return false;
    }
    return true;
  }
}
