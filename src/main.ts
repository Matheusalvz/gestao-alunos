import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { AlunosListComponent } from './app/components/alunos-list/alunos-list.component';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// bootstrapApplication(App, appConfig)
//   .catch((err) => console.error(err));


bootstrapApplication(AlunosListComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptorsFromDi()) //Http global
    // provideAnimations() 
  ]
}).catch(err => console.error(err));
