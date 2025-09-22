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
import { MatTooltipModule } from '@angular/material/tooltip';

interface Message {
  from: 'me' | 'other';
  text: string;
  at: string;
  dataUrl?: string;
}

@Component({
  selector: 'app-chat-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  messages: Message[] = [];
  messageControl = new FormControl('', Validators.required);
  private sub?: Subscription;
  screenImage: string | null = null;
  constructor(
    public dialogRef: MatDialogRef<ChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; name?: string; currentUserId: string; initialMessage?: string; image?: string },
    public socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.socketService.registerClient(this.data.currentUserId);
  
    // adiciona mensagem inicial
    if (this.data.initialMessage) {
      this.messages.push({
        from: 'other',
        text: this.data.initialMessage,
        at: new Date().toLocaleTimeString()
      });
      if (this.data.image) this.screenImage = this.data.image;
    }

    // escuta mensagens privadas
    this.sub = this.socketService.onPrivateMessage().subscribe(msg => {
      const isForMe = msg.to === this.data.currentUserId;
      if (isForMe) {
        this.messages.push({
          from: msg.from !== this.data.currentUserId ? 'other' : 'me',
          text: msg.message,
          at: new Date().toLocaleTimeString()
        });
        if (msg.image) this.screenImage = msg.image;
        this.scrollToBottom();
      }
    });

    // escuta solicitções de captura de tela
    this.socketService.onRequestScreenShot().subscribe(async ({ from }) => {
      const confirmCapture = confirm(`Outro usuário solicitou um screenshot da sua tela. Aceita?`);
      if (!confirmCapture) return;
    
      // Captura a tela do usuário atual
      const dataUrl = await this.captureAndSendScreen();
      if (dataUrl) {
        this.socketService.sendScreenShot({ 
          to: from, 
          from: this.data.currentUserId, 
          dataUrl 
        });
    
        this.messages.push({
          from: 'me',
          text: '',
          dataUrl,
          at: new Date().toLocaleTimeString()
        });
    
        this.scrollToBottom();
      }
    })

    // Receber screenshot do outro
    this.socketService.onScreenShot().subscribe(s => {
      this.messages.push({
        from: 'other',
        text: '',
        dataUrl: s.dataUrl,
        at: new Date().toLocaleTimeString()
      });
      this.scrollToBottom();
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  send(): void {
    const text = this.messageControl.value?.trim();
    if (!text) return;

    this.messages.push({ from: 'me', text, at: new Date().toLocaleTimeString() });
    this.scrollToBottom();

    this.socketService.sendMessage({
      to: String(this.data.id),
      message: text,
      from: this.data.currentUserId
    });

    this.messageControl.reset();
  }

  close(): void {
    this.dialogRef.close();
  }

  async captureAndSendScreen(toId?: string): Promise<string | undefined> {
    try {
      const mediaStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
  
      const video = document.createElement('video');
      video.autoplay = true;
      video.srcObject = mediaStream;
  
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(() => resolve()).catch(() => resolve());
        };
      });
  
      const w = Math.min(1280, video.videoWidth);
      const h = Math.round((w / video.videoWidth) * video.videoHeight);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
  
      mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  
      this.screenImage = dataUrl;
  
      // se passar o toId, envia automaticamente
      if (toId) {
        this.socketService.sendScreenShot({ to: toId, from: this.data.currentUserId, dataUrl });
      }
  
      return dataUrl; // retorna o resultado
    } catch (err) {
      console.error('Erro ao capturar a tela:', err);
      return undefined; // garante retorno mesmo em caso de erro
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}