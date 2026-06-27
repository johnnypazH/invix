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
        <div class="flex min-h-screen min-w-screen overflow-hidden relative bg-surface-50 dark:bg-surface-950">
            
            <!-- Lado Esquerdo (Banner/Imagem) - Oculto em telas pequenas, aparece de md para cima -->
            <div class="hidden md:flex md:w-1/2 lg:w-3/5 bg-cover bg-center relative items-center justify-center p-12" 
                 style="background-image: url('assets/images/login_bg.png');">
                <!-- Overlay Escuro para Contraste -->
                <div class="absolute inset-0 bg-black/60 backdrop-blur-xs"></div>
                
                <!-- Conteúdo por cima da imagem (Glassmorphism card) -->
                <div class="relative z-10 max-w-lg bg-surface-900/40 backdrop-blur-md border border-white/10 p-8 rounded-3xl text-white">
                    <div class="flex items-center gap-3 mb-6">
                        <img src="assets/images/invix_logo.png" alt="Invix Logo" class="h-10 w-10 rounded-xl border border-white/20 shadow-md" />
                        <span class="text-3xl font-extrabold tracking-wider">INVIX</span>
                    </div>
                    <h2 class="text-4xl font-extrabold mb-4 leading-tight">Domine suas finanças e multiplique seus proventos</h2>
                    <p class="text-gray-300 text-lg mb-0 font-medium">Acompanhe dividendos, analise a evolução da sua carteira de investimentos e simule sua liberdade financeira em um só lugar.</p>
                </div>
            </div>

            <!-- Lado Direito (Formulário de Cadastro) -->
            <div class="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center px-6 py-12 lg:px-16 relative">
                
                <!-- Botão de Dark Mode no topo direito -->
                <div class="absolute top-4 right-4 z-50">
                    <button type="button" pButton pRipple [text]="true" [rounded]="true" 
                            [icon]="isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'" severity="secondary" 
                            (click)="toggleDarkMode()"></button>
                </div>

                <div class="w-full max-w-md mx-auto">
                    <!-- Cabeçalho (Exibido no Mobile) -->
                    <div class="flex items-center gap-2 mb-8 md:hidden">
                        <img src="assets/images/invix_logo.png" alt="Invix" class="h-8 rounded-lg shadow-sm" />
                        <span class="text-surface-900 dark:text-surface-0 font-extrabold text-2xl tracking-wider">Invix</span>
                    </div>

                    <div class="mb-6">
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-extrabold mb-2">Crie sua conta</div>
                        <p class="text-muted-color font-medium">Cadastre-se para começar a gerenciar seus dividendos.</p>
                    </div>

                    <div class="flex flex-col gap-5">
                        <div>
                            <label for="name1" class="block text-surface-900 dark:text-surface-0 font-semibold mb-2">Seu Nome</label>
                            <input pInputText id="name1" type="text" placeholder="Como quer ser chamado?" class="w-full" [(ngModel)]="name" />
                        </div>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 font-semibold mb-2">E-mail</label>
                            <input pInputText id="email1" type="email" placeholder="exemplo@email.com" class="w-full" [(ngModel)]="email" />
                        </div>

                        <div>
                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-semibold mb-2">Senha</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Crie uma senha de acesso segura" [toggleMask]="true" [fluid]="true" [feedback]="true" promptLabel="Digite a senha" weakLabel="Fraca" mediumLabel="Média" strongLabel="Forte"></p-password>
                        </div>

                        <p-button label="Criar Minha Conta" styleClass="w-full py-3 mt-4 font-bold" (onClick)="onRegister()" [loading]="loading"></p-button>
                        
                        <div class="text-center mt-4">
                            <span class="text-muted-color font-medium">Já tem uma conta? </span>
                            <a routerLink="/auth/login" class="font-bold text-primary hover:underline">Entrar</a>
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