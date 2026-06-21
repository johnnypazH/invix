import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule, DialogModule, ButtonModule],
    host: {
        class: 'block w-full'
    },
    template: `<div class="stats-container">
        <!-- Card 1: Patrimônio Total -->
        <div class="stats-item">
            <div class="card mb-0 h-full">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Patrimônio Total</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ patrimonioTotal | currency:'BRL' }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-wallet text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-muted-color">Valor atual da carteira</span>
            </div>
        </div>

        <!-- Card 2: Ganho Total -->
        <div class="stats-item">
            <div class="card mb-0 h-full">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ganho Total</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl" [class.text-green-500]="ganhoTotal > 0" [class.text-red-500]="ganhoTotal < 0">
                            {{ ganhoTotal | currency:'BRL' }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center rounded-border cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors" style="width: 2.5rem; height: 2.5rem"
                         [ngClass]="{
                            'bg-green-100 dark:bg-green-400/10': ganhoTotal > 0,
                            'bg-red-100 dark:bg-red-400/10': ganhoTotal < 0,
                            'bg-orange-100 dark:bg-orange-400/10': ganhoTotal === 0
                         }"
                         (click)="mostrarDetalhes = true"
                         title="Clique para ver o detalhamento do ganho total">
                        <i class="pi pi-chart-line text-xl!" 
                           [ngClass]="{'text-green-500': ganhoTotal > 0, 'text-red-500': ganhoTotal < 0, 'text-orange-500': ganhoTotal === 0}"></i>
                    </div>
                </div>
                <span class="text-muted-color">Resultado acumulado</span>
            </div>
        </div>

        <!-- Card 3: Total de Ativos -->
        <div class="stats-item">
            <div class="card mb-0 h-full">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total de Ativos</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ totalAtivos }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-list text-cyan-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-muted-color">Ativos diferentes na carteira</span>
            </div>
        </div>

        <!-- Card 4: Dividendos (Simulado) -->
        <div class="stats-item">
            <div class="card mb-0 h-full">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Dividendos (Anual)</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ dividendos | currency:'BRL' }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors" style="width: 2.5rem; height: 2.5rem"
                         (click)="mostrarDetalhesDividendos = true"
                         title="Clique para ver o detalhamento dos proventos">
                        <i class="pi pi-dollar text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-muted-color">Baseado nos últimos 12 meses</span>
            </div>
        </div>
    </div>

    <!-- Pop-up Modal de Detalhamento do Ganho Total -->
    <p-dialog header="Cálculo Detalhado do Ganho Total" [(visible)]="mostrarDetalhes" [modal]="true" [style]="{width: '750px'}" [breakpoints]="{'960px': '90vw'}" [draggable]="false" [resizable]="false">
        <div class="flex flex-col gap-4 py-2">
            <!-- Explicação do Cálculo -->
            <div class="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-surface-900/30">
                <p class="m-0 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    O <strong>Ganho Total</strong> representa o retorno financeiro acumulado de todas as suas carteiras combinadas. Ele é calculado somando o <strong>Patrimônio Atual</strong> dos seus ativos com os <strong>Proventos Recebidos</strong>, subtraindo o valor <strong>Total Investido</strong> (custo médio de aquisição).
                </p>
            </div>

            <!-- Equação Principal -->
            <div class="flex flex-row justify-between items-center text-center bg-gray-50 dark:bg-surface-900/20 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <div class="flex flex-col items-center flex-1">
                    <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Patrimônio</span>
                    <span class="text-lg font-bold text-blue-500 mt-1">{{ patrimonioTotal | currency:'BRL' }}</span>
                </div>
                <div class="text-xl font-bold text-gray-400 px-2">+</div>
                <div class="flex flex-col items-center flex-1">
                    <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Proventos (12m)</span>
                    <span class="text-lg font-bold text-green-500 mt-1">{{ dividendos | currency:'BRL' }}</span>
                </div>
                <div class="text-xl font-bold text-gray-400 px-2">-</div>
                <div class="flex flex-col items-center flex-1">
                    <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Investido</span>
                    <span class="text-lg font-bold text-red-500 mt-1">{{ totalInvestido | currency:'BRL' }}</span>
                </div>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between items-center">
                <span class="text-base font-bold text-gray-800 dark:text-gray-200">Resultado Consolidado (Ganho Total)</span>
                <span class="text-xl font-extrabold px-3 py-1.5 rounded-lg"
                      [ngClass]="{
                         'text-green-500 bg-green-500/10': ganhoTotal > 0,
                         'text-red-500 bg-red-500/10': ganhoTotal < 0,
                         'text-orange-500 bg-orange-500/10': ganhoTotal === 0
                      }">
                    {{ ganhoTotal | currency:'BRL' }}
                </span>
            </div>

            <!-- Tabela de Ativos -->
            <div class="flex flex-col gap-2">
                <h5 class="m-0 text-surface-900 dark:text-surface-0 font-bold flex items-center gap-2">
                    <i class="pi pi-list text-primary"></i> Detalhamento por Ativo
                </h5>
                <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                    <table class="w-full text-left text-sm border-collapse min-w-[650px]">
                        <thead>
                            <tr class="bg-gray-50 dark:bg-surface-900 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
                                <th class="p-3">Ticker</th>
                                <th class="p-3 text-right">Qtd</th>
                                <th class="p-3 text-right">Preço Médio</th>
                                <th class="p-3 text-right">Preço Atual</th>
                                <th class="p-3 text-right">Total Investido</th>
                                <th class="p-3 text-right">Valor Atual</th>
                                <th class="p-3 text-right">Proventos (12m)</th>
                                <th class="p-3 text-right">Resultado</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                            <tr *ngFor="let ativo of ativos" class="hover:bg-gray-50/50 dark:hover:bg-surface-900/30 transition-colors">
                                <td class="p-3 font-bold text-surface-900 dark:text-surface-0">{{ ativo.ticker }}</td>
                                <td class="p-3 text-right">{{ ativo.quantidade }}</td>
                                <td class="p-3 text-right text-gray-600 dark:text-gray-400">{{ ativo.precoMedio | currency:'BRL' }}</td>
                                <td class="p-3 text-right text-gray-600 dark:text-gray-400">{{ ativo.precoAtual | currency:'BRL' }}</td>
                                <td class="p-3 text-right text-gray-600 dark:text-gray-400">{{ ativo.custoTotal | currency:'BRL' }}</td>
                                <td class="p-3 text-right font-medium text-surface-900 dark:text-surface-0">{{ ativo.valorTotal | currency:'BRL' }}</td>
                                <td class="p-3 text-right text-green-500">{{ (ativo.proventos12m || 0) | currency:'BRL' }}</td>
                                <td class="p-3 text-right font-bold" 
                                    [ngClass]="{
                                       'text-green-500': (ativo.valorTotal + (ativo.proventos12m || 0) - ativo.custoTotal) > 0,
                                       'text-red-500': (ativo.valorTotal + (ativo.proventos12m || 0) - ativo.custoTotal) < 0
                                    }">
                                    {{ (ativo.valorTotal + (ativo.proventos12m || 0) - ativo.custoTotal) | currency:'BRL' }}
                                </td>
                            </tr>
                            <tr *ngIf="!ativos || ativos.length === 0">
                                <td colspan="8" class="p-6 text-center text-gray-500">Nenhum ativo cadastrado.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <ng-template pTemplate="footer">
            <p-button label="Fechar" icon="pi pi-times" (onClick)="mostrarDetalhes = false"></p-button>
        </ng-template>
    </p-dialog>

    <!-- Pop-up Modal de Detalhamento de Dividendos -->
    <p-dialog header="Detalhamento de Proventos (Últimos 12 Meses)" [(visible)]="mostrarDetalhesDividendos" [modal]="true" [style]="{width: '750px'}" [breakpoints]="{'960px': '90vw'}" [draggable]="false" [resizable]="false">
        <div class="flex flex-col gap-4 py-2">
            <!-- Explicação do Cálculo -->
            <div class="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-surface-900/30">
                <p class="m-0 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Os <strong>Dividendos (Anuais)</strong> representam a soma de todos os dividendos e JCP (Juros sobre Capital Próprio) distribuídos pelas empresas nos últimos 12 meses, proporcional à quantidade de cotas/ações que você possui atualmente.
                </p>
            </div>

            <!-- Resumo Total -->
            <div class="flex justify-between items-center p-4 rounded-xl border border-purple-200 dark:border-purple-900/30 bg-purple-500/10 text-purple-700 dark:text-purple-300">
                <span class="text-base font-bold flex items-center gap-2">
                    <i class="pi pi-dollar"></i> Proventos Totais Recebidos (12m)
                </span>
                <span class="text-2xl font-extrabold">
                    {{ dividendos | currency:'BRL' }}
                </span>
            </div>

            <!-- Tabela de Dividendos por Ativo -->
            <div class="flex flex-col gap-2">
                <h5 class="m-0 text-surface-900 dark:text-surface-0 font-bold flex items-center gap-2">
                    <i class="pi pi-chart-bar text-primary"></i> Proventos por Ativo
                </h5>
                <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                    <table class="w-full text-left text-sm border-collapse min-w-[500px]">
                        <thead>
                            <tr class="bg-gray-50 dark:bg-surface-900 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
                                <th class="p-3">Ticker</th>
                                <th class="p-3 text-right">Qtd Atual</th>
                                <th class="p-3 text-right">Provento por Ação (12m)</th>
                                <th class="p-3 text-right">Total Recebido</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                            <tr *ngFor="let ativo of ativos" class="hover:bg-gray-50/50 dark:hover:bg-surface-900/30 transition-colors">
                                <td class="p-3 font-bold text-surface-900 dark:text-surface-0">{{ ativo.ticker }}</td>
                                <td class="p-3 text-right">{{ ativo.quantidade }}</td>
                                <td class="p-3 text-right text-gray-600 dark:text-gray-400">
                                    {{ (ativo.quantidade > 0 ? (ativo.proventos12m / ativo.quantidade) : 0) | currency:'BRL' }}
                                </td>
                                <td class="p-3 text-right font-bold text-green-500">
                                    {{ (ativo.proventos12m || 0) | currency:'BRL' }}
                                </td>
                            </tr>
                            <tr *ngIf="!ativos || ativos.length === 0">
                                <td colspan="4" class="p-6 text-center text-gray-500">Nenhum provento recebido ou ativo cadastrado.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <ng-template pTemplate="footer">
            <p-button label="Fechar" icon="pi pi-times" (onClick)="mostrarDetalhesDividendos = false"></p-button>
        </ng-template>
    </p-dialog>`
})
export class StatsWidget {
    @Input() patrimonioTotal: number = 0;
    @Input() ganhoTotal: number = 0;
    @Input() totalAtivos: number = 0;
    @Input() dividendos: number = 0;
    @Input() totalInvestido: number = 0;
    @Input() ativos: any[] = [];
    mostrarDetalhes: boolean = false;
    mostrarDetalhesDividendos: boolean = false;
}
