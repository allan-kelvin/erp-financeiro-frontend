import { CommonModule, CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TipoCartaoEnum } from '../cartoes/enums/cartaoEnum.enum';
import { Cartao } from '../cartoes/models/cartao.model';
import { CartoesService } from '../cartoes/services/cartoes.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { Despesa } from './models/despesa.model';
import { DespesaService } from './services/despesa.service';


@Component({
  selector: 'app-despesas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule,
    CurrencyPipe
  ],
  templateUrl: './despesas.component.html',
  styleUrl: './despesas.component.scss'
})
export class DespesasComponent implements OnInit, AfterViewInit {

  filterForm!: FormGroup;
  dataSource = new MatTableDataSource<Despesa>();
  displayedColumns: string[] = ['id', 'descricao', 'tipo_despesa', 'cartao', 'valor_total', 'parcelado', 'qtd_parcelas', 'acoes'];
  isLoading: boolean = false;

  tipoDespesas = Object.values(TipoCartaoEnum);
  availableCards: Cartao[] = []; // Lista de cartões para o select de filtro 'Cartão'
  parceladoOptions = [
    { value: true, viewValue: 'Sim' },
    { value: false, viewValue: 'Não' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private despesaService: DespesaService,
    private cartoesService: CartoesService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      id: [''],
      descricao: [''],
      tipoDespesa: [''],
      cartaoId: [''], // ID do cartão para filtro
      parcelado: [''] // true, false ou '' para todos
    });

    this.loadAvailableCards(); // Carrega os cartões disponíveis para o filtro
    this.loadDespesas(); // Carrega as despesas ao inicializar o componente
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Carrega os cartões disponíveis para o select de filtro.
   */
  loadAvailableCards(): void {
    this.cartoesService.getCartoes().subscribe({
      next: (cards) => {
        this.availableCards = cards;
      },
      error: (error) => {
        console.error('Erro ao carregar cartões para filtro:', error);
        // Não exibe snackBar aqui para não poluir, pois é um filtro secundário
      }
    });
  }

  /**
   * Carrega as despesas do backend, aplicando filtros se houver.
   */
  loadDespesas(): void {
    this.isLoading = true;
    const filters = this.filterForm.value;
    console.log('Aplicando filtros de despesas:', filters);

    this.despesaService.getDespesas(filters).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data: Despesa[]) => {
        this.dataSource.data = data;
        if (data.length === 0 && (filters.id || filters.descricao || filters.tipoDespesa || filters.cartaoId || filters.parcelado !== '')) {
          this.snackBar.open('Nenhuma despesas encontrada com os filtros aplicados.', 'Fechar', { duration: 2000 });
        } else if (data.length === 0) {
          this.snackBar.open('Nenhuma despesas cadastrada.', 'Fechar', { duration: 2000 });
        }
      },
      error: (error) => {
        console.error('Erro ao carregar despesas:', error);
        this.snackBar.open('Erro ao carregar despesas. Verifique sua conexão ou tente novamente.', 'Fechar', { duration: 5000 });
      }
    });
  }

  /**
   * Aplica os filtros definidos no formulário.
   */
  applyFilters(): void {
    this.loadDespesas();
  }

  /**
   * Limpa os filtros do formulário e recarrega as despesas.
   */
  clearFilters(): void {
    this.filterForm.reset({
      id: '',
      descricao: '',
      tipoDespesa: '',
      cartaoId: '',
      parcelado: ''
    });
    this.loadDespesas();
  }

  /**
   * Navega para a tela de adição de despesas.
   */
  addDespesa(): void {
    console.log('Navegar para tela de adicionar despesas');
    this.router.navigate(['/dashboard/despesas/nova']); // Exemplo de rota
  }

  /**
   * Navega para a tela de edição de despesas.
   * @param id ID da despesas a ser editada.
   */
  editDespesa(id: number): void {
    console.log('Editar despesas com ID:', id);
    this.router.navigate(['/dashboard/despesas/editar', id]); // Exemplo de rota
  }

  /**
   * Exclui uma despesas após confirmação.
   * @param id ID da despesas a ser excluída.
   */
  deleteDespesa(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Tem certeza que deseja excluir esta despesas?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.despesaService.deleteDespesa(id).pipe(
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: () => {
            this.snackBar.open('despesas excluída com sucesso!', 'Fechar', { duration: 3000 });
            this.loadDespesas();
          },
          error: (error) => {
            console.error('Erro ao excluir despesas:', error);
            const backendError = error.error?.message || 'Erro ao excluir despesas. Tente novamente.';
            this.snackBar.open(backendError, 'Fechar', { duration: 5000 });
          }
        });
      }
    });
  }
}
