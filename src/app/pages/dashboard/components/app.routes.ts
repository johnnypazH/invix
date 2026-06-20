import { Routes } from '@angular/router';
import { AppLayout } from '../../../layout/component/app.layout';
import { Dashboard } from '../../dashboard/dashboard';
import { MinhaCarteira } from '../../minha-carteira/minha-carteira';
import { NovoAporte } from '../../novo-aporte/novo-aporte';
import { Relatorios } from './relatorios';
import { Notfound } from '../../notfound/notfound';
import { authGuard } from '../../auth/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'carteira/:id', component: MinhaCarteira },
            { path: 'carteira', component: MinhaCarteira },
            { path: 'aporte', component: NovoAporte },
            { path: 'relatorios', component: Relatorios }
        ]
    },
    { path: 'auth', loadChildren: () => import('../../auth/auth.routes') },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];