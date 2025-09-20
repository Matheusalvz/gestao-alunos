import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AlunoService } from '../../services/aluno.service';
import { Aluno } from '../../models/aluno.model';
import { AlunoFormComponent } from '../alunos-form/aluno-form.component';
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@Component({
  selector: 'app-alunos-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatDialogModule],
  // providers: [
  //   provideHttpClient(withInterceptorsFromDi())
  // ],
  templateUrl: './alunos-list.component.html',
  styleUrls: ['./alunos-list.component.scss']
})
export class AlunosListComponent implements OnInit {
  alunos: Aluno[] = [];

  constructor(private alunoService: AlunoService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.carregarAlunos();
  }

  carregarAlunos() {
    this.alunoService.listar().subscribe(data => this.alunos = data);
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
}