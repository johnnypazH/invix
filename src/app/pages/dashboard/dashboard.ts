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
import { MessageService } from 'primeng/api';

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
    ToastModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  
  carteiras: Carteira[] = [];
  saudacao: string = 'Olá!';
  feedDividendos: any[] = [];
  
  mostrarModal = false;
  carregando = false;
  novaCarteira: { nome: string; descricao?: string } = { nome: '' };

  constructor(
    private carteiraService: CarteiraService,
    private messageService: MessageService,
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
    this.mostrarModal = true;
  }

  salvarNovaCarteira() {
    if (!this.novaCarteira.nome?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'O nome da carteira é obrigatório.' });
      return;
    }

    this.carregando = true;
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