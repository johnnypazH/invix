import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { StatsWidget } from './components/statswidget';
import { Carteira, CarteiraService } from '../../services/carteira.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    StatsWidget
  ],
  providers: [ConfirmationService],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  
  carteiras: Carteira[] = [];
  saudacao: string = 'Olá!';
  feedDividendos: any[] = [];
  patrimonioTotal: number = 0;
  lucroTotal: number = 0;
  totalAtivos: number = 0;
  dividendosTotal: number = 0;
  
  mostrarModal = false;
  carregando = false;
  editando = false;
  carteiraIdEmEdicao: string | null = null;
  novaCarteira: { nome: string; descricao?: string } = { nome: '' };

  constructor(
    private carteiraService: CarteiraService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.carregarDashboard();
  }

  carregarDashboard() {
    this.carteiraService.getDashboard().subscribe({
      next: (dadosBff) => {
        this.carteiras = dadosBff.carteiras || [];
        this.saudacao = dadosBff.saudacao || 'Olá!';
        this.feedDividendos = dadosBff.feedDividendos || [];
        
        // Recebendo os superpoderes do backend
        this.patrimonioTotal = dadosBff.patrimonioTotal || 0;
        this.lucroTotal = dadosBff.lucroTotal || 0;
        this.totalAtivos = dadosBff.totalAtivos || this.carteiras.reduce((acc, c: any) => acc + (c.assets ? c.assets.length : 0), 0);
        this.dividendosTotal = dadosBff.dividendosTotal || 0;

        console.log('Dados recebidos do BFF:', dadosBff);
      },
      error: (err) => {
        console.error('Erro ao conectar com o BFF:', err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as carteiras do banco.' });
      }
    });
  }

  abrirModal() {
    this.novaCarteira = { nome: '', descricao: '' };
    this.editando = false;
    this.carteiraIdEmEdicao = null;
    this.mostrarModal = true;
  }

  abrirModalEdicao(carteira: Carteira) {
    this.novaCarteira = { nome: carteira.nome, descricao: carteira.descricao };
    this.editando = true;
    this.carteiraIdEmEdicao = carteira.id || null;
    this.mostrarModal = true;
  }

  salvarCarteira() {
    if (!this.novaCarteira.nome?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'O nome da carteira é obrigatório.' });
      return;
    }

    this.carregando = true;

    if (this.editando && this.carteiraIdEmEdicao) {
      this.carteiraService.atualizarCarteira(this.carteiraIdEmEdicao, this.novaCarteira)
        .pipe(finalize(() => this.carregando = false))
        .subscribe({
          next: (carteiraAtualizada) => {
            const index = this.carteiras.findIndex(c => c.id === this.carteiraIdEmEdicao);
            if (index !== -1) {
              this.carteiras[index] = carteiraAtualizada;
              this.carteiras = [...this.carteiras];
            }
            this.mostrarModal = false;
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Carteira atualizada!' });
          },
          error: (err) => {
            console.error('Erro ao atualizar carteira:', err);
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar a carteira.' });
          }
        });
    } else {
      this.carteiraService.adicionarCarteira(this.novaCarteira)
        .pipe(finalize(() => this.carregando = false))
        .subscribe({
          next: (carteiraAdicionada) => {
            this.carteiras = [...this.carteiras, carteiraAdicionada];
            this.mostrarModal = false;
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Nova carteira criada!' });
          },
          error: (err) => {
            console.error('Erro ao criar carteira:', err);
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar a carteira.' });
          }
        });
    }
  }

  confirmarExclusao(carteira: Carteira) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a carteira "${carteira.nome}"? Esta ação não pode ser desfeita e removerá todos os ativos vinculados a ela.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (carteira.id) {
          this.carteiraService.excluirCarteira(carteira.id).subscribe({
            next: () => {
              this.carteiras = this.carteiras.filter(c => c.id !== carteira.id);
              this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Carteira excluída com sucesso!' });
            },
            error: (err) => {
              console.error('Erro ao excluir carteira:', err);
              this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir a carteira.' });
            }
          });
        }
      }
    });
  }
}