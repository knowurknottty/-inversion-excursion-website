/**
 * Jest test setup file
 * Initializes test environment and global mocks
 */

import { jest } from '@jest/globals';

// Mock console methods to reduce noise in tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Global test timeout
jest.setTimeout(30000);

// Mock crypto for Node.js environment
global.crypto = {
  ...global.crypto,
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 15),
  subtle: {
    digest: jest.fn(),
    importKey: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
  } as any,
};

// Mock fetch for API tests
global.fetch = jest.fn();

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  state: 'running',
  sampleRate: 48000,
  destination: { maxChannelCount: 2 },
  baseLatency: 0.01,
  currentTime: 0,
  createOscillator: jest.fn().mockReturnValue({
    type: 'sine',
    frequency: { value: 0, setValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    disconnect: jest.fn(),
  }),
  createGain: jest.fn().mockReturnValue({
    gain: { value: 1, setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() },
    connect: jest.fn(),
  }),
  createStereoPanner: jest.fn().mockReturnValue({
    pan: { value: 0 },
    connect: jest.fn(),
  }),
  createAnalyser: jest.fn().mockReturnValue({
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    frequencyBinCount: 1024,
    getByteFrequencyData: jest.fn(),
  }),
  resume: jest.fn().mockResolvedValue(undefined),
  suspend: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
})) as any;

global.webkitAudioContext = global.AudioContext;

// Mock window.location for browser tests
Object.defineProperty(global, 'window', {
  value: {
    location: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  writable: true,
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
});
