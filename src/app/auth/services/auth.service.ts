import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
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

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }
}
