import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { CartoesComponent } from './cartoes/cartoes.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'cartoes', pathMatch: 'full' },
      { path: 'cartoes', component: CartoesComponent },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
