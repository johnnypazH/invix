import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table'; // Para a lista de ações
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';

import { CarteiraService, Carteira } from '../../services/carteira.service';
import { AtivoService, Ativo } from '../../services/ativo.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-novo-aporte',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, DialogModule, InputTextModule, FormsModule, TableModule, InputNumberModule, SelectModule, DatePickerModule, TextareaModule, ToastModule],
    providers: [MessageService],
    styleUrl: './novo-aporte.scss',
    templateUrl: './novo-aporte.html'
})

export class NovoAporte implements OnInit {
    ativosDisponiveis: Ativo[] = [];
    minhasCarteiras: Carteira[] = []; // Simulação de carteiras do usuário

    mostrarModalNovaCarteira: boolean = false;
    novaCarteiraNome: string = '';
    novaCarteiraDescricao: string = '';
    novaCarteiraMetaMensal: number | null = null;
    
    editando: boolean = false;
    carteiraIdEmEdicao: string | null = null;

    carteiraSelecionada: Carteira | null = null;
    carregandoAporte: boolean = false;
    buscandoAtivo: boolean = false;
    mostrarModalAdicionarAtivo: boolean = false;
    ativoParaAporte: Ativo = {
        id: 0, ticker: '', nome: '', setor: '',
        quantidade: 0, precoMedio: 0, precoAtual: 0, dividendYield: 0
    };

    constructor(
        private carteiraService: CarteiraService,
        private ativoService: AtivoService,
        private messageService: MessageService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        // Carrega as carteiras do backend
        this.carteiraService.getDashboard().subscribe({
            next: (dados: any) => {
                this.minhasCarteiras = dados.carteiras || [];
            },
            error: (err) => console.error('Erro ao carregar carteiras:', err)
        });

        this.carregarAtivosDisponiveis();
    }

    carregarAtivosDisponiveis() {
        this.ativoService.getAtivosDisponiveis().subscribe({
            next: (ativos) => {
                this.ativosDisponiveis = ativos;
            },
            error: (err) => console.error('Erro ao carregar ativos disponíveis:', err)
        });
    }

    abrirModalNovaCarteira() {
        this.novaCarteiraNome = '';
        this.novaCarteiraDescricao = '';
        this.novaCarteiraMetaMensal = null;
        this.editando = false;
        this.carteiraIdEmEdicao = null;
        this.mostrarModalNovaCarteira = true;
    }

    abrirModalEdicao(carteira: Carteira) {
        this.novaCarteiraNome = carteira.nome;
        this.novaCarteiraDescricao = carteira.descricao || '';
        this.novaCarteiraMetaMensal = carteira.metaMensal || null;
        this.editando = true;
        this.carteiraIdEmEdicao = carteira.id || null;
        this.mostrarModalNovaCarteira = true;
    }

    confirmarExclusao(carteira: Carteira) {
        if (confirm(`Tem certeza que deseja excluir a carteira "${carteira.nome}"? Esta ação removerá todos os ativos vinculados a ela.`)) {
            if (carteira.id) {
                this.carteiraService.excluirCarteira(carteira.id).subscribe({
                    next: () => {
                        this.minhasCarteiras = this.minhasCarteiras.filter(c => c.id !== carteira.id);
                        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Carteira excluída com sucesso!' });
                    },
                    error: (err) => {
                        console.error('Erro ao excluir carteira:', err);
                        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir a carteira.' });
                    }
                });
            }
        }
    }

    salvarNovaCarteira() {
        if (!this.novaCarteiraNome.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'O nome da carteira é obrigatório.' });
            return;
        }

        const payload = {
            nome: this.novaCarteiraNome.trim(),
            descricao: this.novaCarteiraDescricao.trim() || undefined,
            metaMensal: this.novaCarteiraMetaMensal ?? undefined
        };

        if (this.editando && this.carteiraIdEmEdicao) {
            this.carteiraService.atualizarCarteira(this.carteiraIdEmEdicao, payload).subscribe({
                next: (carteiraAtualizada) => {
                    const index = this.minhasCarteiras.findIndex(c => c.id === this.carteiraIdEmEdicao);
                    if (index !== -1) {
                        this.minhasCarteiras[index] = {
                            ...carteiraAtualizada,
                            nome: carteiraAtualizada.nome || (carteiraAtualizada as any).name || ''
                        };
                        this.minhasCarteiras = [...this.minhasCarteiras];
                    }
                    this.mostrarModalNovaCarteira = false;
                    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Carteira atualizada!' });
                },
                error: (err) => {
                    console.error('Erro ao atualizar carteira:', err);
                    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar a carteira.' });
                }
            });
        } else {
            this.carteiraService.adicionarCarteira(payload).subscribe({
                next: (carteiraAdicionada) => {
                    this.minhasCarteiras.push({
                        ...carteiraAdicionada,
                        nome: carteiraAdicionada.nome || (carteiraAdicionada as any).name || ''
                    });
                    this.mostrarModalNovaCarteira = false;
                    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Carteira criada com sucesso!' });
                },
                error: (err) => {
                    console.error('Erro ao adicionar carteira:', err);
                    this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar a carteira.' });
                }
            });
        }
    }

    abrirModalAdicionarAtivo() {
        this.ativoParaAporte = {
            id: 0, ticker: '', nome: '', setor: '',
            quantidade: 0, precoMedio: 0, precoAtual: 0, dividendYield: 0
        };
        this.mostrarModalAdicionarAtivo = true;
    }

    selecionarAtivoParaAporte(ativo: Ativo) {
        // Mantém o fluxo de aporte, sugerindo o preço atual como preço de compra
        this.ativoParaAporte = { ...ativo, quantidade: 0, precoMedio: ativo.precoAtual || 0, dataCompra: undefined };
        this.carteiraSelecionada = null;
        this.mostrarModalAdicionarAtivo = true;
    }

    buscarDetalhesAtivo() {
        if (!this.ativoParaAporte.ticker) return;
        
        // Força o Ticker a ficar maiúsculo e corta espaços em branco acidentais
        this.ativoParaAporte.ticker = this.ativoParaAporte.ticker.toUpperCase().trim();
        this.buscandoAtivo = true;
        this.ativoService.buscarCotacaoBrapi(this.ativoParaAporte.ticker).subscribe({
            next: (response) => {
                if (response.results && response.results.length > 0) {
                    const acao = response.results[0];
                    this.ativoParaAporte.nome = acao.shortName || acao.longName;
                    this.ativoParaAporte.precoAtual = acao.regularMarketPrice;
                    // Sugere o preço atual do mercado como o preço que o usuário pagou
                    if (!this.ativoParaAporte.precoMedio || this.ativoParaAporte.precoMedio === 0) {
                        this.ativoParaAporte.precoMedio = acao.regularMarketPrice; 
                    }
                    this.messageService.add({ severity: 'info', summary: 'Ativo Encontrado', detail: this.ativoParaAporte.nome });
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

    adicionarAtivo() {
        if (!this.carteiraSelecionada?.id) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Selecione a carteira de destino.' });
            return;
        }

        if (this.ativoParaAporte.ticker && this.ativoParaAporte.quantidade > 0 && this.ativoParaAporte.precoMedio > 0) {
            this.carregandoAporte = true;
            
            const payload = { ...this.ativoParaAporte };
            if (payload.dataCompra instanceof Date) {
                payload.dataCompra = payload.dataCompra.toISOString().split('T')[0];
            }

            this.ativoService.adicionarAtivo(this.carteiraSelecionada.id, payload)
                .pipe(finalize(() => this.carregandoAporte = false))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Aporte realizado com sucesso!' });
                        this.mostrarModalAdicionarAtivo = false;
                        this.carregarAtivosDisponiveis();
                    },
                    error: (err) => {
                        console.error('Erro ao aportar ativo:', err);
                        const msgErro = err.error?.error || 'Falha ao salvar o aporte no banco de dados.';
                        this.messageService.add({ severity: 'error', summary: 'Erro', detail: msgErro });
                    }
                });
        } else {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha a quantidade e preço do ativo.' });
        }
    }
}
