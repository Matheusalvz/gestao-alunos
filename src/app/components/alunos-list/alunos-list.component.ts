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
import { ChatDialogComponent } from '../../shared/chat-dialog/chat-dialog';
import { Router } from '@angular/router';

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
  constructor(private alunoService: AlunoService, private router: Router, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.carregarAlunos();
    this.currentUserId = sessionStorage.getItem('userId')!;
    this.currentUserName = sessionStorage.getItem('userName')!;
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
      currentUserName: this.currentUserId // Nome do usuário que fez o name
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

  sair(){
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    this.router.navigate(['/login']);

  }
}