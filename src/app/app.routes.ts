import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { authGuard } from './shared/interceptors/guard.interceptor';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tasks/tasks').then((m) => m.Tasks),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
