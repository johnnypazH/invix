import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Carteira {
  id?: string;
  nome: string;
  descricao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarteiraService {
  private apiUrl = 'http://localhost:3333/api';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  adicionarCarteira(carteira: { nome: string; descricao?: string }): Observable<Carteira> {
    return this.http.post<Carteira>(`${this.apiUrl}/wallets`, carteira);
  }
}