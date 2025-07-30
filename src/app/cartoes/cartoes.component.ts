import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { BandeiraEnum, StatusCartaoEnum, TipoCartaoEnum } from './enums/cartaoEnum.enum';
import { Cartao } from './models/cartao.model';
import { CartoesService } from './services/cartoes.service';

@Component({
  selector: 'app-cartoes',
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
  ],
  templateUrl: './cartoes.component.html',
  styleUrl: './cartoes.component.scss'
})
export class CartoesComponent implements OnInit, AfterViewInit {

  filterForm!: FormGroup;
  dataSource = new MatTableDataSource<Cartao>();
  displayedColumns: string[] = ['id', 'bandeira', 'descricao', 'tipo_cartao', 'imagem_cartao', 'status', 'acoes'];

  // Enums para os selects de filtro
  cardBrands = Object.values(BandeiraEnum);
  cardTypes = Object.values(TipoCartaoEnum);
  cardStatuses = Object.values(StatusCartaoEnum);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartoesService: CartoesService // Injete o serviço de cartões
  ) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      id: [''],
      descricao: [''],
      tipoCartao: [''],
      bandeira: ['']
    });

    this.loadCards(); // Carrega os cartões ao inicializar o componente
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Carrega os cartões do backend, aplicando filtros se houver.
   */
  loadCards(): void {
    const filters = this.filterForm.value;

    // Aqui você pode adaptar caso queira aplicar filtros futuramente
    this.cartoesService.findAll().subscribe({
      next: (cartoes: Cartao[]) => {
        this.dataSource.data = cartoes;
      },
      error: (err) => {
        console.error('Erro ao buscar cartões:', err);
      }
    });
  }

  /**
   * Aplica os filtros definidos no formulário.
   */
  applyFilters(): void {
    this.loadCards();
  }

  /**
   * Limpa os filtros do formulário e recarrega os cartões.
   */
  clearFilters(): void {
    this.filterForm.reset();
    this.loadCards();
  }

  /**
   * Navega para a tela de adição de cartão.
   */
  addCard(): void {
    console.log('Navegar para tela de adicionar cartão');
    this.router.navigate(['/dashboard/cartoes/novo']); // Exemplo de rota
  }

  /**
   * @param id ID do cartão a ser editado.
   */
  editCard(id: number): void {
    console.log('Editar cartão com ID:', id);
    this.router.navigate(['/cartoes/editar', id]); // Exemplo de rota
  }

  /**
   * @param id ID do cartão a ser excluído.
   */
  deleteCard(id: number): void {
    console.log('Excluir cartão com ID:', id);
  }

}
