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
import { Divida } from './models/divida.model';
import { DividasService } from './services/dividas.service';

@Component({
  selector: 'app-dividas',
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
    MatProgressBarModule, // Adicionar MatProgressBarModule
    CurrencyPipe
  ],
  templateUrl: './dividas.component.html',
  styleUrl: './dividas.component.scss'
})
export class DividasComponent implements OnInit, AfterViewInit {

  filterForm!: FormGroup;
  dataSource = new MatTableDataSource<Divida>();
  displayedColumns: string[] = ['id', 'descricao', 'tipo_divida', 'cartao', 'valor_total', 'parcelado', 'qtd_parcelas', 'acoes'];
  isLoading: boolean = false;

  tipoDividas = Object.values(TipoCartaoEnum);
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
    private dividasService: DividasService, // Injete o serviço de dívidas
    private cartoesService: CartoesService, // Injete o serviço de cartões
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      id: [''],
      descricao: [''],
      tipoDivida: [''],
      cartaoId: [''], // ID do cartão para filtro
      parcelado: [''] // true, false ou '' para todos
    });

    this.loadAvailableCards(); // Carrega os cartões disponíveis para o filtro
    this.loadDividas(); // Carrega as dívidas ao inicializar o componente
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
   * Carrega as dívidas do backend, aplicando filtros se houver.
   */
  loadDividas(): void {
    this.isLoading = true;
    const filters = this.filterForm.value;
    console.log('Aplicando filtros de dívidas:', filters);

    this.dividasService.getDividas(filters).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data: Divida[]) => {
        this.dataSource.data = data;
        if (data.length === 0 && (filters.id || filters.descricao || filters.tipoDivida || filters.cartaoId || filters.parcelado !== '')) {
          this.snackBar.open('Nenhuma dívida encontrada com os filtros aplicados.', 'Fechar', { duration: 2000 });
        } else if (data.length === 0) {
          this.snackBar.open('Nenhuma dívida cadastrada.', 'Fechar', { duration: 2000 });
        }
      },
      error: (error) => {
        console.error('Erro ao carregar dívidas:', error);
        this.snackBar.open('Erro ao carregar dívidas. Verifique sua conexão ou tente novamente.', 'Fechar', { duration: 5000 });
      }
    });
  }

  /**
   * Aplica os filtros definidos no formulário.
   */
  applyFilters(): void {
    this.loadDividas();
  }

  /**
   * Limpa os filtros do formulário e recarrega as dívidas.
   */
  clearFilters(): void {
    this.filterForm.reset({
      id: '',
      descricao: '',
      tipoDivida: '',
      cartaoId: '',
      parcelado: ''
    });
    this.loadDividas();
  }

  /**
   * Navega para a tela de adição de dívida.
   */
  addDivida(): void {
    console.log('Navegar para tela de adicionar dívida');
    this.router.navigate(['/dashboard/dividas/nova']); // Exemplo de rota
  }

  /**
   * Navega para a tela de edição de dívida.
   * @param id ID da dívida a ser editada.
   */
  editDivida(id: number): void {
    console.log('Editar dívida com ID:', id);
    this.router.navigate(['/dashboard/dividas/editar', id]); // Exemplo de rota
  }

  /**
   * Exclui uma dívida após confirmação.
   * @param id ID da dívida a ser excluída.
   */
  deleteDivida(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Tem certeza que deseja excluir esta dívida?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.dividasService.deleteDivida(id).pipe(
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: () => {
            this.snackBar.open('Dívida excluída com sucesso!', 'Fechar', { duration: 3000 });
            this.loadDividas();
          },
          error: (error) => {
            console.error('Erro ao excluir dívida:', error);
            const backendError = error.error?.message || 'Erro ao excluir dívida. Tente novamente.';
            this.snackBar.open(backendError, 'Fechar', { duration: 5000 });
          }
        });
      }
    });
  }
}
