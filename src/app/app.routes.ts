import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { CartaoFormComponent } from './cartoes/cartao-form/cartao-form.component';
import { CartoesComponent } from './cartoes/cartoes.component';
import { DashboardOverviewComponent } from './dashboard/dashboard-overview/dashboard-overview.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DividaFormComponent } from './dividas/divida-form/divida-form.component';
import { DividasComponent } from './dividas/dividas.component';

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
      { path: 'dividas', component: DividasComponent, data: { title: 'Dívidas' } },
      { path: 'dividas/nova', component: DividaFormComponent, data: { title: 'Nova Dívida' } }, // Rota para cadastro
      { path: 'dividas/editar/:id', component: DividaFormComponent, data: { title: 'Editar Dívida' } }, // Rota para edição
      // Futuras rotas para Contas a Pagar, Relatórios
      // { path: 'contas-a-pagar', component: ContasAPagarComponent, data: { title: 'Contas a Pagar' } },
      // { path: 'relatorios', component: RelatoriosComponent, data: { title: 'Relatórios' } },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
