import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AlunoService } from '../../services/aluno.service';
import { Aluno } from '../../models/aluno.model';

@Component({
  selector: 'app-aluno-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './aluno-form.component.html',
  styleUrls: ['./aluno-form.component.scss']
})
export class AlunoFormComponent implements OnInit {
  form: any;

  constructor(
    private fb: FormBuilder,
    private alunoService: AlunoService,
    public dialogRef: MatDialogRef<AlunoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Aluno
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      email: [this.data?.email || '', [Validators.required, Validators.email]]
    });
  }

  salvar() {
    if (this.form.invalid) return;

    const aluno: Aluno = this.form.value;
    if (this.data?.id) {
      aluno.id = this.data.id;
      this.alunoService.atualizar(aluno).subscribe(() => this.dialogRef.close(true));
    } else {
      this.alunoService.criar(aluno).subscribe(() => this.dialogRef.close(true));
    }
  }
}