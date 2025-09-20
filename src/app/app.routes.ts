import { Routes } from '@angular/router';
import { AlunosListComponent } from './components/alunos-list/alunos-list.component';
import { AlunoFormComponent } from './components/alunos-form/aluno-form.component';


export const appRoutes: Routes = [
    { path: '', component: AlunosListComponent },
    { path: 'aluno', component: AlunoFormComponent },
    { path: '**', redirectTo: '' }
];  