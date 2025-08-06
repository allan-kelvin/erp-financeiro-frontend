import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { SubCategoria } from './models/sub-categoria.model';
import { SubCategoriaService } from './services/sub-categoria.service';


@Component({
  selector: 'app-sub-categorias',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatPaginator,
    FormsModule

  ],
  templateUrl: './sub-categorias.component.html',
  styleUrl: './sub-categorias.component.scss'
})
export class SubCategoriasComponent implements OnInit, AfterViewInit {
  subCategories: SubCategoria[] = [];
  dataSource = new MatTableDataSource<SubCategoria>([]);
  displayedColumns: string[] = ['id', 'description', 'status', 'actions'];

  filterId: number | null = null;
  filterDescription: string = '';

  isLoading: boolean = true;
  errorMessage: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private subCategoryService: SubCategoriaService,
    private router: Router,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('OnInit: Carregando sub-categorias...');
    this.loadSubCategoria();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    console.log('ngAfterViewInit: Paginator atribuído ao dataSource.');
  }


  loadSubCategoria(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.subCategoryService.getSubCategoria().subscribe({
      next: (data) => {
        console.log('Dados recebidos do backend:', data);
        console.log('Tipo dos dados recebidos:', typeof data, Array.isArray(data));

        this.subCategories = data;
        this.dataSource.data = data;
        this.isLoading = false;
        console.log('dataSource.data após atribuição:', this.dataSource.data);
        console.log('isLoading após carregamento:', this.isLoading);
        console.log('dataSource.data.length:', this.dataSource.data.length);

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          console.log('Paginator atribuído ao dataSource após carregamento dos dados.');
        } else {
          console.warn('MatPaginator não encontrado após carregamento dos dados. Verifique a renderização condicional.');
        }
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar sub-categorias:', err);
        this.errorMessage = 'Não foi possível carregar as sub-categorias. Tente novamente mais tarde.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.dataSource.filterPredicate = (data: SubCategoria, filter: string) => {
      const idMatch = this.filterId ? data.id === this.filterId : true;
      const descriptionMatch = data.description.toLowerCase().includes(this.filterDescription.toLowerCase());
      return idMatch && descriptionMatch;
    };
    this.dataSource.filter = 'customFilterTrigger';

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onClear(): void {
    this.filterId = null;
    this.filterDescription = '';
    this.dataSource.filter = '';

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onAdd(): void {
    this.router.navigate(['/dashboard/sub-categorias/novo']);
  }

  deleteSubCategoria(id: number, description: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir Sub-Categoria',
        message: `Tem certeza que deseja excluir a Sub-Categoria '${description}'?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subCategoryService.deleteSubCategoria(id).subscribe({
          next: () => {
            this.snack.open('Sub-categoria excluída com sucesso!', 'Fechar', { duration: 3000 })
            this.loadSubCategoria();
          },
          error: (err) => {
            console.error('Erro ao excluir sub-categoria:', err);
            this.snack.open('Erro ao excluir sub-categoria', 'Fechar', { duration: 4000 });
          }
        });
      }
    })
  }

  editSubCategoria(id: number): void {
    this.router.navigate(['/dashboard/sub-categorias/editar', id]);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
  }
}
