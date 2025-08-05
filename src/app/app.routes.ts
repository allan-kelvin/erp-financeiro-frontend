import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { BancoFormComponent } from './banco/banco-form/banco-form.component';
import { BancoComponent } from './banco/banco.component';
import { CartaoFormComponent } from './cartoes/cartao-form/cartao-form.component';
import { CartoesComponent } from './cartoes/cartoes.component';
import { DashboardOverviewComponent } from './dashboard/dashboard-overview/dashboard-overview.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DespesasFormComponent } from './despesas/despesas-form/despesas-form.component';
import { DespesasComponent } from './despesas/despesas.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', component: DashboardOverviewComponent, data: { title: 'Visão Geral' } },
      { path: 'cartoes', component: CartoesComponent, data: { title: 'Cartões' } },
      { path: 'cartoes/novo', component: CartaoFormComponent, data: { title: 'Novo Cartão' } },
      { path: 'cartoes/editar/:id', component: CartaoFormComponent, data: { title: 'Editar Cartão' } },
      { path: 'despesas', component: DespesasComponent, data: { title: 'Despesas' } },
      { path: 'despesas/nova', component: DespesasFormComponent, data: { title: 'Nova Despesas' } }, // Rota para cadastro
      { path: 'despesas/editar/:id', component: DespesasFormComponent, data: { title: 'Editar Despesa' } },
      { path: 'banco', component: BancoComponent, data: { title: 'Banco' } },
      { path: 'banco/novo', component: BancoFormComponent, data: { title: 'Novo Banco' } },
      { path: 'banco/editar/:id', component: BancoFormComponent, data: { title: 'Editar Banco' } },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
