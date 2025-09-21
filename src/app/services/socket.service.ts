import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  registerClient(userId: string) {
    this.socket.emit('register', userId);
    console.log('registerClient chamado (placeholder)');
  }

  // envia para o servidor
  // sendMessage(payload: { to: string | number; message: string; from: string }) { //testando
  sendMessage(payload: { to: number; message: string; from: string }) {

    this.socket.emit('private-message', payload);
  }

  onMessage(): Observable<{ from: string, message: string }> {
    return new Observable(observer => {
      this.socket.on('message', (data) => observer.next(data));
    });
  }

}
