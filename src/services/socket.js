// Simulated WebSocket service with full event handling
class SocketService {
  constructor() {
    this.listeners = new Map();
    this.connected = false;
    this.userId = null;
    this.role = null;
  }

  connect(userId, role) {
    this.connected = true;
    this.userId = userId;
    this.role = role;
    console.log('Socket connected');
    
    // Emit login event
    this.emit('login', { userId, role });
    
    this._simulateServerEvents();
  }

  disconnect() {
    this.connected = false;
    this.listeners.clear();
    this.userId = null;
    this.role = null;
    console.log('Socket disconnected');
  }

  emit(event, data) {
    if (!this.connected) return;
    
    console.log(`Emitting event: ${event}`, data);
    
    // Simulate server responses based on events
    switch (event) {
      case 'login':
        setTimeout(() => {
          this._triggerEvent('users_update', [
            { id: 1, role: 'user' },
            { id: 2, role: 'printer' },
            { id: 3, role: 'rider' }
          ]);
        }, 500);
        break;

      case 'document_uploaded':
        setTimeout(() => {
          this._triggerEvent('ai_process_complete', {
            improvements: ['Corrected spelling', 'Adjusted margins']
          });
          
          // Also trigger print job creation
          const jobId = 'JOB' + Math.floor(Math.random() * 1000);
          this._triggerEvent('print_job_created', { 
            jobId,
            userId: this.userId,
            fileName: data.fileName
          });
        }, 1500);
        break;

      case 'delivery_details_submitted':
        setTimeout(() => {
          this._triggerEvent('delivery_details_confirmed', {
            success: true,
            deliveryId: 'DEL' + Math.floor(Math.random() * 1000)
          });
        }, 1000);
        break;

      case 'find_printer_shop':
        setTimeout(() => {
          this._triggerEvent('printer_shop_found', {
            id: 'PS001',
            name: 'EasyPrint Manila Branch',
            address: '123 P. Burgos St., Malate, Manila',
            distance: '1.5',
            coordinates: {
              lat: 14.5995,
              lng: 120.9842
            }
          });

          // Generate QR code after shop is found
          setTimeout(() => {
            this._triggerEvent('qr_code_generated', {
              qrCode: 'QR_' + Math.random().toString(36).substr(2, 9)
            });
          }, 1000);
        }, 1500);
        break;

      case 'confirm_printer_shop':
        setTimeout(() => {
          this._triggerEvent('print_job_status_update', {
            status: 'confirmed',
            shopId: data.shopId,
            estimatedTime: '30 minutes'
          });
        }, 1000);
        break;

      case 'confirm_delivery':
        setTimeout(() => {
          this._triggerEvent('delivery_confirmation_response', {
            success: true,
            message: 'Delivery confirmed successfully'
          });
        }, 1000);
        break;

      default:
        break;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  once(event, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  _triggerEvent(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  _simulateServerEvents() {
    // Simulate periodic status updates
    setInterval(() => {
      if (this.connected) {
        this._triggerEvent('status_update', {
          status: 'Processing',
          progress: Math.floor(Math.random() * 100),
          timestamp: new Date().toISOString()
        });
      }
    }, 5000);

    // Simulate periodic print job updates
    setInterval(() => {
      if (this.connected && this.role === 'user') {
        this._triggerEvent('print_jobs_update', [
          {
            jobId: 'JOB123',
            status: 'printing',
            progress: Math.floor(Math.random() * 100),
            estimatedCompletion: new Date(Date.now() + 30 * 60000).toISOString()
          }
        ]);
      }
    }, 8000);
  }
}

export const socket = new SocketService();
export default socket;
