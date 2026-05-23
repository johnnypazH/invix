import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, MenuModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <img src="assets/images/invix.jpeg" alt="Invix" class="h-8 mr-2"/>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
            </button>
            <button class="layout-topbar-menu-button layout-topbar-action" (click)="menu.toggle($event)">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" (click)="menu.toggle($event)">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                    <p-menu #menu [model]="userMenuItems" [popup]="true"></p-menu>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];
    userMenuItems!: MenuItem[];

    constructor(public layoutService: LayoutService, private authService: AuthService) {}

    ngOnInit() {
        const isLogado = !!this.authService.getToken();

        if (isLogado) {
            this.userMenuItems = [
                { label: 'Meu Perfil', icon: 'pi pi-user' },
                { separator: true },
                { label: 'Sair', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
            ];
        } else {
            this.userMenuItems = [
                { label: 'Entrar / Login', icon: 'pi pi-sign-in', routerLink: '/auth/login' }
            ];
        }
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
