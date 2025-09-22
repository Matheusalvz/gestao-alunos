import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

// interface ChatMessage { from: string; message: string; }
interface ScreenShotPayload { from: string; dataUrl: string; }
@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  private privateMessage$?: Observable<{ from: string; to: string; message: string; image?: string }>;

  constructor() {
    this.socket = io('http://localhost:3000');
  
      // loga quando a conexão é estabelecida
      this.socket.on('connect', () => {
        console.log('Socket conectado! ID:', this.socket.id);
      });
    
      // loga erros de conexão
      this.socket.on('connect_error', (err) => {
        console.error('Erro de conexão:', err);
      });
  }

  registerClient(userId: string) {
    if (this.socket.connected) {
      this.socket.emit('register', userId);
    } else {
      this.socket.on('connect', () => this.socket.emit('register', userId));
    }
  }

  // Mensagens privadas
  sendMessage(payload: { to: string; message: string; from: string; image?: string }) {
    this.socket.emit('private-message', payload);
  }

  onPrivateMessage(): Observable<{ from: string; to: string; message: string; image?: string }> {
    if (!this.privateMessage$) {
      this.privateMessage$ = new Observable(observer => {
        this.socket.on('private-message', data => observer.next(data));
      });
    }
    return this.privateMessage$;
  }

  // Captura de tela
  requestScreenShot(to: string) {
    this.socket.emit('request-screenshot', { to });
  }

  sendScreenShot(payload: { to: string; from: string; dataUrl: string }) {
    this.socket.emit('screen-shot', payload);
  }

  onScreenShot(): Observable<{ from: string; dataUrl: string }> {
    return new Observable(observer => {
      this.socket.on('screen-shot', data => observer.next(data));
    });
  }

  onRequestScreenShot(): Observable<{ from: string }> {
    return new Observable(observer => {
      this.socket.on('request-screenshot', data => observer.next(data));
    });
  }
}
