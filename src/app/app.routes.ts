import { Routes } from '@angular/router';
import { Tasks } from './pages/tasks/tasks';
import { Auth } from './pages/auth/auth';

export const routes: Routes = [
  { path: 'auth', component: Auth },
  { path: 'tasks', component: Tasks },
];
