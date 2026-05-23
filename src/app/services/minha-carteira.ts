import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { AtivoService, Ativo } from '../../services/ativo.service'; // Atualizado para AtivoService
import { LayoutService } from '../../layout/service/layout.service';
import { CarteiraService, Carteira } from '../../services/carteira.service';
import { Subscription, finalize } from 'rxjs';

@Component({
  selector: 'app-minha-carteira',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, ChartModule, FormsModule, DialogModule, InputNumberModule, InputTextModule, ToastModule, SelectModule],
  templateUrl: './minha-carteira.html',
  styleUrl: './minha-carteira.scss'
})
export class MinhaCarteira implements OnInit, OnDestroy {

  minhasCarteiras: Carteira[] = [];
  carteiraSelecionada: Carteira | null = null;
  ativos: Ativo[] = [];
  
  // Variáveis dos Gráficos
  dataPizza: any;
  optionsPizza: any;
  dataProjecao: any;
  optionsProjecao: any;
  mostrarModal: boolean = false; // Controla se o modal aparece ou não
  carregando: boolean = false; // Controla o estado de loading do botão
  private carteiraId!: string; // Armazena o ID da carteira atual
  private subscription!: Subscription;
  carteiraIdSelecionada: boolean = true; // Flag para saber se exibimos os gráficos ou o aviso
  
  // O formulário agora só precisa dos dados que o usuário insere
  novoAtivo: Partial<Ativo> = {};

  constructor(
    private ativoService: AtivoService, // Serviço de ativos
    private layoutService: LayoutService,
    private messageService: MessageService,
    private route: ActivatedRoute, // Para ler o ID da URL
    private router: Router, // Para redirecionar
    private carteiraService: CarteiraService // Para buscar a primeira carteira
  ) {}

  ngOnInit() {
    // Primeiro, busca as carteiras para preencher o Dropdown no topo da página
    this.carteiraService.getDashboard().subscribe({
      next: (dados) => {
        this.minhasCarteiras = dados.carteiras || [];

        // Depois, fica "escutando" as mudanças no parâmetro 'id' da rota
        this.subscription = this.route.params.subscribe(params => {
          if (!params['id']) {
            this.carteiraIdSelecionada = false;
            if (this.minhasCarteiras.length > 0) {
              this.router.navigate(['/carteira', this.minhasCarteiras[0].id]);
            }
          } else {
            this.carteiraIdSelecionada = true;
            this.carteiraId = params['id'];
            
            // Mantém o Dropdown sincronizado com a rota atual
            this.carteiraSelecionada = this.minhasCarteiras.find((c) => c.id === this.carteiraId) || null;
            
            this.ativos = [];
            this.ativoService.getAtivos(this.carteiraId).subscribe({
              next: (dadosAtivos) => {
                  console.log('Ativos extraídos e enviados para a tabela:', dadosAtivos);
                  this.ativos = dadosAtivos;
                  this.initGraficos();
              },
              error: (err) => console.error('Erro na requisição da carteira:', err)
            });
          }
        });
      },
      error: (err) => console.error('Erro ao buscar carteiras', err)
    });
  }

  // Disparado quando o usuário escolhe outra carteira no Dropdown
  onCarteiraChange() {
    if (this.carteiraSelecionada && this.carteiraSelecionada.id) {
      // Redireciona a tela, e o subscribe acima cuidará de atualizar os dados automaticamente
      this.router.navigate(['/carteira', this.carteiraSelecionada.id]);
    }
  }

  abrirModal() {
      // Limpa o formulário antes de abrir
      this.novoAtivo = {};
      this.mostrarModal = true;
  }

  salvarAtivo() {
      this.carregando = true;
      // Agora passamos o ID da carteira atual para o serviço
      this.ativoService.adicionarAtivo(this.carteiraId, this.novoAtivo)
        .pipe(finalize(() => this.carregando = false)) // Garante que o loading para no final
        .subscribe({
          next: (ativoAdicionado) => {
            // Adiciona o ativo retornado pela API (já completo) na lista local
            this.ativos = [...this.ativos, ativoAdicionado];
            
            // Atualiza os gráficos
            this.initGraficos();
            
            // Fecha o modal
            this.mostrarModal = false;

            // Exibe mensagem de sucesso
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Ativo adicionado à carteira!' });
          },
          error: (err) => {
            // Exibe mensagem de erro
            console.error('Erro ao salvar ativo:', err);
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar o ativo. Tente novamente.' });
          }
        });
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

  excluirAtivo(ativo: Ativo) {
    if (confirm(`Tem certeza que deseja remover ${ativo.ticker} da sua carteira?`)) {
      this.ativoService.removerAtivo(this.carteiraId, ativo.ticker).subscribe({
        next: () => {
          // Remove o ativo da lista localmente
          this.ativos = this.ativos.filter(a => a.ticker !== ativo.ticker);
          // Recalcula os gráficos com a nova lista
          this.initGraficos();
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Ativo removido da carteira!' });
        },
        error: (err) => {
          console.error('Erro ao remover ativo:', err);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível remover o ativo.' });
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}