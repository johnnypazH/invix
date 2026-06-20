import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';

// Lembre-se de importar o seu serviço de Dashboard/Carteiras real aqui
// import { DashboardService } from '...';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputNumberModule,
    SelectModule,
    ProgressBarModule,
    ChartModule
  ],
  templateUrl: './relatorios.html',
  styleUrls: ['./relatorios.scss']
})
export class RelatoriosComponent implements OnInit {
  carregando: boolean = true;
  
  // Controles de Filtro e Meta
  objetivoMensal: number = 5000;
  carteiras: any[] = [];
  carteiraSelecionada: any = null;
  
  // Dados mastigados que virão do nosso maravilhoso BFF
  analyticsData: any = null;
  
  // Configurações do PrimeNG Charts (Chart.js)
  dataSetores: any;
  optionsSetores: any;
  dataHistorico: any;
  optionsHistorico: any;

  constructor(/* private dashboardService: DashboardService */) {}

  ngOnInit() {
    this.configurarGraficos();
    this.carregarDados();
  }

  carregarDados() {
    this.carregando = true;
    
    // Aqui faremos a chamada real para o BFF: GET /api/dashboard
    // Simulando a resposta baseada no seu resumo
    setTimeout(() => {
      this.analyticsData = {
        metas: {
          independenciaFinanceira: {
            atualMensal: 1250.50,
            objetivoMensal: this.objetivoMensal,
            percentualConcluido: ((1250.50 / this.objetivoMensal) * 100).toFixed(2)
          }
        }
      };

      // Dados do Gráfico de Setores
      this.dataSetores = {
        labels: ['Bancos', 'Energia', 'Saneamento', 'Tecnologia'],
        datasets: [{
          data: [40, 30, 20, 10],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
          hoverBackgroundColor: ['#2563EB', '#059669', '#D97706', '#7C3AED']
        }]
      };

      // Dados do Gráfico de Histórico de Dividendos
      this.dataHistorico = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Dividendos Recebidos (R$)',
          backgroundColor: '#10B981',
          data: [120, 150, 180, 140, 210, 250]
        }]
      };

      this.carregando = false;
    }, 1500); // delay simulado
  }

  salvarMetaEAtualizar() {
    // Lógica para salvar a nova meta do usuário no backend e re-calcular o progresso
    this.carregarDados();
  }

  configurarGraficos() {
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#495057';
    
    this.optionsSetores = {
      plugins: { legend: { labels: { color: textColor } } }
    };

    this.optionsHistorico = {
      plugins: { legend: { labels: { color: textColor } } }
    };
  }
}