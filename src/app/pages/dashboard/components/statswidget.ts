import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
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
                    <div class="flex items-center justify-center rounded-border" style="width: 2.5rem; height: 2.5rem"
                         [ngClass]="{
                            'bg-green-100 dark:bg-green-400/10': ganhoTotal > 0,
                            'bg-red-100 dark:bg-red-400/10': ganhoTotal < 0,
                            'bg-orange-100 dark:bg-orange-400/10': ganhoTotal === 0
                         }">
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
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-muted-color">Baseado nos últimos 12 meses</span>
            </div>
        </div>`
})
export class StatsWidget {
    @Input() patrimonioTotal: number = 0;
    @Input() ganhoTotal: number = 0;
    @Input() totalAtivos: number = 0;
    @Input() dividendos: number = 0;
}
