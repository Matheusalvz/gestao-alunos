import { Component, Inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';

interface Message {
  from: string;
  text: string;
  at?: string;
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
  styleUrl: './chat-dialog.scss'
})
export class ChatDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  messages: Message[] = [];
  messageControl = new FormControl('', Validators.required);
  private sub?: Subscription;

  constructor(
    public dialogRef: MatDialogRef<ChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; name?: string },
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    console.log("data", this.data);
    
    this.socketService.registerClient();
    this.sub = this.socketService.onMessage().subscribe((msg: any) => {
      this.messages.push({ from: 'other', text: msg, at: new Date().toLocaleTimeString() });
      this.scrollToBottom();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const el: HTMLInputElement | null = document.querySelector('.chat-input') as HTMLInputElement;
      el?.focus();
    });
  }

  send() {
    const text = this.messageControl.value?.trim();
    if (!text) return;
    this.messages.push({ from: 'me', text, at: new Date().toLocaleTimeString() });
    this.scrollToBottom();
    this.socketService.sendMessage(text);
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