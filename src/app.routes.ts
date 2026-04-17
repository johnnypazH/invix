import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';

// Seus componentes (Verifique se o caminho da importação está correto conforme suas pastas)
import { Dashboard } from './app/pages/dashboard/dashboard'; // O Sakai costuma exportar como 'Dashboard'
import { MinhaCarteira } from './app/pages/minha-carteira/minha-carteira'; // Caminho atualizado
import { NovoAporte } from './app/pages/novo-aporte/novo-aporte'; // Novo componente

import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            // Rota raiz (Dashboard)
            { path: '', component: Dashboard },

            // Rota da sua carteira (http://localhost:4200/carteira)
            { path: 'carteira', component: MinhaCarteira },

            // Rota para Novo Aporte
            { path: 'aporte', component: NovoAporte },
        ]
    },
    // Mantendo as rotas de autenticação para o futuro
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    // A página Notfound é útil para rotas que não existem
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];