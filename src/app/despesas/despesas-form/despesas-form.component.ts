import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core'; // Para o datepicker (módulo nativo)
import { MatDatepickerModule } from '@angular/material/datepicker'; // Para o datepicker
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { addMonths } from 'date-fns';
import { finalize, Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { Cartao } from '../../cartoes/models/cartao.model';
import { CartoesService } from '../../cartoes/services/cartoes.service';
import { TipoDespesaEnum } from '../enums/TipoDespesaEnum';
import { Despesa } from '../models/despesa.model';
import { DespesaService } from '../services/despesa.service';

@Component({
  selector: 'app-despesas-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    DatePipe,
    CurrencyPipe,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './despesas-form.component.html',
  styleUrl: './despesas-form.component.scss'
})
export class DespesasFormComponent implements OnInit {

  debtForm!: FormGroup;
  isEditMode: boolean = false;
  despesaId: number | null = null;
  isLoading: boolean = false;

  debtTypes = Object.values(TipoDespesaEnum);
  availableCards: Cartao[] = [];
  installmentOptions: number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 36, 48, 60, 72, 84, 95, 100, 120, 180, 360];

  isCardFieldEnabled: boolean = false;
  isParcelasFieldEnabled: boolean = false;

  // Máscara de moeda (para o valor total)
  currencyMask = {
    mask: (value: any) => {
      const stringValue = value.toString().replace(/\D/g, '');
      const integerPart = stringValue.slice(0, stringValue.length - 2);
      const decimalPart = stringValue.slice(stringValue.length - 2);
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return ['R', '$', ' ', ...formattedInteger.split(''), ',', decimalPart.split('')];
    },
    guide: false,
    keepCharPositions: true,
    showMask: false,
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private despesasService: DespesaService,
    private cartoesService: CartoesService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private currencyPipe: CurrencyPipe
  ) { }

  ngOnInit(): void {
    this.debtForm = this.fb.group({
      descricao: ['', Validators.required],
      tipo_despesa: ['', Validators.required],
      cartaoId: [{ value: '', disabled: true }],
      data_lancamento: ['', Validators.required],
      valor_total: [0, [Validators.required, Validators.min(0.01)]],
      parcelado: [false, Validators.required],
      qtd_parcelas: [null],
      valor_parcela: [{ value: 0, disabled: true }],
      juros_aplicado: [0],
      data_fim_parcela: [{ value: null, disabled: true }],
      qant_parcelas_restantes: ['']
    });

    this.setupConditionalFields();
    this.setupCalculatedFields();
    this.loadAvailableCards();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.despesaId = +id;
        this.loadDespesaData(this.despesaId);
      }
    });
  }

  onValorTotalBlur(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const numericValue = this.debtForm.get('valor_total')?.value ?? 0;

    inputElement.value = this.currencyPipe.transform(
      numericValue,
      'BRL',
      'symbol',
      '1.2-2',
      'pt'
    ) || '';
  }

  onValorTotalInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value.replace(/\D/g, '');

    if (rawValue) {
      const paddedValue = rawValue.padStart(3, '0'); // garante ao menos 3 dígitos
      const numericValue = parseFloat(paddedValue) / 100;

      // Atualiza o form sem emitir eventos desnecessários
      this.debtForm.get('valor_total')?.setValue(numericValue, { emitEvent: false });

      // Atualiza o valor no input com máscara BRL
      inputElement.value = this.currencyPipe.transform(
        numericValue,
        'BRL',
        'symbol',
        '1.2-2',
        'pt'
      ) || '';
    } else {
      this.debtForm.get('valor_total')?.setValue(0, { emitEvent: false });
      inputElement.value = '';
    }
  }

  /**
   * Configura a lógica para habilitar/desabilitar campos condicionalmente.
   */
  setupConditionalFields(): void {
    this.debtForm.get('tipo_despesa')?.valueChanges.subscribe(value => {
      if (value === TipoDespesaEnum.CARTAO) {
        this.debtForm.get('cartaoId')?.enable();
        this.debtForm.get('cartaoId')?.setValidators(Validators.required);
        this.isCardFieldEnabled = true; // Mantenha se for usado para *ngIf
      } else {
        this.debtForm.get('cartaoId')?.disable();
        this.debtForm.get('cartaoId')?.clearValidators();
        this.debtForm.get('cartaoId')?.setValue('');
        this.isCardFieldEnabled = false; // Mantenha se for usado para *ngIf
      }
      this.debtForm.get('cartaoId')?.updateValueAndValidity();
    });

    this.debtForm.get('parcelado')?.valueChanges.subscribe(value => {
      if (value === true) {
        this.debtForm.get('qtd_parcelas')?.enable();
        this.debtForm.get('qtd_parcelas')?.setValidators(Validators.required);
        this.isParcelasFieldEnabled = true; // Mantenha se for usado para *ngIf
      } else {
        this.debtForm.get('qtd_parcelas')?.disable();
        this.debtForm.get('qtd_parcelas')?.clearValidators();
        this.debtForm.get('qtd_parcelas')?.setValue(null);
        this.isParcelasFieldEnabled = false; // Mantenha se for usado para *ngIf
      }
      this.debtForm.get('qtd_parcelas')?.updateValueAndValidity();
    });
  }

  /**
   * Configura a lógica para campos calculados (valor parcela, juros, data fim).
   */
  setupCalculatedFields(): void {
    this.debtForm.valueChanges.subscribe(values => {
      const valorTotal = this.parseCurrency(values.valor_total);
      const parcelado = values.parcelado;
      const qtdParcelas = values.qtd_parcelas;
      const dataLancamento = values.data_lancamento;

      let valorParcela = 0;
      let jurosAplicado = 0;
      let dataFimParcela: Date | null = null;

      if (parcelado && qtdParcelas && valorTotal > 0) {
        valorParcela = valorTotal / qtdParcelas;

        if (dataLancamento) {
          dataFimParcela = addMonths(new Date(dataLancamento), qtdParcelas);
        }
      } else {
        valorParcela = valorTotal;
        jurosAplicado = 0;
        dataFimParcela = null;
      }

      // ❗ Evita loops infinitos
      this.debtForm.get('valor_parcela')?.setValue(valorParcela, { emitEvent: false });
      this.debtForm.get('juros_aplicado')?.setValue(jurosAplicado, { emitEvent: false });
      this.debtForm.get('data_fim_parcela')?.setValue(dataFimParcela, { emitEvent: false });
    });
  }

  /**
   * Converte a string de moeda para um número.
   * @param value String formatada como moeda (ex: "R$ 1.234,56").
   * @returns Número (ex: 1234.56).
   */
  parseCurrency(value: string | number): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
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
      }
    });
  }

  /**
   * Carrega os dados da despesas para edição do backend.
   * @param id ID da despesas a ser carregada.
   */
  loadDespesaData(id: number): void {
    this.isLoading = true;
    this.despesasService.getDespesaById(id).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (despesa: Despesa) => {
        this.debtForm.patchValue({
          descricao: despesa.descricao,
          tipo_despesa: despesa.tipo_despesa,
          cartaoId: despesa.cartaoId,
          data_lancamento: despesa.data_lancamento ? new Date(despesa.data_lancamento) : null,
          valor_total: despesa.valor_total,
          parcelado: despesa.parcelado,
          qtd_parcelas: despesa.qtd_parcelas,
          valor_parcela: despesa.valor_parcela,
          juros_aplicado: despesa.juros_aplicado,
          data_fim_parcela: despesa.data_fim_parcela ? new Date(despesa.data_fim_parcela) : null,
        });

        if (despesa.tipo_despesa === TipoDespesaEnum.CARTAO) {
          this.debtForm.get('cartaoId')?.enable({ emitEvent: false }); // Desabilita o evento para evitar loop
        } else {
          this.debtForm.get('cartaoId')?.disable({ emitEvent: false });
        }
        if (despesa.parcelado) {
          this.debtForm.get('qtd_parcelas')?.enable({ emitEvent: false });
        } else {
          this.debtForm.get('qtd_parcelas')?.disable({ emitEvent: false });
        }

        // Atualiza o valor do input manualmente para exibir formatado
        const valorTotalControl = this.debtForm.get('valor_total');
        if (valorTotalControl && valorTotalControl.value !== null) {
          const inputElement = document.querySelector(`input[formControlName="valor_total"]`) as HTMLInputElement;
          if (inputElement) {
            inputElement.value = this.currencyPipe.transform(valorTotalControl.value, 'BRL', 'symbol', '1.2-2', 'pt') || '';
          }
        }
      },
      error: (error) => {
        console.error('Erro ao carregar dados da despesas:', error);
        this.snackBar.open('Erro ao carregar despesas. Tente novamente.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/dashboard/despesas']);
      }
    });
  }

  /**
   * Envia os dados do formulário para o backend.
   */
  onSubmit(): void {
    if (this.debtForm.invalid) {
      this.debtForm.markAllAsTouched();
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const formData = this.debtForm.getRawValue();

    if (typeof formData.valor_total === 'string') {
      formData.valor_total = parseFloat(formData.valor_total.replace(',', '.'));
    }

    if (formData.data_lancamento instanceof Date) {
      formData.data_lancamento = formData.data_lancamento.toISOString().split('T')[0];
    }

    // Adiciona o ID do usuário logado
    const usuarioId = this.authService.getUserId();
    if (usuarioId) {
      formData.usuarioId = usuarioId;
    } else {
      this.snackBar.open('Erro: Usuário não autenticado.', 'Fechar', { duration: 3000 });
      this.isLoading = false;
      return;
    }

    delete formData.valor_parcela;
    delete formData.qant_parcelas_restantes;
    delete formData.data_fim_parcela;

    let request$: Observable<Despesa>;
    let successMessage: string;
    let errorMessage: string;

    if (this.isEditMode && this.despesaId) {
      request$ = this.despesasService.updateDespesa(this.despesaId, formData);
      successMessage = 'despesas atualizada com sucesso!';
      errorMessage = 'Erro ao atualizar despesas. Tente novamente.';
    } else {
      request$ = this.despesasService.createDespesa(formData);
      successMessage = 'despesas cadastrada com sucesso!';
      errorMessage = 'Erro ao cadastrar despesas. Tente novamente.';
    }

    request$.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        this.snackBar.open(successMessage, 'Fechar', { duration: 3000 });
        this.router.navigate(['/dashboard/despesas']);
      },
      error: (error) => {
        console.error('Erro na operação da despesas:', error);
        const backendError = error.error?.message || errorMessage;
        this.snackBar.open(backendError, 'Fechar', { duration: 5000 });
      }
    });
  }

  /**
   * Volta para a tela de listagem de despesass.
   */
  goBack(): void {
    this.router.navigate(['/dashboard/despesas']);
  }

  /**
   * Cancela a operação e volta para a tela de listagem de despesass.
   */
  cancel(): void {
    this.router.navigate(['/dashboard/despesas']);
  }

}
