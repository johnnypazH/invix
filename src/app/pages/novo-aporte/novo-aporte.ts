import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table'; // Para a lista de ações
import { InputNumberModule } from 'primeng/inputnumber';

// Importe o serviço de carteira para reutilizar a interface Ativo
import { CarteiraService, Ativo } from '../../services/carteira';

interface Carteira {
    id: number;
    nome: string;
}

@Component({
    selector: 'app-novo-aporte',
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule, TableModule, InputNumberModule],
    styleUrl: './novo-aporte.scss',
    template: `
        <div class="grid novo-aporte-grid">
            <div class="col-12">
                <div class="card h-full p-4"> <!-- Adicionado p-4 para padding interno do card -->
                    <h1 class="m-0 text-2xl font-bold">Gerenciar Carteiras</h1>
                    <p class="text-500 mb-4">Crie e gerencie suas carteiras de investimento.</p>
                    <div class="flex flex-column gap-3">
                        <p-button label="Criar Nova Carteira" icon="pi pi-folder-open" (onClick)="abrirModalNovaCarteira()"></p-button>
                    </div>
                </div>
            </div>

            <div class="col-12">
                <div class="card p-4"> <!-- Adicionado p-4 para padding interno do card -->
                    <div class="flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 class="m-0 text-2xl font-bold">Aportar Ativos</h1>
                            <p class="text-500 mb-0">Selecione um ativo da lista ou adicione um novo.</p>
                        </div>
                        <p-button class="botaoaddativosuperior" label="Adicionar Novo Ativo" icon="pi pi-plus" (onClick)="abrirModalAdicionarAtivo()" severity="secondary" styleClass="p-button-lg"></p-button>
                    </div>

                    <p-table [value]="ativosDisponiveis" 
                             [paginator]="true" 
                             [rows]="5" 
                             responsiveLayout="scroll" 
                             styleClass="p-datatable-striped">
                        <ng-template pTemplate="header">
                            <tr>
                                <th>Ticker</th>
                                <th>Empresa</th>
                                <th>Setor</th>
                                <th>Preço Atual</th>
                                <th>Ações</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-ativo>
                            <tr>
                                <td><span class="font-bold border-round p-2 surface-100">{{ativo.ticker}}</span></td>
                                <td>{{ativo.nome}}</td>
                                <td>{{ativo.setor}}</td>
                                <td>{{ativo.precoAtual | currency:'BRL'}}</td>
                                <td>
                                    <p-button icon="pi pi-plus" label="Aportar" styleClass="p-button-sm" (onClick)="selecionarAtivoParaAporte(ativo)"></p-button>
                                </td>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="emptymessage">
                            <tr>
                                <td colspan="5">Nenhum ativo disponível para aporte.</td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>

            <!-- Modals -->
            <p-dialog header="Criar Nova Carteira" 
                      [(visible)]="mostrarModalNovaCarteira" 
                      [modal]="true" 
                      [style]="{width: '350px'}" 
                      [draggable]="false" 
                      [resizable]="false">
                <div class="p-fluid grid formgrid pt-2 px-0">
                    <div class="field col-12 mb-3">
                        <label htmlFor="nomeCarteira" class="font-bold block mb-2">Nome da Carteira</label>
                        <input pInputText id="nomeCarteira" [(ngModel)]="novaCarteiraNome" placeholder="Ex: Carteira de Longo Prazo" autofocus />
                    </div>
                </div>
                <ng-template pTemplate="footer">
                    <p-button label="Cancelar" icon="pi pi-times" [text]="true" (onClick)="mostrarModalNovaCarteira = false"></p-button>
                    <p-button label="Salvar" icon="pi pi-check" (onClick)="salvarNovaCarteira()"></p-button>
                </ng-template>
            </p-dialog>

            <p-dialog header="Adicionar Novo Ativo" 
                      [(visible)]="mostrarModalAdicionarAtivo" 
                      [modal]="true" 
                      [style]="{width: '380px'}" 
                      [breakpoints]="{'960px': '75vw', '640px': '95vw'}"
                      [draggable]="false" 
                      [resizable]="false">
                
                <div class="p-fluid grid formgrid pt-2 px-0">
                    <div class="field col-12 mb-3">
                        <label htmlFor="ticker" class="font-bold block mb-2">Ticker (Código)</label>
                        <input pInputText id="ticker" 
                               [(ngModel)]="ativoParaAporte.ticker" 
                               placeholder="Ex: WEGE3" 
                               autofocus 
                               class="text-lg" />
                        <small class="text-500 mt-1 block">O sistema buscará o nome automaticamente.</small>
                    </div>

                    <div class="field col-12 mb-3 text-left">
                        <label htmlFor="qtd" class="font-bold block mb-2">Quantidade</label>
                        <p-inputNumber id="qtd" 
                                       [(ngModel)]="ativoParaAporte.quantidade" 
                                       [showButtons]="true" 
                                       [min]="1"
                                       buttonLayout="horizontal" 
                                       inputId="horizontal" 
                                       spinnerMode="horizontal" 
                                       [step]="1"
                                       decrementButtonClass="p-button-danger" 
                                       incrementButtonClass="p-button-success" 
                                       incrementButtonIcon="pi pi-plus" 
                                       decrementButtonIcon="pi pi-minus"
                                       inputStyleClass="text-center font-bold text-lg">
                        </p-inputNumber>
                    </div>

                    <div class="field col-12 mb-0">
                        <label htmlFor="preco" class="font-bold block mb-2">Preço Pago (Unitário)</label>
                        <p-inputNumber id="preco" 
                                       [(ngModel)]="ativoParaAporte.precoMedio" 
                                       mode="currency" 
                                       currency="BRL" 
                                       locale="pt-BR" 
                                       placeholder="R$ 0,00"
                                       class="font-bold text-lg">
                        </p-inputNumber>
                    </div>
                </div>

                <ng-template pTemplate="footer">
                    <p-button label="Cancelar" icon="pi pi-times" [text]="true" (onClick)="mostrarModalAdicionarAtivo = false"></p-button>
                    <p-button label="Adicionar" icon="pi pi-check" (onClick)="adicionarAtivo()"></p-button>
                </ng-template>
            </p-dialog>
        </div>
    `
})
export class NovoAporte implements OnInit {
    ativosDisponiveis: Ativo[] = [];
    minhasCarteiras: Carteira[] = []; // Simulação de carteiras do usuário

    mostrarModalNovaCarteira: boolean = false;
    novaCarteiraNome: string = '';

    mostrarModalAdicionarAtivo: boolean = false;
    ativoParaAporte: Ativo = {
        id: 0, ticker: '', nome: '', setor: 'Outros',
        quantidade: 0, precoMedio: 0, precoAtual: 0, dividendYield: 0
    };

    constructor(private carteiraService: CarteiraService) {}

    ngOnInit() {
        // Carrega a lista de ativos (simulada)
        this.carteiraService.getCarteira().subscribe(dados => {
            this.ativosDisponiveis = dados;
        });

        // Simula algumas carteiras existentes
        this.minhasCarteiras = [
            { id: 1, nome: 'Carteira Principal' },
            { id: 2, nome: 'Aposentadoria' }
        ];
    }

    abrirModalNovaCarteira() {
        this.novaCarteiraNome = ''; // Limpa o campo
        this.mostrarModalNovaCarteira = true;
    }

    salvarNovaCarteira() {
        if (this.novaCarteiraNome.trim()) {
            const novoId = this.minhasCarteiras.length > 0 ? Math.max(...this.minhasCarteiras.map(c => c.id)) + 1 : 1;
            this.minhasCarteiras.push({ id: novoId, nome: this.novaCarteiraNome.trim() });
            console.log('Nova carteira criada:', this.novaCarteiraNome);
            // Aqui você enviaria para o serviço/backend
            this.mostrarModalNovaCarteira = false;
        }
    }

    abrirModalAdicionarAtivo() {
        this.ativoParaAporte = {
            id: 0, ticker: '', nome: '', setor: 'Outros',
            quantidade: 0, precoMedio: 0, precoAtual: 0, dividendYield: 0
        };
        this.mostrarModalAdicionarAtivo = true;
    }

    selecionarAtivoParaAporte(ativo: Ativo) {
        // Preenche o modal com os dados do ativo selecionado
        this.ativoParaAporte = { ...ativo, quantidade: 0, precoMedio: 0 }; // Zera quantidade e preço médio para novo aporte
        this.mostrarModalAdicionarAtivo = true;
    }

    adicionarAtivo() {
        if (this.ativoParaAporte.ticker && this.ativoParaAporte.quantidade > 0 && this.ativoParaAporte.precoMedio > 0) {
            // Lógica para adicionar o ativo a uma carteira específica (futuramente)
            // Por enquanto, apenas loga e fecha o modal
            console.log('Ativo adicionado:', this.ativoParaAporte);
            // Aqui você chamaria um serviço para registrar o aporte
            this.mostrarModalAdicionarAtivo = false;
        } else {
            // Adicionar validação visual ou mensagem de erro
            console.warn('Preencha todos os campos para adicionar o ativo.');
        }
    }
}
