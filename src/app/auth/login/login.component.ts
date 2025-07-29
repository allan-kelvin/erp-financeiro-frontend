import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule, // Importar MatFormFieldModule
    MatInputModule,     // Importar MatInputModule
    MatButtonModule,    // Importar MatButtonModule
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Injetar o serviço de autenticação
    private router: Router // Injetar o Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = null; // Limpa mensagens de erro anteriores

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      try {
        const result = await this.authService.login(email, password);
        // Verifica se o login foi bem-sucedido (ex: se um token foi retornado)
        if (result && result.access_token) { // Supondo que o backend retorna access_token
          console.log('Login bem-sucedido!', result);
          this.router.navigate(['/dashboard']); // Redireciona para o dashboard após login
        } else {
          this.errorMessage = 'Credenciais inválidas. Por favor, tente novamente.';
        }
      } catch (error: any) {
        console.error('Erro no login:', error);
        if (error.status === 401) {
          this.errorMessage = 'E-mail ou senha incorretos.';
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde.';
        }
      }
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      // Marca todos os campos como "touched" para exibir mensagens de validação
      this.loginForm.markAllAsTouched();
    }
  }
}
