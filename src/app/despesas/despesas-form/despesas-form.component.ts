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
import { finalize } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { Banco } from '../../banco/models/banco.model';
import { Cartao } from '../../cartoes/models/cartao.model';
import { CartoesService } from '../../cartoes/services/cartoes.service';
import { Fornecedor } from '../../fornecedor/interface/fornecedor.interface';
import { SubCategoria } from '../../sub-categorias/models/sub-categoria.model';
import { CategoriaEnum } from '../enums/CategoriaEnum';
import { FormaDePagamentoEnum } from '../enums/FormaPagamentoEnum';
import { GrupoEnum } from '../enums/GrupoEnum';
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

  FormaDePagamentoEnum = FormaDePagamentoEnum;
  CategoriaEnum = CategoriaEnum;
  GrupoEnum = GrupoEnum;

  debtForm!: FormGroup;
  formasPagamento = Object.values(FormaDePagamentoEnum);
  categorias = Object.values(CategoriaEnum);
  grupos = Object.values(GrupoEnum);


  isEditMode: boolean = false;
  despesaId: number | null = null;
  isLoading: boolean = false;
  availableCards: Cartao[] = [];
  availableBanks: Banco[] = [];
  availableFornecedor: Fornecedor[] = [];
  availableSubCategories: SubCategoria[] = []
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
      grupo: [null, Validators.required],
      categoria: [null, Validators.required],
      formaPagamento: [null, Validators.required],
      bancoId: [''],
      fornecedorId: [''],
      subCategoriaId: ['', Validators.required],
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
    this.loadAvailableCards();
    this.loadAvailableBanks();
    this.loadAvailableFornecedores();
    this.loadAvailableSubCategories();

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

  setupConditionalFields(): void {
    this.debtForm.get('formaPagamento')?.valueChanges.subscribe(value => {
      if (value === FormaDePagamentoEnum.CARTAO_CREDITO || value === FormaDePagamentoEnum.CARTAO_DEBITO) {
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

  parseCurrency(value: string | number): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
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

  loadDespesaData(id: number): void {
    this.isLoading = true;
    this.despesasService.getDespesaById(id).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (despesa: Despesa) => {
        this.debtForm.patchValue({
          descricao: despesa.descricao,
          cartaoId: despesa.cartaoId,
          data_lancamento: despesa.data_lancamento ? new Date(despesa.data_lancamento) : null,
          parcelado: despesa.parcelado,
          qtd_parcelas: despesa.qtd_parcelas,
          valor_parcela: despesa.valor_parcela,
          juros_aplicado: despesa.juros_aplicado,
          data_fim_parcela: despesa.data_fim_parcela ? new Date(despesa.data_fim_parcela) : null,
        });

        if (despesa.formaDePagamento === FormaDePagamentoEnum.CARTAO_CREDITO || FormaDePagamentoEnum.CARTAO_DEBITO) {
          this.debtForm.get('cartaoId')?.enable({ emitEvent: false });
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

  loadAvailableBanks(): void {
    this.despesasService.getBancos().subscribe({
      next: (banks) => this.availableBanks = banks,
      error: (error) => console.error('Erro ao carregar bancos:', error)
    });
  }

  loadAvailableFornecedores(): void {
    this.despesasService.getFornecedores().subscribe({
      next: (fornecedores) => this.availableFornecedor = fornecedores,
      error: (error) => console.error('Erro ao carregar fornecedores:', error)
    });
  }

  loadAvailableSubCategories(): void {
    this.despesasService.getSubCategorias().subscribe({
      next: (subs) => this.availableSubCategories = subs,
      error: (error) => console.error('Erro ao carregar subcategorias:', error)
    });
  }

  onSubmit(): void {
    if (this.debtForm.invalid) {
      this.debtForm.markAllAsTouched();
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const raw = this.debtForm.getRawValue();

    // valor_total -> number
    let valorNumber = typeof raw.valor_total === 'string'
      ? parseFloat(raw.valor_total.replace(/\./g, '').replace(',', '.'))
      : Number(raw.valor_total || 0);

    // data -> 'YYYY-MM-DD'
    const dataLanc = raw.data_lancamento; // Sem conversão. Enviar o objeto Date direto

    // helper pra ids opcionais: '' -> undefined, string -> number
    const asOptionalNumber = (v: any) => (v === '' || v === null || v === undefined) ? undefined : Number(v);

    // montar payload aceito pelo back (com aliases que o DTO já entende)
    const payload: any = {
      descricao: raw.descricao,
      categoria: raw.categoria,
      grupo: raw.grupo,
      formaDePagamento: raw.formaPagamento,
      valor: valorNumber,
      parcelado: !!raw.parcelado,
      qtd_parcelas: raw.parcelado ? Number(raw.qtd_parcelas) : undefined,
      valor_parcela: raw.parcelado ? Number(this.debtForm.get('valor_parcela')?.value || 0) : undefined,
      juros_aplicado: Number(this.debtForm.get('juros_aplicado')?.value || 0),
      total_com_juros: valorNumber,
      data_lancamento: dataLanc,
      cartaoId: asOptionalNumber(raw.cartaoId),
      subCategoriaId: Number(raw.subCategoriaId),
      fornecedorId: asOptionalNumber(raw.fornecedorId),
      bancoId: asOptionalNumber(raw.bancoId),
    };

    const usuarioId = this.authService.getUserId();
    if (!usuarioId) {
      this.snackBar.open('Erro: Usuário não autenticado.', 'Fechar', { duration: 3000 });
      this.isLoading = false;
      return;
    }
    payload.usuarioId = usuarioId;

    const request$ = (this.isEditMode && this.despesaId)
      ? this.despesasService.updateDespesa(this.despesaId, payload)
      : this.despesasService.createDespesa(payload);

    const successMessage = this.isEditMode ? 'Despesa atualizada com sucesso!' : 'Despesa cadastrada com sucesso!';
    const errorMessage = this.isEditMode ? 'Erro ao atualizar despesa. Tente novamente.' : 'Erro ao cadastrar despesa. Tente novamente.';

    request$.pipe(finalize(() => this.isLoading = false)).subscribe({
      next: () => {
        this.snackBar.open(successMessage, 'Fechar', { duration: 3000 });
        this.router.navigate(['/dashboard/despesas']);
      },
      error: (error) => {
        console.error('Erro na operação da despesa:', error);
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
