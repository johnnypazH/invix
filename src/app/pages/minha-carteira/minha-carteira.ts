import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog'; // <--- O Modal
import { InputTextModule } from 'primeng/inputtext'; // <--- Campo de Texto
import { InputNumberModule } from 'primeng/inputnumber'; // <--- Campo de Números
import { CarteiraService, Ativo } from '../../services/carteira';
import { LayoutService } from '../../layout/service/layout.service'; // Importar o LayoutService

@Component({
  selector: 'app-minha-carteira',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ChartModule,FormsModule,DialogModule,InputNumberModule,InputTextModule],
  templateUrl: './minha-carteira.html',
  styleUrl: './minha-carteira.scss'
})
export class MinhaCarteira implements OnInit {

  ativos: Ativo[] = [];
  
  // Variáveis dos Gráficos
  dataPizza: any;
  optionsPizza: any;
  dataProjecao: any;
  optionsProjecao: any;
  mostrarModal: boolean = false; // Controla se o modal aparece ou não
  
  
  novoAtivo: Ativo = {
      id: 0,
      ticker: '',
      nome: '', // No futuro, isso virá da sua lógica de Banco/API
      setor: 'Outros', // Default
      quantidade: 0,
      precoMedio: 0,
      precoAtual: 0, // Vamos simular que o preço atual é igual ao pago por enquanto
      dividendYield: 0
  };

  constructor(private carteiraService: CarteiraService, private layoutService: LayoutService) {} // Injetar LayoutService

  ngOnInit() {
    this.carteiraService.getCarteira().subscribe(dados => {
      this.ativos = dados;
      this.initGraficos();
    });
  }
  abrirModal() {
      // Limpa o formulário antes de abrir
      this.novoAtivo = {
          id: 0, ticker: '', nome: '', setor: 'A definir', 
          quantidade: 0, precoMedio: 0, precoAtual: 0, dividendYield: 0
      };
      this.mostrarModal = true;
  }

  salvarAtivo() {
      // 1. Simulação da Lógica de Negócio (API vs Banco)
      // Aqui você futuramente vai chamar seu Back-end.
      // Por enquanto, vamos "fingir" que o sistema completou os dados:
      
      this.novoAtivo.nome = `Ação ${this.novoAtivo.ticker.toUpperCase()}`; // Simula busca de nome
      this.novoAtivo.precoAtual = this.novoAtivo.precoMedio; // Simula preço atual
      
      // 2. Adiciona na lista local (o Angular atualiza a tabela sozinho!)
      // Usamos o spread operator [...] para forçar o Angular a detectar mudança
      this.ativos = [...this.ativos, { ...this.novoAtivo, ticker: this.novoAtivo.ticker.toUpperCase() }];
      
      // 3. Atualiza os gráficos para incluir o novo valor
      this.initGraficos();
      
      // 4. Fecha o modal
      this.mostrarModal = false;
  }

  initGraficos() {
    // Cores fixas para garantir que apareça colorido
    // Definir cores dinamicamente com base no tema
    const isDark = this.layoutService.isDarkTheme();
    const corTexto = isDark ? '#e0e0e0' : '#4b5563'; // Cinza claro para tema escuro, cinza escuro para tema claro
    const corGrid = isDark ? '#424242' : '#e5e7eb';  // Cinza escuro para tema escuro, cinza claro para tema claro

    // Cores para os segmentos da pizza (podem ser ajustadas para melhor contraste no tema escuro se necessário)
    const backgroundColors = ['#3B82F6', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6']; // Azul, Laranja, Verde, Rosa, Roxo
    const hoverBackgroundColors = ['#2563EB', '#D97706', '#059669', '#DB2777', '#7C3AED']; // Versões mais escuras

    // --- 1. Gráfico de Pizza ---
    const setorMap = new Map<string, number>();
    this.ativos.forEach(ativo => {
        const total = ativo.precoAtual * ativo.quantidade;
        const atual = setorMap.get(ativo.setor) || 0;
        setorMap.set(ativo.setor, atual + total);
    });

    this.dataPizza = {
        labels: Array.from(setorMap.keys()),
        datasets: [
            {
                data: Array.from(setorMap.values()),
                backgroundColor: backgroundColors,
                hoverBackgroundColor: hoverBackgroundColors
            }
        ]
    };

    this.optionsPizza = {
        plugins: {
            legend: {
                labels: { usePointStyle: true, color: corTexto }
            }
        }
    };

    // --- 2. Projeção ---
    const valorTotalAtual = this.ativos.reduce((acc, at) => acc + (at.precoAtual * at.quantidade), 0);
    const dyMedioPonderado = 0.10; 
    
    let anos = ['Hoje', 'Ano 1', 'Ano 2', 'Ano 3', 'Ano 4', 'Ano 5'];
    let valoresFuturos = [valorTotalAtual];
    let valorAcumulado = valorTotalAtual;
    
    for (let i = 1; i <= 5; i++) {
        valorAcumulado = valorAcumulado * (1 + dyMedioPonderado);
        valoresFuturos.push(valorAcumulado);
    }

    this.dataProjecao = {
        labels: anos,
        datasets: [
            {
                label: 'Patrimônio Projetado',
                data: valoresFuturos,
                fill: true,
                borderColor: '#3B82F6',
                tension: 0.4,
                backgroundColor: 'rgba(59, 130, 246, 0.2)'
            }
        ]
    };

    this.optionsProjecao = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: { legend: { labels: { color: corTexto } } },
        scales: {
            x: { ticks: { color: corTexto }, grid: { color: corGrid } },
            y: { ticks: { color: corTexto, callback: (value:any) => 'R$ ' + value }, grid: { color: corGrid } }
        }
    };
  }

  // --- AQUI ESTAVA FALTANDO A FUNÇÃO MÁGICA ---
  // O HTML precisa dessa função pública para calcular a cor (verde/vermelho)
  getRentabilidade(ativo: Ativo): number {
    if (!ativo) return 0; // Segurança caso o ativo seja nulo
    return (ativo.precoAtual - ativo.precoMedio) * ativo.quantidade;
  }

}