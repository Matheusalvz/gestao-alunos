import { Routes } from '@angular/router';
import { AlunosListComponent } from './components/alunos-list/alunos-list.component';
import { AlunoFormComponent } from './components/alunos-form/aluno-form.component';
import { LoginComponent } from './pages/login/login.component';


export const appRoutes: Routes = [
    // { path: '', component: AlunosListComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'aluno', component: AlunoFormComponent },
    { path: 'alunos', component: AlunosListComponent },
    { path: '**', redirectTo: 'login' }
];  