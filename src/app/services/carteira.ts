import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// Definindo a "cara" do nosso dado
export interface Ativo {
  id: number;
  ticker: string;
  nome: string;
  setor: string;
  quantidade: number;
  precoMedio: number;
  precoAtual: number;
  dividendYield: number; // Porcentagem anual
}

@Injectable({
  providedIn: 'root'
})
export class CarteiraService {

  constructor() { }

  // Simula uma chamada HTTP que retorna dados fictícios
  getCarteira(): Observable<Ativo[]> {
    const dadosFicticios: Ativo[] = [
      {
        id: 1,
        ticker: 'PETR4',
        nome: 'Petrobras PN',
        setor: 'Petróleo',
        quantidade: 100,
        precoMedio: 32.50,
        precoAtual: 36.80,
        dividendYield: 18.5
      },
      {
        id: 2,
        ticker: 'VALE3',
        nome: 'Vale S.A.',
        setor: 'Mineração',
        quantidade: 50,
        precoMedio: 68.00,
        precoAtual: 62.10,
        dividendYield: 6.2
      },
      {
        id: 3,
        ticker: 'BBAS3',
        nome: 'Banco do Brasil',
        setor: 'Bancário',
        quantidade: 200,
        precoMedio: 45.10,
        precoAtual: 58.90,
        dividendYield: 9.8
      },
      {
        id: 4,
        ticker: 'MXRF11',
        nome: 'Maxi Renda FII',
        setor: 'Fundo Imobiliário',
        quantidade: 500,
        precoMedio: 10.10,
        precoAtual: 10.35,
        dividendYield: 12.1
      }
    ];

    // 'of' transforma o array em um Observable (igual o HTTP faria)
    return of(dadosFicticios);
  }
}