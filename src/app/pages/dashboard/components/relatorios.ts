import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { LayoutService } from '../../../layout/service/layout.service';
import { CarteiraService, Carteira } from '../../../services/carteira.service';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    selector: 'app-relatorios',
    standalone: true,
    imports: [CommonModule, ChartModule, ProgressBarModule, FormsModule, SelectModule, InputNumberModule],
    templateUrl: './relatorios.html',
    styleUrl: './relatorios.scss'
})
export class Relatorios implements OnInit {
    
    analyticsData: any = null;
    carregando: boolean = true;
    objetivoMensal: number = 0;

    carteiras: Carteira[] = [];
    carteiraSelecionada: Carteira | null = null;

    dataSetores: any;
    optionsSetores: any;

    dataHistorico: any;
    optionsHistorico: any;

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
                this.carteiras = dados.carteiras || [];
            },
            error: (err) => console.error('Erro ao carregar carteiras', err)
        });
    }

    carregarDados() {
        this.carregando = true;
        const walletId = this.carteiraSelecionada?.id;
        this.carteiraService.getAnalytics(undefined, walletId).subscribe({
            next: (data) => {
                this.analyticsData = data;
                if (data.metas?.independenciaFinanceira?.objetivoMensal) {
                    this.objetivoMensal = data.metas.independenciaFinanceira.objetivoMensal;
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
        this.carteiraService.atualizarMetaMensal(this.objetivoMensal).subscribe({
            next: () => {
                this.carregarDados();
            },
            error: (err) => {
                console.error('Erro ao salvar meta', err);
                this.carregando = false;
            }
        });
    }

    initCharts() {
        if (!this.analyticsData) return;

        const isDark = this.layoutService.isDarkTheme();
        const textColor = isDark ? '#e0e0e0' : '#4b5563';
        const gridColor = isDark ? '#424242' : '#e5e7eb';
        const bgColors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
        const hoverBgColors = ['#2563EB', '#059669', '#D97706', '#DB2777', '#7C3AED'];

        this.dataSetores = {
            labels: this.analyticsData.distribuicaoPorSetor.map((s: any) => s.setor),
            datasets: [{
                data: this.analyticsData.distribuicaoPorSetor.map((s: any) => s.valorTotal),
                backgroundColor: bgColors,
                hoverBackgroundColor: hoverBgColors
            }]
        };
        this.optionsSetores = { plugins: { legend: { labels: { color: textColor, usePointStyle: true } } } };

        this.dataHistorico = {
            labels: this.analyticsData.historicoDividendosMes.map((h: any) => h.mes),
            datasets: [{
                label: 'Dividendos Recebidos (R$)',
                data: this.analyticsData.historicoDividendosMes.map((h: any) => h.valor),
                backgroundColor: '#10B981',
                borderRadius: 4
            }]
        };
        this.optionsHistorico = { plugins: { legend: { labels: { color: textColor } } }, scales: { x: { ticks: { color: textColor }, grid: { display: false } }, y: { ticks: { color: textColor }, grid: { color: gridColor } } } };
    }
}