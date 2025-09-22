import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AlunoService } from '../../services/aluno.service';
import { SocketService } from '../../services/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { ChatDialogComponent } from '../../shared/chat-dialog/chat-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alunoService: AlunoService,
    private socketService: SocketService,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  login() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    this.alunoService.login(email, password).subscribe({
      next: (aluno) => {
        if (aluno && aluno.id && aluno.name) {
          sessionStorage.setItem('userId', aluno.id.toString());
          sessionStorage.setItem('userName', aluno.name);

          // Registrar no socket e escutar mensagens privadas
          this.socketService.registerClient(aluno.id.toString());
          this.socketService.onPrivateMessage().subscribe(msg => {
            if (msg.to === aluno.id!.toString()) {
              this.abrirChat(msg.from, msg.message, msg.image);
            }
          });

          this.router.navigate(['/alunos']);
        } else {
          this.error = 'Erro ao obter dados do usuário';
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro no login';
      }
    });
  }

  abrirChat(remetenteId: string, mensagem?: string, image?: string) {
    const existingDialogs = this.dialog.openDialogs.filter(
      d => d.componentInstance.data.id === remetenteId
    );
    if (existingDialogs.length) return;

    this.dialog.open(ChatDialogComponent, {
      width: '400px',
      data: {
        id: remetenteId,
        name: 'Aluno',
        currentUserId: sessionStorage.getItem('userId'),
        currentUserName: sessionStorage.getItem('userName'),
        initialMessage: mensagem,
        image
      }
    });
  }

  forgotPassword(){
    this.router.navigate(['/alunos']);
  }

  openInNewTab() {
    window.open('http://localhost:4200', '_blank');
  }
}