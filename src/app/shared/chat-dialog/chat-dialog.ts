import { Component, Inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';

interface Message {
  from: 'me' | 'other';
  text: string;
  at: string;
}

@Component({
  selector: 'app-chat-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './chat-dialog.html',
  styleUrls: ['./chat-dialog.scss']
})
export class ChatDialogComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  messages: Message[] = [];
  messageControl = new FormControl('', Validators.required);
  private sub?: Subscription;
  screenImage: string | null = null;
  constructor(
    public dialogRef: MatDialogRef<ChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; name?: string; currentUserId: string },
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    // registra o usuário atual no Socket.IO
    this.socketService.registerClient(this.data.currentUserId);

    // escuta mensagens recebidas do outro usuário
    this.sub = this.socketService.onMessage().subscribe(msg => {
      const fromOther = msg.from !== this.data.currentUserId; // true se a mensagem é do outro usuário
      this.messages.push({
        from: fromOther ? 'other' : 'me',
        text: msg.message,
        at: new Date().toLocaleTimeString()
      });
      this.scrollToBottom();
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  send() {
    const text = this.messageControl.value?.trim();
    if (!text) return;

    // adiciona localmente
    this.messages.push({ from: 'me', text, at: new Date().toLocaleTimeString() });
    this.scrollToBottom();

    // envia para o outro usuário
    this.socketService.sendMessage({
      to: String(this.data.id), // id do aluno que receberá a mensagem
      message: text,
      from: this.data.currentUserId
    });

    this.messageControl.reset();
  }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer?.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async captureAndSendScreen() {
    try {
      // seleção do tipo de captura tela/aba/janela
      const mediaStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
  
      // cria elemento video oculto para desenhar frame
      const video = document.createElement('video');
      video.autoplay = true;
      video.srcObject = mediaStream;
  
      // aguarda metadata para ter dimensões
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(() => resolve()).catch(() => resolve());
        };
      });
  
      // capturar frame em canvas redimensionado para reduzir tamanho
      const w = Math.min(1280, video.videoWidth);
      const h = Math.round((w / video.videoWidth) * video.videoHeight);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      // comprime e pega data URL (jpeg com qualidade)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
  
      // para a stream (fechar permissão)
      mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  
      // envia via socket
      const toId = this.data.id.toString(); // destinatário
      const fromId = this.data.currentUserId; // id do usuário atual
      this.socketService.sendScreenShot({ to: toId, from: fromId, dataUrl });
  
      // mostrar preview localmente
      this.screenImage = dataUrl;
  
    } catch (err) {
      console.error('Erro ao capturar a tela:', err);
    }
  }
}