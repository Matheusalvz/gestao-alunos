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

  constructor(
    public dialogRef: MatDialogRef<ChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; name?: string; currentUserId: string },
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    // registra o usuário atual no Socket.IO
    this.socketService.registerClient(this.data.currentUserId);

    // escuta mensagens recebidas do outro usuário
    this.sub = this.socketService.onMessage().subscribe((msg: any) => {
      if (msg.from !== this.data.currentUserId) {
        this.messages.push({ from: 'other', text: msg.message, at: new Date().toLocaleTimeString() });
        this.scrollToBottom();
      }
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
      to: this.data.id, // id do aluno que receberá a mensagem
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
}