import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { TipoConta } from './enums/tipoConta.enum';
import { IBanco } from './interface/IBanco.interface';
import { BancoService } from './services/banco.service';

@Component({
  selector: 'app-banco',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginator,
    MatOptionModule
  ],
  templateUrl: './banco.component.html',
  styleUrl: './banco.component.scss'
})
export class BancoComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['id', 'nome', 'ativo', 'acoes'];
  filterForm!: FormGroup;
  dataSource = new MatTableDataSource<IBanco>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  loading = false;

  // lista de tipos para popular o select de filtro
  tipoContas = Object.values(TipoConta);

  constructor(
    private bancoService: BancoService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      id: [''],
      descricao: [''],
      tipo_banco: [''] // <-- novo controle para o select de filtro
    });

    // filtro customizado: trata filter vazio e evita JSON.parse em string vazia
    this.dataSource.filterPredicate = (data: IBanco, filter: string) => {
      if (!filter) return true;
      let searchData: any;
      try {
        searchData = JSON.parse(filter);
      } catch {
        return true;
      }

      const idMatch = searchData.id ? data.id.toString().includes(searchData.id) : true;
      const descricaoMatch = searchData.descricao ? data.nome.toLowerCase().includes(String(searchData.descricao).toLowerCase()) : true;

      // Novo: se tipo_banco estiver preenchido, comparar com data.tipo_banco OR data.tipo_conta
      let tipoMatch = true;
      if (searchData.tipo_banco) {
        const tipoFiltro = String(searchData.tipo_banco).toLowerCase();
        // o retorno pode usar 'tipo_conta' (backend) ou 'tipo_banco' (frontend). Verifique ambos.
        const tipoItem = (data as any).tipo_conta ?? (data as any).tipo_banco ?? '';
        tipoMatch = String(tipoItem).toLowerCase().includes(tipoFiltro);
      }

      return idMatch && descricaoMatch && tipoMatch;
    };

    this.loadBanks();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadBanks(): void {
    this.loading = true;
    this.bancoService.list().subscribe({
      next: bancos => {
        this.loading = false;
        this.dataSource.data = bancos;
        if (this.paginator) this.paginator.firstPage();
      },
      error: err => {
        this.loading = false;
        console.error('Erro ao carregar bancos', err);
        this.snack.open('Erro ao carregar bancos', 'Fechar', { duration: 4000 });
      }
    });
  }

  applyFilters(): void {
    const filterValue = {
      id: this.filterForm.get('id')?.value,
      descricao: this.filterForm.get('descricao')?.value,
      tipo_banco: this.filterForm.get('tipo_banco')?.value
    };
    this.dataSource.filter = JSON.stringify(filterValue);
    if (this.paginator) this.paginator.firstPage();
  }

  clearFilters(): void {
    this.filterForm.reset({ id: '', descricao: '', tipo_banco: '' });
    this.dataSource.filter = '';
    this.loadBanks();
  }

  addBank(): void {
    this.router.navigate(['/dashboard/banco/novo']);
  }

  onEdit(banco: IBanco): void {
    this.router.navigate(['/dashboard/banco/editar', banco.id]);
  }

  onDelete(banco: IBanco): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir Banco',
        message: `Tem certeza que deseja excluir o banco '${banco.nome}'?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bancoService.delete(banco.id).subscribe({
          next: () => {
            this.snack.open('Banco removido', 'Fechar', { duration: 3000 });
            this.loadBanks();
          },
          error: err => {
            console.error('Erro ao excluir', err);
            this.snack.open('Erro ao excluir banco', 'Fechar', { duration: 4000 });
          }
        });
      }
    });
  }
}
