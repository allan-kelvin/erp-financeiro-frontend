import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { Fornecedor } from './interface/fornecedor.interface';
import { FornecedorService } from './services/fornecedor.service';

@Component({
  selector: 'app-fornecedor',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatPaginatorModule
  ],
  templateUrl: './fornecedor.component.html',
  styleUrl: './fornecedor.component.scss'
})
export class FornecedorComponent implements OnInit, AfterViewInit {

  dataSource = new MatTableDataSource<Fornecedor>([]);
  displayedColumns: string[] = ['id', 'razaoSocial', 'cnpj', 'ativo', 'actions'];

  filterId: number | null = null;
  filterNomeFantasia: string = '';
  filterCnpj: string = '';

  isLoading: boolean = true;
  errorMessage: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fornecedorService: FornecedorService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadFornecedores();
  }

  ngAfterViewInit(): void {
    // A atribuição do paginator será feita após o carregamento dos dados
  }

  loadFornecedores(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.fornecedorService.getFornecedores().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        } else {
          console.warn('MatPaginator não encontrado.');
        }

        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar fornecedores:', err);
        this.errorMessage = 'Não foi possível carregar os fornecedores. Tente novamente mais tarde.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.dataSource.filterPredicate = (data: Fornecedor, filter: string) => {
      const idMatch = this.filterId ? data.id === this.filterId : true;
      const nomeFantasiaMatch = data.nomeFantasia.toLowerCase().includes(this.filterNomeFantasia.toLowerCase());
      const cnpjMatch = data.cnpj.toLowerCase().includes(this.filterCnpj.toLowerCase());
      return idMatch && nomeFantasiaMatch && cnpjMatch;
    };
    this.dataSource.filter = 'customFilterTrigger'; // Gatilho para o filterPredicate

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onClear(): void {
    this.filterId = null;
    this.filterNomeFantasia = '';
    this.filterCnpj = '';
    this.dataSource.filter = '';

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onAdd(): void {
    this.router.navigate(['/fornecedor/new']);
  }

  editFornecedor(id: number): void {
    this.router.navigate(['/fornecedor/edit', id]);
  }

  deleteFornecedor(id: number, nome: string): void {
    // TODO: Usar um modal de confirmação do Angular Material em vez de window.confirm()
    if (window.confirm(`Tem certeza que deseja excluir o fornecedor "${nome}"?`)) {
      this.fornecedorService.deleteFornecedor(id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(f => f.id !== id);
          console.log(`Fornecedor ${nome} deletado com sucesso.`);
        },
        error: (err) => {
          console.error('Erro ao deletar fornecedor:', err);
          this.errorMessage = `Não foi possível deletar o fornecedor "${nome}".`;
        }
      });
    }
  }
}
