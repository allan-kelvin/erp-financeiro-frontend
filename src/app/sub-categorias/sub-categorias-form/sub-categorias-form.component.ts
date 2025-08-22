import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; // Para o status Ativo/Inativo
import { ActivatedRoute, Router } from '@angular/router';
import { SubCategoria } from '../models/sub-categoria.model';
import { SubCategoriaService } from '../services/sub-categoria.service';


@Component({
  selector: 'app-sub-categorias-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './sub-categorias-form.component.html',
  styleUrl: './sub-categorias-form.component.scss'
})
export class SubCategoriasFormComponent implements OnInit {

  subCategoria: Partial<SubCategoria> = {
    descricao: '',
    status: true
  };
  isEditMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subCategoriaService: SubCategoriaService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.isLoading = true;
      this.subCategoriaService.getSubCategoriaById(+id).subscribe({
        next: (data) => {
          this.subCategoria = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar sub-categoria para edição:', err);
          this.errorMessage = 'Não foi possível carregar a sub-categoria para edição.';
          this.isLoading = false;
        }
      });
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.isEditMode && this.subCategoria.id) {
      // Atualizar
      this.subCategoriaService.updateSubCategoria(this.subCategoria.id, this.subCategoria).subscribe({
        next: () => {
          this.successMessage = 'Sub-categoria atualizada com sucesso!';
          this.isLoading = false;
          // Opcional: navegar de volta para a lista após um tempo
          setTimeout(() => this.router.navigate(['/dashboard/sub-categorias']), 2000);
        },
        error: (err) => {
          console.error('Erro ao atualizar sub-categoria:', err);
          this.errorMessage = 'Erro ao atualizar sub-categoria. Verifique os dados.';
          this.isLoading = false;
        }
      });
    } else {
      this.subCategoriaService.createSubCategoria(this.subCategoria).subscribe({
        next: () => {
          this.successMessage = 'Sub-categoria cadastrada com sucesso!';
          this.isLoading = false;
          this.subCategoria = { descricao: '', status: true };
          setTimeout(() => this.router.navigate(['/dashboard/sub-categorias']), 2000);
        },
        error: (err) => {
          console.error('Não foi possivel cadastrar sub-categoria:', err);
          this.errorMessage = 'Erro ao cadastrar sub-categoria. Verifique os dados.';
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/sub-categorias']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/sub-categorias']);
  }

}
