// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Create a mock socket object
export const mockSocket = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  removeAllListeners: jest.fn(),
  connected: false,
  userId: null,
  role: null
};

// Mock socket.io-client globally
jest.mock('socket.io-client', () => {
  return jest.fn(() => mockSocket);
});
