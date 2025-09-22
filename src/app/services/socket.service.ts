import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

// interface ChatMessage { from: string; message: string; }
interface ScreenShotPayload { from: string; dataUrl: string; }
@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;

  private privateMessageSubject = new Subject<{ from: string; to: string; message: string; image?: string }>();
  private requestScreenShotSubject = new Subject<{ from: string }>();
  private screenShotSubject = new Subject<{ from: string; dataUrl: string }>();

  constructor() {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => console.log('Socket conectado!', this.socket.id));
    this.socket.on('connect_error', (err) => console.error('Erro de conexão:', err));

    // Eventos escutados apenas uma vez no serviço
    this.socket.on('private-message', (data) => this.privateMessageSubject.next(data));
    this.socket.on('request-screenshot', (data) => this.requestScreenShotSubject.next(data));
    this.socket.on('screen-shot', (data) => this.screenShotSubject.next(data));
  }

  registerClient(userId: string) {
    if (this.socket.connected) this.socket.emit('register', userId);
    else this.socket.on('connect', () => this.socket.emit('register', userId));
  }

  sendMessage(payload: { to: string; message: string; from: string; image?: string }) {
    this.socket.emit('private-message', payload);
  }

  onPrivateMessage(): Observable<{ from: string; to: string; message: string; image?: string }> {
    return this.privateMessageSubject.asObservable();
  }

  requestScreenShot(to: string) {
    this.socket.emit('request-screenshot', { to });
  }

  sendScreenShot(payload: { to: string; from: string; dataUrl: string }) {
    this.socket.emit('screen-shot', payload);
  }

  onScreenShot(): Observable<{ from: string; dataUrl: string }> {
    return this.screenShotSubject.asObservable();
  }

  onRequestScreenShot(): Observable<{ from: string }> {
    return this.requestScreenShotSubject.asObservable();
  }
}