import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

// A interface do Ativo permanece a mesma
export interface Ativo {
  id: number;
  ticker: string;
  nome: string;
  setor: string;
  quantidade: number;
  precoMedio: number;
  precoAtual: number;
  dividendYield: number;
  dataCompra?: string | Date;
  rentabilidade?: number;
  rentabilidadeValor?: number;
  dividendosRecebidos?: number;
  ganhoCapital?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AtivoService {
  // Apontando direto para o backend (igual fizemos no CarteiraService)
  private baseUrl = 'http://localhost:3333/api';

  constructor(private http: HttpClient) { }

  // Busca a lista de todos os ativos disponíveis no banco (Supabase)
  getAtivosDisponiveis(): Observable<Ativo[]> {
    return this.http.get<any>(`${this.baseUrl}/dividends/ativos`).pipe(
      map((response) => {
        const payload = response?.data ?? response;
        return Array.isArray(payload) ? payload : [];
      })
    );
  }

  // Busca os ativos de uma carteira específica
  getAtivos(carteiraId: string): Observable<Ativo[]> {
    return this.http.get<any>(`${this.baseUrl}/wallets/${carteiraId}`).pipe(
      map((response) => {
        const payload = response?.data ?? response;
        console.log('Resposta bruta do backend (carteira completa):', payload);
        return payload?.assets || payload?.wallet?.assets || [];
      })
    );
  }

  // Adiciona um ativo a uma carteira específica
  adicionarAtivo(carteiraId: string, ativo: Partial<Ativo>): Observable<Ativo> {
    return this.http.post<any>(`${this.baseUrl}/wallets/${carteiraId}/assets`, ativo).pipe(
      map((response) => {
        const payload = response?.data ?? response;
        return payload?.asset || payload?.data || ativo;
      })
    );
  }

  // Remove um ativo de uma carteira específica
  removerAtivo(carteiraId: string, ticker: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/wallets/${carteiraId}/assets/${ticker}`).pipe(
      map((response) => response?.data ?? response)
    );
  }

  // Busca cotações reais na API pública da Brapi
  buscarCotacaoBrapi(tickers: string): Observable<any> {
    // Requisição pública sem token por questões de segurança.
    
    // DICA: Crie uma conta gratuita em brapi.dev e cole o seu token aqui dentro das aspas:
    const brapiToken = ''; 
    
    const url = brapiToken ? `https://brapi.dev/api/quote/${tickers}?token=${brapiToken}` : `https://brapi.dev/api/quote/${tickers}`;
    return this.http.get<any>(url);
  }
}