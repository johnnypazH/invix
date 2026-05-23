import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table'; // Para a lista de ações
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';

import { CarteiraService, Carteira } from '../../services/carteira.service';
import { AtivoService, Ativo } from '../../services/ativo.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-novo-aporte',
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule, TableModule, InputNumberModule, SelectModule, ToastModule],
    providers: [MessageService],
    styleUrl: './novo-aporte.scss',
    templateUrl: './novo-aporte.html'
})

export class NovoAporte implements OnInit {
    ativosDisponiveis: Ativo[] = [];
    minhasCarteiras: Carteira[] = []; // Simulação de carteiras do usuário

    mostrarModalNovaCarteira: boolean = false;
    novaCarteiraNome: string = '';

    carteiraSelecionada: Carteira | null = null;
    carregandoAporte: boolean = false;
    buscandoAtivo: boolean = false;
    mostrarModalAdicionarAtivo: boolean = false;
    ativoParaAporte: Ativo = {
        id: 0, ticker: '', nome: '', setor: 'Outros',
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

        // Busca ações REAIS da Brapi para exibir na tabela de oportunidades
        this.carregarAtivosPopulares();
    }

    carregarAtivosPopulares() {
        const tickersTop = 'PETR4,VALE3,ITUB4,WEGE3,BBAS3';
        this.ativoService.buscarCotacaoBrapi(tickersTop).subscribe({
            next: (response) => {
                if (response.results) {
                    this.ativosDisponiveis = response.results.map((acao: any, index: number) => ({
                        id: index,
                        ticker: acao.symbol,
                        nome: acao.shortName || acao.longName,
                        setor: 'Ações', // A rota básica da Brapi não traz o setor detalhado sem token premium
                        quantidade: 0,
                        precoMedio: 0,
                        precoAtual: acao.regularMarketPrice,
                        dividendYield: 0
                    }));
                }
            },
            error: (err) => console.error('Erro ao buscar Brapi:', err)
        });
    }

    abrirModalNovaCarteira() {
        this.novaCarteiraNome = ''; // Limpa o campo
        this.mostrarModalNovaCarteira = true;
    }

    salvarNovaCarteira() {
        if (this.novaCarteiraNome.trim()) {
            // Chama o backend real para criar a carteira
            this.carteiraService.adicionarCarteira({ nome: this.novaCarteiraNome.trim() }).subscribe({
                next: (carteiraAdicionada) => {
                    this.minhasCarteiras.push(carteiraAdicionada);
                    this.mostrarModalNovaCarteira = false;
                },
                error: (err) => console.error('Erro ao adicionar carteira:', err)
            });
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
        this.carteiraSelecionada = null; // Reseta a carteira selecionada
        this.mostrarModalAdicionarAtivo = true;
    }

    buscarDetalhesAtivo() {
        if (!this.ativoParaAporte.ticker) return;
        
        // Força o Ticker a ficar maiúsculo no formulário e para a chamada da API
        this.ativoParaAporte.ticker = this.ativoParaAporte.ticker.toUpperCase();
        this.buscandoAtivo = true;
        this.ativoService.buscarCotacaoBrapi(this.ativoParaAporte.ticker).subscribe({
            next: (response) => {
                if (response.results && response.results.length > 0) {
                    const acao = response.results[0];
                    this.ativoParaAporte.nome = acao.shortName || acao.longName;
                    this.ativoParaAporte.precoAtual = acao.regularMarketPrice;
                    // Sugere o preço atual do mercado como o preço que o usuário pagou
                    if (this.ativoParaAporte.precoMedio === 0) {
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
            
            this.ativoService.adicionarAtivo(this.carteiraSelecionada.id, this.ativoParaAporte)
                .pipe(finalize(() => this.carregandoAporte = false))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Aporte realizado com sucesso!' });
                        this.mostrarModalAdicionarAtivo = false;
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
