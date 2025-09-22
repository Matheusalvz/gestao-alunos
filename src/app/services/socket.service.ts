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
      console.log('registerClient chamado (socket já conectado)');
    } else {
      this.socket.on('connect', () => {
        this.socket.emit('register', userId);
        console.log('registerClient chamado após conexão');
      });
    }
  }

  // envia para o servidor
  // sendMessage(payload: { to: string | number; message: string; from: string }) { //testando
  // sendMessage(payload: { to: number; message: string; from: string }) {
  sendMessage(payload: { to: string; message: string; from: string; image?: string }) {
    console.log('Emitindo private-message:', payload);
    console.log('Enviando do socket.id=', this.socket.id);
    this.socket.emit('private-message', payload);
  }

  onMessage(): Observable<{ from: string; message: string }> {
    return new Observable(observer => {
      this.socket.on('message', (data: { from: string; message: string }) => observer.next(data));
    });
  }


  onPrivateMessage(): Observable<{ from: string; to: string; message: string; image?: string }> {
    if (!this.privateMessage$) {
      this.privateMessage$ = new Observable(observer => {
        this.socket.on('private-message', data => observer.next(data));
      });
    }
    return this.privateMessage$;
  }

  //envia screenshot
  sendScreenShot(payload: { to: string; from: string; dataUrl: string }) {
    this.socket.emit('screen-shot', payload);
  }

  onScreenShot(): Observable<ScreenShotPayload> {
    return new Observable(observer => {
      this.socket.on('screen-shot', (data: ScreenShotPayload) => observer.next(data));
    });
  }

}
