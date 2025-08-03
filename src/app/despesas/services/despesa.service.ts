import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
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

  /**
   * Busca todas as despesas do usuário autenticado, com filtros opcionais.
   * @param filters Objeto com os filtros (id, descricao, tipoDespesa, cartaoId, parcelado).
   * @returns Um Observable com a lista de despesas.
   */
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

  /**
   * Busca uma despesas específica pelo ID.
   * @param id ID da despesas.
   * @returns Um Observable com a despesas.
   */
  getDespesaById(id: number): Observable<Despesa> {
    return this.http.get<Despesa>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  /**
   * Cria uma nova despesas.
   * @param despesa Os dados da despesas a ser criada.
   * @returns Um Observable com a despesas criada.
   */
  createDespesa(despesa: Despesa): Observable<Despesa> {
    // Para criar, o backend espera um objeto JSON, não FormData, a menos que haja upload de arquivo
    return this.http.post<Despesa>(this.apiUrl, despesa, { headers: this.getAuthHeaders() });
  }

  /**
   * Atualiza uma despesas existente.
   * @param id ID da despesas a ser atualizada.
   * @param despesa Os dados atualizados da despesas.
   * @returns Um Observable com a despesas atualizada.
   */
  updateDespesa(id: number, despesa: Despesa): Observable<Despesa> {
    // Para atualizar, o backend espera um objeto JSON
    return this.http.patch<Despesa>(`${this.apiUrl}/${id}`, despesa, { headers: this.getAuthHeaders() });
  }

  /**
   * Exclui uma despesas.
   * @param id ID da despesas a ser excluída.
   * @returns Um Observable vazio.
   */
  deleteDespesa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
