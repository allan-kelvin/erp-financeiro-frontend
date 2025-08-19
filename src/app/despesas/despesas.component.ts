import { CommonModule, CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Banco } from '../banco/models/banco.model';
import { BancoService } from '../banco/services/banco.service';
import { Cartao } from '../cartoes/models/cartao.model';
import { CartoesService } from '../cartoes/services/cartoes.service';
import { Fornecedor } from '../fornecedor/interface/fornecedor.interface';
import { FornecedorService } from '../fornecedor/services/fornecedor.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { SubCategoria } from '../sub-categorias/models/sub-categoria.model';
import { SubCategoriaService } from '../sub-categorias/services/sub-categoria.service';
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
    CurrencyPipe,
    FormsModule
  ],
  templateUrl: './despesas.component.html',
  styleUrl: './despesas.component.scss'
})
export class DespesasComponent implements OnInit, AfterViewInit {

  consultaForm = new FormGroup({
    grupo: new FormControl(null)
  });

  filterForm!: FormGroup;
  dataSource = new MatTableDataSource<Despesa>();
  displayedColumns: string[] = [
    'id',
    'descricao',
    'subCategoria',
    'fornecedor',
    'banco',
    'cartao',
    'valor',
    'parcelado',
    'qtd_parcelas',
    'acoes'
  ];

  isLoading: boolean = false;

  availableCards: Cartao[] = [];
  availableSubCategorias: SubCategoria[] = [];
  availableFornecedores: Fornecedor[] = [];
  availableBancos: Banco[] = [];
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
    private bancoService: BancoService,
    private fornecedorService: FornecedorService,
    private subCategoriaService: SubCategoriaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      id: [''],
      descricao: [''],
      tipoDespesa: [''],
      cartaoId: [''],
      parcelado: [''],
      subCategoriaId: [''],
      fornecedorId: [''],
      bancoId: [''],

    });

    this.loadAvailableCards();
    this.loadDespesas();
    this.loadAvailableSubCategorias();
    this.loadAvailableFornecedores();
    this.loadAvailableBancos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAvailableCards(): void {
    this.cartoesService.getCartoes().subscribe({
      next: (cards) => {
        this.availableCards = cards;
      },
      error: (error) => {
        console.error('Erro ao carregar cartões para filtro:', error);
      }
    });
  }

  loadAvailableSubCategorias(): void {
    this.subCategoriaService.getSubCategoria().subscribe({
      next: (subcats) => this.availableSubCategorias = subcats,
      error: (error) => console.error('Erro ao carregar sub-categorias:', error)
    });
  }

  loadAvailableFornecedores(): void {
    this.fornecedorService.getFornecedores().subscribe({
      next: (fornecs) => this.availableFornecedores = fornecs,
      error: (error) => console.error('Erro ao carregar fornecedores:', error)
    });
  }

  loadAvailableBancos(): void {
    this.bancoService.getBancos().subscribe({
      next: (bancos) => this.availableBancos = bancos,
      error: (error) => console.error('Erro ao carregar bancos:', error)
    });
  }

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


  applyFilters(): void {
    this.loadDespesas();
  }


  clearFilters(): void {
    this.filterForm.reset({
      id: '',
      descricao: '',
      tipoDespesa: '',
      cartaoId: '',
      parcelado: '',
      subCategoriaId: '',
      fornecedorId: '',
      bancoId: ''
    });
    this.loadDespesas();
  }


  addDespesa(): void {
    this.router.navigate(['/dashboard/despesas/nova']);
  }

  editDespesa(id: number): void {
    this.router.navigate(['/dashboard/despesas/editar', id]);
  }

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
