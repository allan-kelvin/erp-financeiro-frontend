import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { BandeiraEnum, StatusCartaoEnum, TipoCartaoEnum } from '../enums/cartaoEnum.enum';
import { Cartao } from '../models/cartao.model';
import { CartoesService } from '../services/cartoes.service';


@Component({
  selector: 'app-cartao-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './cartao-form.component.html',
  styleUrl: './cartao-form.component.scss'
})
export class CartaoFormComponent implements OnInit {
  cardForm!: FormGroup;
  isEditMode: boolean = false;
  cardId: number | null = null;
  cardImagePreview: SafeUrl | null = null;
  selectedFile: File | null = null;
  isLoading: boolean = false;

  // Enums para os selects
  cardBrands = Object.values(BandeiraEnum);
  cardTypes = Object.values(TipoCartaoEnum);
  cardStatuses = Object.values(StatusCartaoEnum);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cartoesService: CartoesService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cardForm = this.fb.group({
      descricao: ['', Validators.required],
      bandeira: ['', Validators.required],
      tipo_cartao: ['', Validators.required],
      status: [StatusCartaoEnum.ATIVO, Validators.required], // Padrão 'Ativo'
      // imagem_cartao não é um FormControl direto, mas será parte do FormData
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.cardId = +id;
        this.loadCardData(this.cardId);
      }
    });
  }

  /**
   * Carrega os dados do cartão para edição do backend.
   * @param id ID do cartão a ser carregado.
   */
  loadCardData(id: number): void {
    this.isLoading = true;
    this.cartoesService.getCartaoById(id).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (card: Cartao) => {
        this.cardForm.patchValue(card);
        if (card.imagem_cartao) {
          this.cardImagePreview = this.sanitizer.bypassSecurityTrustUrl(card.imagem_cartao);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar dados do cartão:', error);
        this.snackBar.open('Erro ao carregar cartão. Tente novamente.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/dashboard/cartoes']); // Volta para a listagem em caso de erro
      }
    });
  }

  /**
   * Lida com a seleção de arquivo de imagem.
   * @param event Evento de mudança do input file.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.cardImagePreview = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage(): void {
    this.cardImagePreview = null;
    this.selectedFile = null;
  }

  onSubmit(): void {
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const formData = new FormData();

    formData.append('descricao', this.cardForm.get('descricao')?.value);
    formData.append('bandeira', this.cardForm.get('bandeira')?.value);
    formData.append('tipo_cartao', this.cardForm.get('tipo_cartao')?.value);
    formData.append('status', this.cardForm.get('status')?.value);

    // Adiciona o ID do usuário logado
    const usuarioId = this.authService.getUserId(); // Supondo que você tenha um método para obter o ID do usuário
    if (usuarioId) {
      formData.append('usuarioId', usuarioId.toString());
    } else {
      console.error('ID do usuário não encontrado. Não é possível cadastrar/atualizar cartão.');
      this.snackBar.open('Erro: Usuário não autenticado.', 'Fechar', { duration: 3000 });
      this.isLoading = false;
      return;
    }

    // Adiciona o arquivo de imagem, se selecionado
    if (this.selectedFile) {
      formData.append('imagem_cartao_file', this.selectedFile, this.selectedFile.name);
    } else if (this.isEditMode && !this.cardImagePreview) {

    }


    let request$: Observable<Cartao>;
    let successMessage: string;
    let errorMessage: string;

    if (this.isEditMode && this.cardId) {
      request$ = this.cartoesService.updateCartao(this.cardId, formData);
      successMessage = 'Cartão atualizado com sucesso!';
      errorMessage = 'Erro ao atualizar cartão. Tente novamente.';
    } else {
      request$ = this.cartoesService.createCartao(formData);
      successMessage = 'Cartão cadastrado com sucesso!';
      errorMessage = 'Erro ao cadastrar cartão. Tente novamente.';
    }

    request$.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        this.snackBar.open(successMessage, 'Fechar', { duration: 3000 });
        this.router.navigate(['/dashboard/cartoes']);
      },
      error: (error) => {
        console.error('Erro na operação do cartão:', error);
        const backendError = error.error?.message || errorMessage;
        this.snackBar.open(backendError, 'Fechar', { duration: 5000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/cartoes']);
  }
  cancel(): void {
    this.router.navigate(['/dashboard/cartoes']);
  }
}
