import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AlunoService } from '../../services/aluno.service';
import { Aluno } from '../../models/aluno.model';
import { AlunoFormComponent } from '../alunos-form/aluno-form.component';
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { ChatDialogComponent } from '../../shared/chat-dialog/chat-dialog.component';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-alunos-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatDialogModule, MatIconModule],
  // providers: [
  //   provideHttpClient(withInterceptorsFromDi())
  // ],
  templateUrl: './alunos-list.component.html',
  styleUrls: ['./alunos-list.component.scss']
})
export class AlunosListComponent implements OnInit {
  alunos: Aluno[] = [];
  currentUserId: string|null = null;
  currentUserName: string|null = null;
  constructor(private alunoService: AlunoService, private router: Router, private dialog: MatDialog, private socketService: SocketService) {}

  ngOnInit(): void {
    this.carregarAlunos();
    this.currentUserId = sessionStorage.getItem('userId')!;
    this.currentUserName = sessionStorage.getItem('userName')!;

    if (this.currentUserId) {
      this.socketService.registerClient(this.currentUserId);
      console.log("Usuário registrado no SocketService com ID:", this.socketService);
      
    }

    // recebe mensagens privadas
    this.socketService.onPrivateMessage().subscribe(msg => {
      // só abre o chat se a mensagem for para mim
      if (msg.to === this.currentUserId) {
        this.abrirChat(msg.from, msg.message, msg.image);
      }
    });
  }

  carregarAlunos() {
    this.alunoService.listar().subscribe(data => this.alunos = data);
  }

  iniciarChat(aluno: Aluno) {

    if (!this.currentUserId || !this.currentUserName) {
      alert('Usuário não logado!');
      return;
    }
    const dialogRef = this.dialog.open(ChatDialogComponent, { width: '400px', data: {
      id: aluno.id, // Id do aluno que vai receber a mensagem
      name: aluno.name,  // Nome do aluno que vai receber a mensagem
      currentUserId: this.currentUserId, // ID do usuário que fez o login
      currentUserName: this.currentUserName // Nome do usuário que fez o name
    }});
    dialogRef.afterClosed().subscribe(result => {
      // if (result) this.carregarAlunos();
    });
  }

  adicionarAluno() {
    const dialogRef = this.dialog.open(AlunoFormComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.carregarAlunos();
    });
  }

  editarAluno(aluno: Aluno) {
    const dialogRef = this.dialog.open(AlunoFormComponent, { width: '400px', data: aluno });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.carregarAlunos();
    });
  }

  excluirAluno(id: number) {
    if (confirm('Deseja realmente excluir este aluno?')) {
      this.alunoService.excluir(id).subscribe(() => this.carregarAlunos());
    }
  }

  abrirChat(remetenteId: string, mensagem?: string, image?: string) {

    const currentUserId = this.currentUserId!;
  
    // chave única do chat: remetente + destinatário
    const chatKey = [remetenteId, currentUserId].sort().join('-');

    // verifica se já existe dialog com a mesma chave
    const existingDialogs = this.dialog.openDialogs.filter(d => {
      const dialogData = d.componentInstance.data;
      const dialogKey = [dialogData.id, currentUserId].sort().join('-');
      return dialogKey === chatKey;
    });
    if (existingDialogs.length) return;
  
    const dialogRef = this.dialog.open(ChatDialogComponent, {
      width: '400px',
      data: {
        id: remetenteId,
        name: 'Aluno', // ou envie o nome junto do servidor
        currentUserId: this.currentUserId,
        currentUserName: this.currentUserName,
        initialMessage: mensagem,
        image
      }
    });
  
    dialogRef.afterClosed().subscribe(() => {
      console.log('Chat fechado');
    });
  }

  sair(){
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    this.router.navigate(['/login']);

  }
}