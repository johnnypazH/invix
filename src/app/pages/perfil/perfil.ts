import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        InputTextModule,
        PasswordModule,
        ButtonModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './perfil.html'
})
export class Perfil implements OnInit {
    nome: string = '';
    email: string = '';
    senhaAtual: string = '';
    novaSenha: string = '';
    confirmarNovaSenha: string = '';

    carregando: boolean = false;
    salvando: boolean = false;

    constructor(
        private userService: UserService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.carregarPerfil();
    }

    carregarPerfil() {
        this.carregando = true;
        this.userService.getProfile().subscribe({
            next: (profile) => {
                this.nome = profile.name;
                this.email = profile.email;
                this.carregando = false;
            },
            error: (err) => {
                console.error('Erro ao carregar perfil:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não foi possível carregar as informações do perfil.'
                });
                this.carregando = false;
            }
        });
    }

    salvarAlteracoes() {
        if (!this.nome.trim() || !this.email.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Nome e E-mail são obrigatórios.'
            });
            return;
        }

        // Se preencheu nova senha, validar correspondência e senha atual
        if (this.novaSenha) {
            if (!this.senhaAtual) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Atenção',
                    detail: 'Você precisa informar a senha atual para definir uma nova senha.'
                });
                return;
            }
            if (this.novaSenha !== this.confirmarNovaSenha) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Atenção',
                    detail: 'A nova senha e a confirmação de senha não coincidem.'
                });
                return;
            }
        }

        this.salvando = true;
        const payload: any = {
            name: this.nome,
            email: this.email
        };

        if (this.novaSenha) {
            payload.currentPassword = this.senhaAtual;
            payload.newPassword = this.novaSenha;
        }

        this.userService.updateProfile(payload).subscribe({
            next: (res) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Perfil atualizado com sucesso!'
                });
                // Limpar campos de senha
                this.senhaAtual = '';
                this.novaSenha = '';
                this.confirmarNovaSenha = '';
                this.salvando = false;
            },
            error: (err) => {
                console.error('Erro ao atualizar perfil:', err);
                const errorMsg = err.error?.message || 'Ocorreu um erro ao atualizar o perfil.';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: errorMsg
                });
                this.salvando = false;
            }
        });
    }
}
