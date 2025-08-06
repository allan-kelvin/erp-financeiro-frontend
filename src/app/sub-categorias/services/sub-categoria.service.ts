import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { SubCategoria } from "../models/sub-categoria.model";

@Injectable({
  providedIn: 'root'
})
export class SubCategoriaService {
  private apiUrl = `${environment.apiUrl}/sub-categoria`; // Verifique se a porta e o host estão corretos

  constructor(private http: HttpClient) { }

  getSubCategoria(): Observable<SubCategoria[]> {
    return this.http.get<SubCategoria[]>(this.apiUrl);
  }

  getSubCategoriaById(id: number): Observable<SubCategoria> {
    return this.http.get<SubCategoria>(`${this.apiUrl}/${id}`);
  }

  createSubCategoria(subCategoria: Partial<SubCategoria>): Observable<SubCategoria> {
    return this.http.post<SubCategoria>(this.apiUrl, subCategoria);
  }

  updateSubCategoria(id: number, subCategoria: Partial<SubCategoria>): Observable<SubCategoria> {
    return this.http.patch<SubCategoria>(`${this.apiUrl}/${id}`, subCategoria);
  }

  deleteSubCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
