import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { Banco } from '../../banco/models/banco.model';
import { Fornecedor } from '../../fornecedor/interface/fornecedor.interface';
import { SubCategoria } from '../../sub-categorias/models/sub-categoria.model';
import { Despesa } from '../models/despesa.model';

@Injectable({
  providedIn: 'root'
})
export class DespesaService {
  private apiUrl = `${environment.apiUrl}/despesas`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(contentType: string = 'application/json'): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (contentType) {
      headers = headers.set('Content-Type', contentType);
    }
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getDespesas(filters?: any): Observable<Despesa[]> {
    let params = new HttpParams();
    if (filters) {
      for (const key in filters) {
        if (filters.hasOwnProperty(key) && filters[key]) {
          let paramKey = key;
          if (key === 'tipoDespesa') {
            paramKey = 'tipo_despesa';
          }
          params = params.append(paramKey, filters[key]);
        }
      }
    }
    return this.http.get<Despesa[]>(this.apiUrl, { headers: this.getAuthHeaders(), params: params });
  }

  getDespesaById(id: number): Observable<Despesa> {
    return this.http.get<Despesa>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getBancos(): Observable<Banco[]> {
    return this.http.get<Banco[]>(`${environment.apiUrl}/banco`, { headers: this.getAuthHeaders() });
  }

  getFornecedores(): Observable<Fornecedor[]> {
    return this.http.get<Fornecedor[]>(`${environment.apiUrl}/fornecedor`, { headers: this.getAuthHeaders() });
  }

  getSubCategorias(): Observable<SubCategoria[]> {
    return this.http.get<SubCategoria[]>(`${environment.apiUrl}/sub-categoria`, { headers: this.getAuthHeaders() });
  }

  createDespesa(despesa: Despesa): Observable<Despesa> {
    return this.http.post<Despesa>(this.apiUrl, despesa, { headers: this.getAuthHeaders() });
  }

  updateDespesa(id: number, despesa: Despesa): Observable<Despesa> {
    return this.http.patch<Despesa>(`${this.apiUrl}/${id}`, despesa, { headers: this.getAuthHeaders() });
  }

  deleteDespesa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
