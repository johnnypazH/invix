import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `<!-- Card 1: Patrimônio Total -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
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

        <!-- Card 2: Lucro/Prejuízo -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Lucro / Prejuízo</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl" [class.text-green-500]="lucroPrejuizo > 0" [class.text-red-500]="lucroPrejuizo < 0">
                            {{ lucroPrejuizo | currency:'BRL' }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center rounded-border" style="width: 2.5rem; height: 2.5rem"
                         [ngClass]="{
                            'bg-green-100 dark:bg-green-400/10': lucroPrejuizo > 0,
                            'bg-red-100 dark:bg-red-400/10': lucroPrejuizo < 0,
                            'bg-orange-100 dark:bg-orange-400/10': lucroPrejuizo === 0
                         }">
                        <i class="pi pi-chart-line text-xl!" 
                           [ngClass]="{'text-green-500': lucroPrejuizo > 0, 'text-red-500': lucroPrejuizo < 0, 'text-orange-500': lucroPrejuizo === 0}"></i>
                    </div>
                </div>
                <span class="text-muted-color">Rentabilidade total</span>
            </div>
        </div>

        <!-- Card 3: Total de Ativos -->
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
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
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Dividendos (Anual)</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ dividendos | currency:'BRL' }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-muted-color">Projeção baseada no D.Y.</span>
            </div>
        </div>`
})
export class StatsWidget {
    @Input() patrimonioTotal: number = 0;
    @Input() lucroPrejuizo: number = 0;
    @Input() totalAtivos: number = 0;
    @Input() dividendos: number = 0;
}
