import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoConta } from '../enums/tipoConta.enum';
import { Banco } from '../models/banco.model';
import { BancoService } from '../services/banco.service';

@Component({
  selector: 'app-banco-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './banco-form.component.html',
  styleUrl: './banco-form.component.scss'
})
export class BancoFormComponent implements OnInit {
  cadastroForm!: FormGroup;
  tipoContas = Object.values(TipoConta);
  previewImage: string | ArrayBuffer | null = null;
  selectedFile?: File | null = null;
  loading = false;
  editingId?: number | null = null;

  constructor(
    private fb: FormBuilder,
    private bancoService: BancoService,
    private snack: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.cadastroForm = this.fb.group({
      nome: ['', Validators.required],
      tipo_banco: ['', Validators.required],
      ativo: [true],
      status: ['Ativo', Validators.required],
      imagem: [null]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editingId = Number(id);
        this.loadBanco(this.editingId);
      }
    });
  }

  private loadBanco(id: number): void {
    this.loading = true;
    this.bancoService.getById(id).subscribe({
      next: (banco: Banco & any) => {
        this.loading = false;
        // Mapear: backend pode retornar tipo_conta ou tipo_banco
        const tipo = (banco.tipo_conta ?? banco.tipo_banco) ?? '';
        const imagemUrl = (banco.imagem_banco ?? banco.imagem) ?? null;
        // Popula o form (normaliza status -> ativo boolean)
        this.cadastroForm.patchValue({
          nome: banco.nome ?? '',
          tipo_banco: tipo,
          status: banco.status ?? (banco.ativo ? 'Ativo' : 'Inativo'),
          ativo: banco.status ? (banco.status === 'Ativo') : (banco.ativo ?? true)
        });
        if (imagemUrl) {
          this.previewImage = imagemUrl;
        }
      },
      error: err => {
        this.loading = false;
        console.error('Erro ao carregar banco', err);
        this.snack.open('Erro ao carregar dados do banco', 'Fechar', { duration: 4000 });
      }
    });
  }

  /**
   * Ao selecionar arquivo, guarda o File e gera preview.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      this.previewImage = null;
      this.cadastroForm.patchValue({ imagem: null });
      return;
    }

    const file = input.files[0];
    this.selectedFile = file;
    this.cadastroForm.patchValue({ imagem: file });

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Salva (create ou update). Monta FormData no serviço.
   */
  onSave(): void {
    if (this.cadastroForm.invalid) {
      this.snack.open('Preencha os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    const fv = this.cadastroForm.value;

    // Monta payload compatível com BancoService.create/update
    const payload: {
      nome: string;
      tipo_conta: string;
      status?: string;
      ativo?: boolean;
      imagem?: File | null;
    } = {
      nome: fv.nome,
      tipo_conta: fv.tipo_banco,
      imagem: this.selectedFile ?? null
    };

    // Preferir enviar 'status' se o form tiver esse campo preenchido corretamente
    if (fv.status) {
      payload.status = fv.status;
    } else if (fv.ativo !== undefined) {
      payload.ativo = fv.ativo;
    }

    this.loading = true;

    if (this.editingId) {
      // update
      this.bancoService.update(this.editingId, payload).subscribe({
        next: (updated) => {
          this.loading = false;
          this.snack.open('Banco atualizado com sucesso', 'Fechar', { duration: 3000 });
          this.router.navigate(['/dashboard/banco']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Erro ao atualizar banco', err);
          const msg = err?.error?.message || 'Erro ao atualizar banco';
          this.snack.open(msg, 'Fechar', { duration: 4000 });
        }
      });
    } else {
      // create
      this.bancoService.create(payload).subscribe({
        next: (created) => {
          this.loading = false;
          this.snack.open('Banco cadastrado com sucesso', 'Fechar', { duration: 3000 });
          this.router.navigate(['/dashboard/banco']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Erro ao cadastrar banco', err);
          const msg = err?.error?.message || 'Erro ao cadastrar banco';
          this.snack.open(msg, 'Fechar', { duration: 4000 });
        }
      });
    }
  }

  /**
   * Volta para listagem.
   */
  goBack(): void {
    this.router.navigate(['/dashboard/banco']);
  }
}
