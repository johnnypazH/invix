import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { LayoutService } from '../../../layout/service/layout.service';
import { CarteiraService, Carteira } from '../../../services/carteira.service';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';

export interface AnalyticsData {
    metas: {
        independenciaFinanceira: {
            metaMensal: number;
            progressoAtual: number;
            percentualConcluido: number;
        }
    };
    distribuicaoPorSetor: Array<{ setor: string; valorTotal: number }>;
    historicoDividendosMes: Array<{ mes: string; valor: number }>;
    dividendosDetalhados?: Array<{
        ticker: string;
        nome: string;
        valorUnitario: number;
        tipo: string;
        dataCom: string;
        dataPagamento: string;
        quantidade: number;
        totalRecebido: number;
    }>;
    ativos?: Array<{
        ticker: string;
        nome: string;
        setor: string;
        quantidade: number;
        precoMedio: number;
        custoTotal: number;
    }>;
    maioresPagadores?: Array<{
        ticker: string;
        total: number;
    }>;
}

@Component({
    selector: 'app-relatorios',
    standalone: true,
    imports: [CommonModule, ChartModule, ProgressBarModule, FormsModule, SelectModule, InputNumberModule, TableModule],
    templateUrl: './relatorios.html',
    styleUrl: './relatorios.scss'
})
export class Relatorios implements OnInit {
    
    analyticsData: AnalyticsData | null = null;
    carregando: boolean = true;
    objetivoMensal: number = 0;

    carteiras: Carteira[] = [];
    carteiraSelecionada: Carteira | null = null;

    dataSetores: any;
    optionsSetores: any;

    dataHistorico: any;
    optionsHistorico: any;

    dataMaioresPagadores: any;
    optionsMaioresPagadores: any;

    constructor(
        private layoutService: LayoutService,
        private carteiraService: CarteiraService
    ) {}

    ngOnInit() {
        this.carregarCarteiras();
        this.carregarDados();
    }

    carregarCarteiras() {
        this.carteiraService.getDashboard().subscribe({
            next: (dados) => {
                const list = Array.isArray(dados?.carteiras) ? dados.carteiras : [];
                this.carteiras = [
                    { id: '', nome: 'Todas as Carteiras' },
                    ...list
                ];
                // Define "Todas as Carteiras" como a selecionada por padrão
                this.carteiraSelecionada = this.carteiras[0];
            },
            error: (err) => console.error('Erro ao carregar carteiras', err)
        });
    }

    carregarDados() {
        this.carregando = true;
        const walletId = this.carteiraSelecionada?.id;
        this.carteiraService.getAnalytics(undefined, walletId).subscribe({
            next: (data) => {
                const analytics = data || {};
                
                // Mapeia caso venha direto do nó 'metas' ou construa a partir do nó 'analytics'
                const metas = analytics.metas || {
                    independenciaFinanceira: {
                        metaMensal: analytics.analytics?.metaMensal || analytics.metaMensal || 0,
                        progressoAtual: analytics.analytics?.progressoAtual || analytics.progressoAtual || 0,
                        percentualConcluido: analytics.analytics?.percentualConcluido || analytics.percentualConcluido || 0
                    }
                };

                const distribuicaoPorSetor = analytics.distribuicaoPorSetor || analytics.analytics?.distribuicaoPorSetor || [];
                const historicoDividendosMes = analytics.historicoDividendosMes || analytics.analytics?.historicoDividendosMes || [];
                const dividendosDetalhados = analytics.dividendosDetalhados || [];
                const ativos = analytics.ativos || [];
                const maioresPagadores = analytics.maioresPagadores || [];

                this.analyticsData = {
                    metas,
                    distribuicaoPorSetor,
                    historicoDividendosMes,
                    dividendosDetalhados,
                    ativos,
                    maioresPagadores
                };

                if (this.analyticsData.metas.independenciaFinanceira.metaMensal != null) {
                    this.objetivoMensal = this.analyticsData.metas.independenciaFinanceira.metaMensal;
                }

                this.initCharts();
                this.carregando = false;
            },
            error: (err) => {
                console.error('Erro ao carregar relatórios', err);
                this.carregando = false;
            }
        });
    }

    salvarMetaEAtualizar() {
        if (!this.objetivoMensal || this.objetivoMensal <= 0) return;
        
        this.carregando = true;

        if (this.carteiraSelecionada && this.carteiraSelecionada.id) {
            // Se houver uma carteira selecionada, atualiza a meta daquela carteira específica
            this.carteiraService.atualizarCarteira(this.carteiraSelecionada.id, {
                nome: this.carteiraSelecionada.nome,
                descricao: this.carteiraSelecionada.descricao,
                metaMensal: this.objetivoMensal
            }).subscribe({
                next: (carteiraAtualizada) => {
                    // Atualiza a lista local de carteiras para refletir o novo valor
                    const idx = this.carteiras.findIndex(c => c.id === carteiraAtualizada.id);
                    if (idx !== -1) {
                        this.carteiras[idx] = carteiraAtualizada;
                    }
                    this.carteiraSelecionada = carteiraAtualizada;
                    this.carregarDados();
                },
                error: (err) => {
                    console.error('Erro ao salvar meta da carteira', err);
                    this.carregando = false;
                }
            });
        } else {
            // Caso contrário, atualiza a meta global de independência financeira
            this.carteiraService.atualizarMetaMensal(this.objetivoMensal).subscribe({
                next: () => {
                    this.carregarDados();
                },
                error: (err) => {
                    console.error('Erro ao salvar meta global', err);
                    this.carregando = false;
                }
            });
        }
    }
    formatarMes(mesStr: string | undefined): string {
        if (!mesStr || mesStr.length < 7) return '-';
        const parts = mesStr.split('-');
        if (parts.length < 2) return mesStr;
        const ano = parts[0];
        const mes = parts[1];
        const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const mesIndex = parseInt(mes, 10) - 1;
        if (mesIndex >= 0 && mesIndex < 12) {
            return `${mesesNomes[mesIndex]}/${ano.substring(2)}`;
        }
        return mesStr;
    }

    initCharts() {
        if (!this.analyticsData) return;

        const isDark = this.layoutService.isDarkTheme();
        const textColor = isDark ? '#e0e0e0' : '#4b5563';
        const gridColor = isDark ? '#424242' : '#e5e7eb';
        const bgColors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
        const hoverBgColors = ['#2563EB', '#059669', '#D97706', '#DB2777', '#7C3AED'];

        const setores = Array.isArray(this.analyticsData.distribuicaoPorSetor)
            ? this.analyticsData.distribuicaoPorSetor
            : [];
        const historico = Array.isArray(this.analyticsData.historicoDividendosMes)
            ? this.analyticsData.historicoDividendosMes
            : [];

        this.dataSetores = {
            labels: setores.map((s) => s?.setor ?? 'Sem setor'),
            datasets: [{
                data: setores.map((s) => Number(s?.valorTotal) || 0),
                backgroundColor: bgColors,
                hoverBackgroundColor: hoverBgColors
            }]
        };
        this.optionsSetores = { plugins: { legend: { labels: { color: textColor, usePointStyle: true } } } };

        this.dataHistorico = {
            labels: historico.map((h) => this.formatarMes(h?.mes)),
            datasets: [{
                label: 'Dividendos Recebidos (R$)',
                data: historico.map((h) => Number(h?.valor) || 0),
                backgroundColor: '#10B981',
                borderRadius: 4
            }]
        };
        this.optionsHistorico = { plugins: { legend: { labels: { color: textColor } } }, scales: { x: { ticks: { color: textColor }, grid: { display: false } }, y: { ticks: { color: textColor }, grid: { color: gridColor } } } };

        const pagadores = Array.isArray(this.analyticsData.maioresPagadores)
            ? this.analyticsData.maioresPagadores
            : [];

        this.dataMaioresPagadores = {
            labels: pagadores.map((p) => p.ticker),
            datasets: [{
                label: 'Dividendos Totais Recebidos (R$)',
                data: pagadores.map((p) => p.total),
                backgroundColor: '#3B82F6',
                borderRadius: 4
            }]
        };

        this.optionsMaioresPagadores = {
            indexAxis: 'y',
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                y: {
                    ticks: { color: textColor },
                    grid: { display: false }
                }
            }
        };
    }
}