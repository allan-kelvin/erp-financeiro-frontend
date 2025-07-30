import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { CartaoFormComponent } from './cartoes/cartao-form/cartao-form.component';
import { CartoesComponent } from './cartoes/cartoes.component';
import { DashboardOverviewComponent } from './dashboard/dashboard-overview/dashboard-overview.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', component: DashboardOverviewComponent, data: { title: 'Visão Geral' } },
      { path: 'cartoes', component: CartoesComponent, data: { title: 'Cartões' } },
      { path: 'cartoes/novo', component: CartaoFormComponent, data: { title: 'Novo Cartão' } }, // Rota para cadastro
      { path: 'cartoes/editar/:id', component: CartaoFormComponent, data: { title: 'Editar Cartão' } }, // Rota para edição
      // Futuras rotas para Dívidas, Contas a Pagar, Relatórios
      // { path: 'dividas', component: DividasComponent, data: { title: 'Dívidas' } },
      // { path: 'contas-a-pagar', component: ContasAPagarComponent, data: { title: 'Contas a Pagar' } },
      // { path: 'relatorios', component: RelatoriosComponent, data: { title: 'Relatórios' } },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redireciona para login se a URL estiver vazia
  { path: '**', redirectTo: '/dashboard' } // Rota curinga para qualquer outra URL não encontrada
];
