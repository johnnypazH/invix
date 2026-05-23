import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { LayoutService } from '../../layout/service/layout.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ToastModule],
    template: `
        <p-toast></p-toast>
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden relative">
            
            <!-- Mini Header Customizado -->
            <div class="absolute top-0 left-0 w-full p-4 lg:px-8 flex justify-between items-center z-50">
                <div class="flex items-center gap-2">
                    <img src="assets/images/invix.jpeg" alt="Invix" class="h-8 rounded" />
                    <span class="text-surface-900 dark:text-surface-0 font-bold text-2xl">Invix</span>
                </div>
                <button type="button" pButton pRipple [text]="true" [rounded]="true" [icon]="isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'" severity="secondary" (click)="toggleDarkMode()"></button>
            </div>

            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <img src="assets/images/invix.jpeg" alt="Invix Logo" class="mb-8 w-24 shrink-0 mx-auto rounded-lg shadow-sm" />
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Crie sua Conta</div>
                            <span class="text-muted-color font-medium">Comece a gerenciar seus dividendos</span>
                        </div>

                        <div>
                            <label for="name1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Seu Nome</label>
                            <input pInputText id="name1" type="text" placeholder="Como quer ser chamado?" class="w-full md:w-120 mb-4" [(ngModel)]="name" />

                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">E-mail</label>
                            <input pInputText id="email1" type="email" placeholder="Endereço de e-mail" class="w-full md:w-120 mb-4" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Senha</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Crie uma senha segura" [toggleMask]="true" styleClass="mb-8" [fluid]="true" [feedback]="true" promptLabel="Digite a senha" weakLabel="Fraca" mediumLabel="Média" strongLabel="Forte"></p-password>

                            <p-button label="Criar Conta" styleClass="w-full" (onClick)="onRegister()" [loading]="loading"></p-button>
                            
                            <div class="text-center mt-6">
                                <span class="text-surface-600 dark:text-surface-200 font-medium text-lg">Já tem uma conta? </span>
                                <a routerLink="/auth/login" class="font-medium no-underline ml-2 text-primary cursor-pointer text-lg">Entrar</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Register {
    name: string = '';
    email: string = '';
    password: string = '';
    loading: boolean = false;

    isDarkTheme = computed(() => this.layoutService.layoutConfig().darkTheme);

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        public layoutService: LayoutService
    ) {}

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    onRegister() {
        if (!this.name || !this.email || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos.' });
            return;
        }

        this.loading = true;
        // Aqui disparamos para a rota futura que o backend vai fazer
        this.authService.register(this.name, this.email, this.password).subscribe({
            next: () => {
                this.loading = false;
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta criada! Entrando...' });
                this.router.navigate(['/']); // Redireciona pro dashboard (pois o JWT já veio)
            },
            error: (err) => {
                this.loading = false;
                console.error('Erro de cadastro', err);
                // Se o backend devolver HTTP 400 (ex: email já existe), capturamos aqui
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.error || 'Não foi possível criar a conta.' });
            }
        });
    }
}