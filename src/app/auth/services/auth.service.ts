import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { jwtDecode } from 'jwt-decode';
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  async login(email: string, password: string): Promise<any> {
    const response = await firstValueFrom(
      this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password })
    );
    if (response && response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }
    return response;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.sub; // 'sub' é o campo padrão para o ID do usuário no JWT
      } catch (error) {
        console.error('Erro ao decodificar token JWT:', error);
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }
}
