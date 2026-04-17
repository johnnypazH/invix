import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { StatsWidget } from './components/statswidget';
import { CarteiraService, Ativo } from '../../services/carteira';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, TableModule, StatsWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget 
                class="contents"
                [patrimonioTotal]="patrimonioTotal"
                [lucroPrejuizo]="lucroPrejuizo"
                [totalAtivos]="totalAtivos"
                [dividendos]="dividendos"
            />

            <div class="col-span-12">
                <div class="card">
                    <h5>Resumo da Carteira Consolidada</h5>
                    
                    <p-table [value]="ativos" 
                             [paginator]="true" 
                             [rows]="5" 
                             responsiveLayout="scroll" 
                             styleClass="p-datatable-sm p-datatable-striped text-sm">
                        <ng-template pTemplate="header">
                            <tr>
                                <th class="white-space-nowrap">Ticker</th>
                                <th class="white-space-nowrap">Empresa</th>
                                <th class="white-space-nowrap">Setor</th>
                                <th class="white-space-nowrap">Qtd.</th>
                                <th class="white-space-nowrap">Preço Médio</th>
                                <th class="white-space-nowrap">Preço Atual</th>
                                <th class="white-space-nowrap">Total Investido</th>
                                <th class="white-space-nowrap">Lucro/Prejuízo</th>
                            </tr>
                        </ng-template>

                        <ng-template pTemplate="body" let-ativo>
                            <tr>
                                <td class="white-space-nowrap"><span class="font-bold border-round p-2 surface-100">{{ativo.ticker}}</span></td>
                                <td class="white-space-nowrap">{{ativo.nome}}</td>
                                <td class="white-space-nowrap">{{ativo.setor}}</td>
                                <td class="white-space-nowrap">{{ativo.quantidade}}</td>
                                <td class="white-space-nowrap">{{ativo.precoMedio | currency:'BRL'}}</td>
                                <td class="white-space-nowrap font-semibold" [class.text-green-500]="ativo.precoAtual > ativo.precoMedio" [class.text-red-500]="ativo.precoAtual < ativo.precoMedio">
                                    {{ativo.precoAtual | currency:'BRL'}}
                                </td>
                                <td class="white-space-nowrap">{{ ativo.quantidade * ativo.precoMedio | currency:'BRL' }}</td>
                                <td class="white-space-nowrap font-bold" [class.text-green-500]="getRentabilidade(ativo) > 0" [class.text-red-500]="getRentabilidade(ativo) < 0">
                                    {{ getRentabilidade(ativo) | currency:'BRL' }}
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>
        </div>
    `
})
export class Dashboard implements OnInit {
    ativos: Ativo[] = [];

    // Propriedades para os cards
    patrimonioTotal: number = 0;
    lucroPrejuizo: number = 0;
    totalAtivos: number = 0;
    dividendos: number = 0;

    constructor(private carteiraService: CarteiraService) {}

    ngOnInit() {
        this.carteiraService.getCarteira().subscribe(dados => {
            this.ativos = dados;
            this.calcularIndicadores();
        });
    }

    calcularIndicadores() {
        const totalInvestido = this.ativos.reduce((acc, ativo) => acc + (ativo.quantidade * ativo.precoMedio), 0);
        this.patrimonioTotal = this.ativos.reduce((acc, ativo) => acc + (ativo.quantidade * ativo.precoAtual), 0);
        this.lucroPrejuizo = this.patrimonioTotal - totalInvestido; // Corrigindo a ordem da subtração
        // Linha de teste (descomente para testar):
        // this.lucroPrejuizo = -500
        this.totalAtivos = this.ativos.length;
        // Simulação de dividendos anuais projetados
        this.dividendos = this.ativos.reduce((acc, ativo) => acc + ((ativo.quantidade * ativo.precoAtual) * (ativo.dividendYield / 100)), 0);
    }

    getRentabilidade(ativo: Ativo): number {
        if (!ativo) return 0;
        return (ativo.precoAtual - ativo.precoMedio) * ativo.quantidade;
    }
}
