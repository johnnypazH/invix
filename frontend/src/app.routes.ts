import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';

// Seus componentes (Verifique se o caminho da importação está correto conforme suas pastas)
import { Dashboard } from './app/pages/dashboard/dashboard'; // O Sakai costuma exportar como 'Dashboard'
import { MinhaCarteira } from './app/pages/minha-carteira/minha-carteira'; // Caminho atualizado
import { NovoAporte } from './app/pages/novo-aporte/novo-aporte'; // Novo componente
import { Relatorios } from './app/pages/dashboard/components/relatorios'; 
import { Perfil } from './app/pages/perfil/perfil'; // Componente de perfil do usuário 

import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/pages/auth/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard], // ← O SEGURANÇA BARRANDO A ENTRADA!
        children: [
            // Rota raiz (Dashboard)
            { path: '', component: Dashboard },

            // Rota da sua carteira, agora com ID (ex: /carteira/1)
            { path: 'carteira/:id', component: MinhaCarteira },

            // Rota genérica da carteira sem ID (acessada pelo menu lateral)
            { path: 'carteira', component: MinhaCarteira },

            // Rota para Novo Aporte
            { path: 'aporte', component: NovoAporte },

            // Rota para a aba de Relatórios e Metas
            { path: 'relatorios', component: Relatorios },

            // Rota para Edição de Perfil
            { path: 'perfil', component: Perfil },
        ]
    },
    // Mantendo as rotas de autenticação para o futuro
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    // A página Notfound é útil para rotas que não existem
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];