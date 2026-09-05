// Audio Routing
// Advanced audio routing utilities

export class AudioRouter {
  constructor(audioContext) {
    this.context = audioContext;
    this.nodes = new Map();
    this.connections = new Set();
    this.buses = new Map();
  }

  createNode(id, type, options = {}) {
    let node;

    switch (type) {
      case 'gain':
        node = this.context.createGain();
        if (options.gain !== undefined) node.gain.value = options.gain;
        break;
      case 'panner':
        node = this.context.createStereoPanner();
        if (options.pan !== undefined) node.pan.value = options.pan;
        break;
      case 'filter':
        node = this.context.createBiquadFilter();
        if (options.type) node.type = options.type;
        if (options.frequency !== undefined) node.frequency.value = options.frequency;
        if (options.Q !== undefined) node.Q.value = options.Q;
        break;
      case 'delay':
        node = this.context.createDelay(options.maxDelayTime || 1);
        if (options.delayTime !== undefined) node.delayTime.value = options.delayTime;
        break;
      case 'convolver':
        node = this.context.createConvolver();
        if (options.buffer) node.buffer = options.buffer;
        break;
      case 'analyser':
        node = this.context.createAnalyser();
        if (options.fftSize) node.fftSize = options.fftSize;
        break;
      case 'compressor':
        node = this.context.createDynamicsCompressor();
        break;
      default:
        throw new Error(`Unknown node type: ${type}`);
    }

    this.nodes.set(id, node);
    return node;
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  removeNode(id) {
    const node = this.nodes.get(id);
    if (node) {
      node.disconnect();
      this.nodes.delete(id);

      // Remove connections
      this.connections.forEach((conn) => {
        if (conn.from === id || conn.to === id) {
          this.connections.delete(conn);
        }
      });
    }
  }

  connect(fromId, toId, outputIndex = 0, inputIndex = 0) {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);

    if (!fromNode || !toNode) {
      throw new Error(`Node not found: ${fromId} or ${toId}`);
    }

    fromNode.connect(toNode, outputIndex, inputIndex);
    this.connections.add({ from: fromId, to: toId, outputIndex, inputIndex });
  }

  disconnect(fromId, toId) {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);

    if (fromNode && toNode) {
      fromNode.disconnect(toNode);
      this.connections.delete({ from: fromId, to: toId });
    }
  }

  createBus(id, options = {}) {
    const input = this.createNode(`${id}_input`, 'gain', { gain: 1 });
    const output = this.createNode(`${id}_output`, 'gain', { gain: 1 });

    input.connect(output);

    const bus = {
      id,
      input,
      output,
      effects: [],
      sendTo: (targetBusId, amount = 0.5) => {
        const sendGain = this.createNode(`${id}_send_${targetBusId}`, 'gain', { gain: amount });
        input.connect(sendGain);

        const targetBus = this.buses.get(targetBusId);
        if (targetBus) {
          sendGain.connect(targetBus.input);
        }

        return sendGain;
      },
    };

    this.buses.set(id, bus);
    return bus;
  }

  getBus(id) {
    return this.buses.get(id);
  }

  addToBus(busId, nodeId) {
    const bus = this.buses.get(busId);
    const node = this.nodes.get(nodeId);

    if (bus && node) {
      node.connect(bus.input);
    }
  }

  routeToDestination(nodeId, destination = this.context.destination) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.connect(destination);
    }
  }

  getGraph() {
    return {
      nodes: Array.from(this.nodes.entries()),
      connections: Array.from(this.connections),
      buses: Array.from(this.buses.entries()),
    };
  }

  clear() {
    this.nodes.forEach((node) => node.disconnect());
    this.nodes.clear();
    this.connections.clear();
    this.buses.clear();
  }

  export() {
    return this.getGraph();
  }
}
