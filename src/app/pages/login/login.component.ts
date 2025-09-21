import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AlunoService } from '../../services/aluno.service';

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

  constructor(private fb: FormBuilder, private router: Router, private alunoService: AlunoService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  login() {
    // if (this.form.invalid) {
    //   this.form.markAllAsTouched();
    //   return;
    // }

    // // aqui você chamaria sua API de login
    // const { email, password } = this.form.value;
    // console.log('Login', { email, password });

    // this.router.navigate(['/alunos']);

    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    this.alunoService.login(email, password).subscribe({
      next: (aluno) => {
        console.log('Login sucesso!', aluno);
        this.router.navigate(['/alunos']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro no login';
      },
    });
  }

  forgotPassword(){
    this.router.navigate(['/alunos']);
  }
}