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

  getAnalytics(objetivoMensal?: number, walletId?: string): Observable<any> {
    let url = `${this.apiUrl}/analytics`;
    const params = [];
    if (objetivoMensal) params.push(`objetivoMensal=${objetivoMensal}`);
    if (walletId) params.push(`walletId=${walletId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<any>(url);
  }

  atualizarMetaMensal(objetivoMensal: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/goal`, { objetivoMensal });
  }

  adicionarCarteira(carteira: { nome: string; descricao?: string }): Observable<Carteira> {
    return this.http.post<Carteira>(`${this.apiUrl}/wallets`, carteira);
  }

  atualizarCarteira(id: string, carteira: { nome: string; descricao?: string }): Observable<Carteira> {
    return this.http.put<Carteira>(`${this.apiUrl}/wallets/${id}`, carteira);
  }

  excluirCarteira(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/wallets/${id}`);
  }
}