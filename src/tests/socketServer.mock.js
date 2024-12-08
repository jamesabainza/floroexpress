// Mock Socket.io Server for Integration Tests
const { Server } = require('socket.io');
const { createServer } = require('http');

class MockSocketServer {
  constructor() {
    this.httpServer = createServer();
    this.io = new Server(this.httpServer);
    this.connectedClients = new Set();
    this.setupDefaultHandlers();
  }

  setupDefaultHandlers() {
    this.io.on('connection', (socket) => {
      this.connectedClients.add(socket);

      // Handle document upload and AI processing
      socket.on('document_uploaded', (data) => {
        setTimeout(() => {
          socket.emit('ai_process_complete', {
            improvements: [
              'Enhanced document clarity',
              'Corrected formatting',
              'Optimized for printing'
            ],
            status: 'success'
          });
        }, 1000);
      });

      // Handle printer selection
      socket.on('send_to_printer', (data) => {
        socket.emit('print_job_status', {
          status: 'printing',
          jobId: `print-${Date.now()}`,
          estimatedTime: '5 minutes'
        });
      });

      socket.on('disconnect', () => {
        this.connectedClients.delete(socket);
      });
    });
  }

  listen(port = 3001) {
    return new Promise((resolve) => {
      this.httpServer.listen(port, () => {
        console.log(`Mock Socket.io server running on port ${port}`);
        resolve();
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      this.io.close(() => {
        this.httpServer.close(() => {
          console.log('Mock Socket.io server closed');
          resolve();
        });
      });
    });
  }

  // Helper method to emit events to all clients
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Get the number of connected clients
  getConnectionCount() {
    return this.connectedClients.size;
  }
}

module.exports = MockSocketServer;
