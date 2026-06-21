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
import { DatePickerModule } from 'primeng/datepicker';
import { AtivoService, Ativo } from '../../services/ativo.service'; // Atualizado para AtivoService
import { LayoutService } from '../../layout/service/layout.service';
import { CarteiraService, Carteira } from '../../services/carteira.service';
import { Subscription, finalize } from 'rxjs';

@Component({
  selector: 'app-minha-carteira',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, ChartModule, FormsModule, DialogModule, InputNumberModule, InputTextModule, ToastModule, SelectModule, DatePickerModule],
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
  composicaoBackend: any[] = [];
  dataProjecao: any;
  optionsProjecao: any;
  mostrarModal: boolean = false; // Controla se o modal aparece ou não
  carregando: boolean = false; // Controla o estado de loading do botão
  buscandoAtivo: boolean = false; // Controla o spinner de busca da Brapi
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
            this.carregarDadosCarteira(this.carteiraId);
          }
        });
      },
      error: (err) => console.error('Erro ao buscar carteiras', err)
    });
  }

  carregarDadosCarteira(id: string) {
    this.carteiraService.getDetalhes(id).subscribe({
        next: (dadosCarteira) => {
            console.log('Carteira completa recebida do BFF:', dadosCarteira);

            const payload = dadosCarteira?.wallet ?? dadosCarteira?.carteira ?? dadosCarteira?.result?.wallet ?? dadosCarteira;
            this.ativos = payload?.assets || dadosCarteira?.assets || payload?.itens || [];
            this.composicaoBackend = payload?.composicaoPorSetor || dadosCarteira?.composicaoPorSetor || [];
            
            // Atualiza a carteira selecionada para termos as métricas no HTML
            this.carteiraSelecionada = {
                ...payload,
                nome: payload?.name || payload?.nome || ''
            };

            this.initGraficos();
        },
        error: (err) => console.error('Erro na requisição da carteira:', err)
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

  abrirModalAporte(ativo: Ativo) {
      this.novoAtivo = {
          ticker: ativo.ticker,
          nome: ativo.nome,
          precoAtual: ativo.precoAtual,
          precoMedio: ativo.precoAtual || 0
      };
      this.mostrarModal = true;
  }

  buscarDetalhesAtivo() {
    if (!this.novoAtivo.ticker) return;
    
    // Força o Ticker a ficar maiúsculo e corta espaços em branco acidentais
    this.novoAtivo.ticker = this.novoAtivo.ticker.toUpperCase().trim();
    this.buscandoAtivo = true;
    this.ativoService.buscarCotacaoBrapi(this.novoAtivo.ticker).subscribe({
        next: (response) => {
            if (response.results && response.results.length > 0) {
                const acao = response.results[0];
                this.novoAtivo.nome = acao.shortName || acao.longName;
                this.novoAtivo.precoAtual = acao.regularMarketPrice;
                // Sugere o preço atual do mercado como o preço que o usuário pagou
                if (!this.novoAtivo.precoMedio || this.novoAtivo.precoMedio === 0) {
                    this.novoAtivo.precoMedio = acao.regularMarketPrice; 
                }
                this.messageService.add({ severity: 'info', summary: 'Ativo Encontrado', detail: this.novoAtivo.nome });
            }
            this.buscandoAtivo = false;
        },
        error: (err) => {
            console.error('Erro Brapi:', err);
            this.buscandoAtivo = false;
            this.messageService.add({ severity: 'error', summary: 'Não encontrado', detail: 'Verifique o Ticker digitado.' });
        }
    });
  }

  salvarAtivo() {
      this.carregando = true;
      
      const payload = { ...this.novoAtivo };
      if (payload.dataCompra instanceof Date) {
          payload.dataCompra = payload.dataCompra.toISOString().split('T')[0];
      }

      // Agora passamos o ID da carteira atual para o serviço com o payload corrigido
      this.ativoService.adicionarAtivo(this.carteiraId, payload)
        .pipe(finalize(() => this.carregando = false)) // Garante que o loading para no final
        .subscribe({
          next: (ativoAdicionado) => {
            // Recarrega todos os dados da carteira do back-end para recalcular as rentabilidades com proventos de tudo de uma vez
            this.carregarDadosCarteira(this.carteiraId);
            
            // Fecha o modal
            this.mostrarModal = false;
            
            // Exibe mensagem de sucesso
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Ativo adicionado à carteira!' });
          },
          error: (err) => {
            // Exibe mensagem de erro
            console.error('Erro ao salvar ativo:', err);
            const msgErro = err.error?.error || 'Não foi possível salvar o ativo. Tente novamente.';
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: msgErro });
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
    if (this.composicaoBackend && this.composicaoBackend.length > 0) {
        // Usa os dados perfeitamente calculados pelo Back-end!
        this.dataPizza = {
            labels: this.composicaoBackend.map((s: any) => `${s.setor} (${s.percentual}%)`),
            datasets: [{
                data: this.composicaoBackend.map((s: any) => s.valorTotal),
                backgroundColor: backgroundColors,
                hoverBackgroundColor: hoverBackgroundColors
            }]
        };
    } else {
        // Fallback local caso o back-end não mande a composição
        const setorMap = new Map<string, number>();
        this.ativos.forEach(ativo => {
            const total = ativo.precoAtual * ativo.quantidade;
            const atual = setorMap.get(ativo.setor || 'Outros') || 0;
            setorMap.set(ativo.setor || 'Outros', atual + total);
        });
        this.dataPizza = {
            labels: Array.from(setorMap.keys()),
            datasets: [{
                data: Array.from(setorMap.values()),
                backgroundColor: backgroundColors,
                hoverBackgroundColor: hoverBackgroundColors
            }]
        };
    }

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
    return ativo.rentabilidadeValor ?? 0;
  }

  excluirAtivo(ativo: Ativo) {
    if (confirm(`Tem certeza que deseja remover ${ativo.ticker} da sua carteira?`)) {
      this.ativoService.removerAtivo(this.carteiraId, ativo.ticker).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Ativo removido da carteira!' });
          // Busca a carteira atualizada do Back-end
          this.carregarDadosCarteira(this.carteiraId);
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