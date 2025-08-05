import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IBanco } from '../interface/IBanco.interface';

type CreatePayload = {
  nome: string;
  tipo_conta: string;
  status?: string;
  ativo?: boolean;
  imagem?: File | null;
};

@Injectable({
  providedIn: 'root'
})
export class BancoService {

  private baseUrl = `${environment.apiUrl}/banco`;

  constructor(private http: HttpClient) { }

  list(): Observable<IBanco[]> {
    return this.http.get<IBanco[]>(this.baseUrl);
  }

  getById(id: number): Observable<IBanco> {
    return this.http.get<IBanco>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreatePayload): Observable<IBanco> {
    const form = new FormData();
    form.append('nome', payload.nome);
    form.append('tipo_conta', payload.tipo_conta);

    let statusValue = 'Ativo'; // default
    if (payload.status !== undefined && payload.status !== null) {
      statusValue = String(payload.status);
    } else if (payload.ativo !== undefined && payload.ativo !== null) {
      statusValue = payload.ativo ? 'Ativo' : 'Inativo';
    }
    form.append('status', statusValue);

    if (payload.imagem) {
      form.append('imagem_banco', payload.imagem, payload.imagem.name);
    }

    return this.http.post<IBanco>(this.baseUrl, form);
  }


  update(id: number, payload: CreatePayload): Observable<IBanco> {
    const form = new FormData();
    if (payload.nome !== undefined) form.append('nome', payload.nome);
    if (payload.tipo_conta !== undefined) form.append('tipo_conta', payload.tipo_conta);

    if (payload.status !== undefined) {
      form.append('status', payload.status);
    } else if (payload.ativo !== undefined) {
      form.append('status', payload.ativo ? 'Ativo' : 'Inativo');
    }

    if (payload.imagem) form.append('imagem_banco', payload.imagem, payload.imagem.name);

    return this.http.patch<IBanco>(`${this.baseUrl}/${id}`, form);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}



