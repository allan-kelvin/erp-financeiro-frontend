import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../auth/services/auth.service";
import { Cartao } from "../models/cartao.model";

@Injectable({
  providedIn: 'root'
})
export class CartoesService {
  private apiUrl = `${environment.apiUrl}/cartoes`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(contentType?: string): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();

    if (contentType !== undefined) {
      headers = headers.set('Content-Type', contentType);
    }

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Busca todos os cartões do usuário autenticado, com filtros opcionais.
   * @param filters Objeto com os filtros (id, descricao, tipoCartao, bandeira).
   * @returns Um Observable com a lista de cartões.
   */
  getCartoes(filters?: any): Observable<Cartao[]> {
    let params = new HttpParams();
    if (filters) {
      for (const key in filters) {
        if (filters.hasOwnProperty(key) && filters[key]) {
          params = params.append(key, filters[key]);
        }
      }
    }
    return this.http.get<Cartao[]>(this.apiUrl, { headers: this.getAuthHeaders(), params: params });
  }

  /**
   * Busca um cartão específico pelo ID.
   * @param id ID do cartão.
   * @returns Um Observable com o cartão.
   */
  getCartaoById(id: number): Observable<Cartao> {
    return this.http.get<Cartao>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  /**
   * Cria um novo cartão.
   * @param cartao Os dados do cartão a ser criado.
   * @returns Um Observable com o cartão criado.
   */
  createCartao(formData: FormData): Observable<Cartao> {
    // Não defina 'Content-Type' para FormData, o navegador faz isso automaticamente
    return this.http.post<Cartao>(this.apiUrl, formData, { headers: this.getAuthHeaders(undefined) });
  }


  /**
   * Atualiza um cartão existente.
   * @param id ID do cartão a ser atualizado.
   * @param cartao Os dados atualizados do cartão.
   * @returns Um Observable com o cartão atualizado.
   */
  updateCartao(id: number, formData: FormData): Observable<Cartao> {
    return this.http.patch<Cartao>(`${this.apiUrl}/${id}`, formData, { headers: this.getAuthHeaders(undefined) });
  }

  /**
   * Exclui um cartão.
   * @param id ID do cartão a ser excluído.
   * @returns Um Observable vazio.
   */
  deleteCartao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  findAll(): Observable<Cartao[]> {
    return this.http.get<Cartao[]>(this.apiUrl);
  }
}
