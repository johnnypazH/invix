import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Carteira {
  id?: string;
  nome: string;
  descricao?: string;
  metaMensal?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarteiraService {
  private apiUrl = 'http://localhost:3333/api';

  constructor(private http: HttpClient) {}

  private unwrap<T>(response: any): T {
    let current = response;
    let depth = 0;

    while (current && typeof current === 'object' && 'data' in current && depth < 5) {
      current = current.data;
      depth++;
    }

    return current ?? response;
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`).pipe(
      map((response) => this.unwrap(response))
    );
  }

  getDetalhes(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/wallets/${id}`).pipe(
      map((response: any) => {
        const payload: any = this.unwrap(response);
        const wallet: any = payload?.wallet ?? payload?.carteira ?? payload?.result?.wallet ?? payload;

        return {
          ...wallet,
          assets: wallet?.assets ?? payload?.assets ?? wallet?.itens ?? [],
          composicaoPorSetor: wallet?.composicaoPorSetor ?? payload?.composicaoPorSetor ?? []
        };
      })
    );
  }

  getAnalytics(objetivoMensal?: number, walletId?: string): Observable<any> {
    let url = `${this.apiUrl}/analytics`;
    const params = [];
    if (objetivoMensal) params.push(`objetivoMensal=${objetivoMensal}`);
    if (walletId) params.push(`walletId=${walletId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<any>(url).pipe(
      map((response) => this.unwrap(response))
    );
  }

  atualizarMetaMensal(objetivoMensal: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/goal`, { objetivoMensal }).pipe(
      map((response) => this.unwrap(response))
    );
  }

  adicionarCarteira(carteira: { nome: string; descricao?: string; metaMensal?: number }): Observable<Carteira> {
    return this.http.post<any>(`${this.apiUrl}/wallets`, carteira).pipe(
      map((response) => this.unwrap<Carteira>(response))
    );
  }

  atualizarCarteira(id: string, carteira: { nome: string; descricao?: string; metaMensal?: number }): Observable<Carteira> {
    return this.http.put<any>(`${this.apiUrl}/wallets/${id}`, carteira).pipe(
      map((response) => this.unwrap<Carteira>(response))
    );
  }

  excluirCarteira(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/wallets/${id}`).pipe(
      map((response) => this.unwrap(response))
    );
  }
}