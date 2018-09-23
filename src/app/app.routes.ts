import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuardGuard } from './services/auth-guard.guard';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { PrendasComponent } from './components/prendas/prendas.component';
import { DetallesPedidoComponent } from './components/detalles-pedido/detalles-pedido.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
import { PrendasPendientesComponent } from './components/prendas-pendientes/prendas-pendientes.component';
import { GuiasPendientesComponent } from './components/guias-pendientes/guias-pendientes.component';
import { FacturasComponent } from './components/facturas/facturas.component';
import { BusquedaComponent } from './components/busqueda/busqueda.component';
import { ConfigComponent } from './components/config/config.component';
import { CambioComponent } from './components/cambio/cambio.component';



export const routes: Routes = [
    { path: 'home', component: HomeComponent, canActivate: [AuthGuardGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuardGuard] },
    { path: 'mispedidos', component: MisPedidosComponent, canActivate: [AuthGuardGuard] },
    { path: 'prendas', component: PrendasComponent, canActivate: [AuthGuardGuard] },
    { path: 'facturas', component: FacturasComponent, canActivate: [AuthGuardGuard] },
    { path: 'prendaspendientes', component: PrendasPendientesComponent, canActivate: [AuthGuardGuard] },
    { path: 'guias', component: GuiasPendientesComponent, canActivate: [AuthGuardGuard] },
    { path: 'busqueda', component: BusquedaComponent, canActivate: [AuthGuardGuard] },
    { path: 'config', component: ConfigComponent, canActivate: [AuthGuardGuard] },
    { path: 'detalles', component: DetallesPedidoComponent, canActivate: [AuthGuardGuard] },
    { path: 'detalles/:id', component: DetallesPedidoComponent, canActivate: [AuthGuardGuard] },
    { path: 'cambio/:id', component: CambioComponent, canActivate: [AuthGuardGuard] },
    { path: '**', pathMatch: 'full', redirectTo: 'home' },
];


