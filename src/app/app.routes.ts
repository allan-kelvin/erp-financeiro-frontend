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
import { FornecedorFormComponent } from './fornecedor/fornecedor-form/fornecedor-form.component';
import { FornecedorComponent } from './fornecedor/fornecedor.component';
import { SubCategoriasFormComponent } from './sub-categorias/sub-categorias-form/sub-categorias-form.component';
import { SubCategoriasComponent } from './sub-categorias/sub-categorias.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', component: DashboardOverviewComponent, data: { title: 'Visão Geral' } },
      { path: 'cartoes', component: CartoesComponent, data: { title: 'Cartões' } },
      { path: 'cartoes/novo', component: CartaoFormComponent, data: { title: 'Cadastro Cartão' } },
      { path: 'cartoes/editar/:id', component: CartaoFormComponent, data: { title: 'Editar Cartão' } },
      { path: 'despesas', component: DespesasComponent, data: { title: 'Despesas' } },
      { path: 'despesas/nova', component: DespesasFormComponent, data: { title: 'Cadastro Despesas' } }, // Rota para cadastro
      { path: 'despesas/editar/:id', component: DespesasFormComponent, data: { title: 'Editar Despesa' } },
      { path: 'banco', component: BancoComponent, data: { title: 'Banco' } },
      { path: 'banco/novo', component: BancoFormComponent, data: { title: 'Cadastro Banco' } },
      { path: 'banco/editar/:id', component: BancoFormComponent, data: { title: 'Editar Banco' } },
      { path: 'sub-categorias', component: SubCategoriasComponent, data: { title: 'Sub-Categorias' } },
      { path: 'sub-categorias/novo', component: SubCategoriasFormComponent, data: { title: 'Cadastro Sub-Categoria' } },
      { path: 'sub-categorias/editar/:id', component: SubCategoriasFormComponent, data: { title: 'Editar Sub-Categoria' } },
      { path: 'fornecedor', component: FornecedorComponent },
      { path: 'fornecedor/novo', component: FornecedorFormComponent },
      { path: 'fornecedor/editar/:id', component: FornecedorFormComponent },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
