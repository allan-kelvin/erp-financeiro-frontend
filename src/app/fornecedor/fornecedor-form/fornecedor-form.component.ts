import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Fornecedor } from '../interface/fornecedor.interface';
import { FornecedorService } from '../services/fornecedor.service';

@Component({
  selector: 'app-fornecedor-form',
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
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './fornecedor-form.component.html',
  styleUrls: ['./fornecedor-form.component.scss']
})
export class FornecedorFormComponent implements OnInit {
  fornecedor: Partial<Fornecedor> = {
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    ie: null,
    dataCadastro: new Date(),
    ativo: true,
    telefone: '',
    whatsapp: undefined,
    email: undefined
  };
  isEditMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fornecedorService: FornecedorService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.isLoading = true;
      this.fornecedorService.findOne(+id).subscribe({
        next: (data) => {
          this.fornecedor = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar fornecedor para edição:', err);
          this.errorMessage = 'Não foi possível carregar o fornecedor para edição.';
          this.isLoading = false;
        }
      });
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.isEditMode && this.fornecedor.id) {
      this.fornecedorService.updateFornecedor(this.fornecedor.id, this.fornecedor as Fornecedor).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.successMessage = 'Fornecedor atualizado com sucesso!';
          setTimeout(() => this.router.navigate(['/fornecedor']), 2000);
        },
        error: (err) => {
          console.error('Erro ao atualizar fornecedor:', err);
          this.errorMessage = 'Erro ao atualizar fornecedor. Verifique os dados.';
        }
      });
    } else {
      this.fornecedorService.createFornecedor(this.fornecedor as Fornecedor).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.successMessage = 'Fornecedor cadastrado com sucesso!';
          this.fornecedor = {
            razaoSocial: '',
            nomeFantasia: '',
            cnpj: '',
            ie: null,
            dataCadastro: new Date(),
            ativo: true,
            telefone: '',
            whatsapp: null,
            email: null
          };
          setTimeout(() => this.router.navigate(['/fornecedor']), 2000);
        },
        error: (err) => {
          console.error('Erro ao cadastrar fornecedor:', err);
          this.errorMessage = 'Erro ao cadastrar fornecedor. Verifique os dados.';
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/fornecedor']);
  }
}
