import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { LayoutService } from '../../layout/service/layout.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ToastModule],
    template: `
        <p-toast></p-toast>
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden relative">
            
            <!-- Mini Header Customizado para o Login -->
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
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Bem-vindo ao Invix</div>
                            <span class="text-muted-color font-medium">Sua carteira de dividendos</span>
                        </div>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">E-mail</label>
                            <input pInputText id="email1" type="text" placeholder="Endereço de e-mail" class="w-full md:w-120 mb-8" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Senha</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Sua senha" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Lembrar-me</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Esqueceu a senha?</span>
                            </div>
                            <p-button label="Entrar" styleClass="w-full" (onClick)="onLogin()" [loading]="loading"></p-button>
                            
                            <div class="text-center mt-6">
                                <span class="text-surface-600 dark:text-surface-200 font-medium text-lg">Não tem uma conta? </span>
                                <a routerLink="/auth/register" class="font-medium no-underline ml-2 text-primary cursor-pointer text-lg">Cadastre-se</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    email: string = '';

    password: string = '';

    checked: boolean = false;

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

    onLogin() {
        if (!this.email || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha email e senha' });
            return;
        }

        this.loading = true;
        this.authService.login(this.email, this.password).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/']); // Redireciona para o Dashboard com sucesso!
            },
            error: (err) => {
                this.loading = false;
                console.error('Erro de login', err);
                this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Credenciais inválidas' });
            }
        });
    }
}
