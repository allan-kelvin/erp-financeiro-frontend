import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service'; // Importe o AuthService
import { Divida } from '../models/divida.model'; // Importe o modelo Divida

@Injectable({
  providedIn: 'root'
})
export class DividasService {
  private apiUrl = `${environment.apiUrl}/dividas`; // URL base para a API de dívidas

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
   * Busca todas as dívidas do usuário autenticado, com filtros opcionais.
   * @param filters Objeto com os filtros (id, descricao, tipoDivida, cartaoId, parcelado).
   * @returns Um Observable com a lista de dívidas.
   */
  getDividas(filters?: any): Observable<Divida[]> {
    let params = new HttpParams();
    if (filters) {
      for (const key in filters) {
        if (filters.hasOwnProperty(key) && filters[key]) {
          // Ajuste para o nome do campo no backend se for diferente (ex: tipo_divida vs tipoDivida)
          // No backend, o DTO tem 'tipo_divida', então ajuste aqui se o filtro for por 'tipoDivida'
          let paramKey = key;
          if (key === 'tipoDivida') {
            paramKey = 'tipo_divida';
          }
          params = params.append(paramKey, filters[key]);
        }
      }
    }
    return this.http.get<Divida[]>(this.apiUrl, { headers: this.getAuthHeaders(), params: params });
  }

  /**
   * Busca uma dívida específica pelo ID.
   * @param id ID da dívida.
   * @returns Um Observable com a dívida.
   */
  getDividaById(id: number): Observable<Divida> {
    return this.http.get<Divida>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  /**
   * Cria uma nova dívida.
   * @param divida Os dados da dívida a ser criada.
   * @returns Um Observable com a dívida criada.
   */
  createDivida(divida: Divida): Observable<Divida> {
    // Para criar, o backend espera um objeto JSON, não FormData, a menos que haja upload de arquivo
    return this.http.post<Divida>(this.apiUrl, divida, { headers: this.getAuthHeaders() });
  }

  /**
   * Atualiza uma dívida existente.
   * @param id ID da dívida a ser atualizada.
   * @param divida Os dados atualizados da dívida.
   * @returns Um Observable com a dívida atualizada.
   */
  updateDivida(id: number, divida: Divida): Observable<Divida> {
    // Para atualizar, o backend espera um objeto JSON
    return this.http.patch<Divida>(`${this.apiUrl}/${id}`, divida, { headers: this.getAuthHeaders() });
  }

  /**
   * Exclui uma dívida.
   * @param id ID da dívida a ser excluída.
   * @returns Um Observable vazio.
   */
  deleteDivida(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
