// Mock socket.io-client globally
jest.mock('socket.io-client', () => {
  return jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    removeAllListeners: jest.fn()
  }));
});
