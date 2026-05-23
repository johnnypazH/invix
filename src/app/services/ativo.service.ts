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
}

@Injectable({
  providedIn: 'root'
})
export class AtivoService {
  // Apontando direto para o backend (igual fizemos no CarteiraService)
  private baseUrl = 'http://localhost:3333/api';

  constructor(private http: HttpClient) { }

  // Busca os ativos de uma carteira específica
  getAtivos(carteiraId: string): Observable<Ativo[]> {
    // O backend agora responde em /wallets/:id e retorna o objeto inteiro da carteira
    // O operador 'map' pega apenas a parte dos 'assets' para a tabela exibir
    return this.http.get<any>(`${this.baseUrl}/wallets/${carteiraId}`).pipe(
      map(carteira => {
        console.log('Resposta bruta do backend (carteira completa):', carteira);
        return carteira.assets || [];
      })
    );
  }

  // Adiciona um ativo a uma carteira específica
  adicionarAtivo(carteiraId: string, ativo: Partial<Ativo>): Observable<Ativo> {
    // O backend novo usa a rota /wallets/:id/assets e devolve { message, asset, assets }
    return this.http.post<any>(`${this.baseUrl}/wallets/${carteiraId}/assets`, ativo).pipe(
      map(res => res.asset || ativo)
    );
  }

  // Remove um ativo de uma carteira específica
  removerAtivo(carteiraId: string, ticker: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/wallets/${carteiraId}/assets/${ticker}`);
  }

  // Busca cotações reais na API pública da Brapi
  buscarCotacaoBrapi(tickers: string): Observable<any> {
    // Requisição pública sem token por questões de segurança.
    // O ideal futuramente é o Angular chamar o seu próprio Back-end (BFF) e o Back-end chamar a Brapi com o Token seguro.
    return this.http.get<any>(`https://brapi.dev/api/quote/${tickers}`);
  }
}