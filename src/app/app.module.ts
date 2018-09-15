import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { environment } from '../environments/environment';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule} from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { LoginService } from './services/login.service';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './components/home/home.component';
import { routes } from './app.routes';
import { RouterModule } from '@angular/router';
import { AuthGuardGuard } from './services/auth-guard.guard';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { PrendasComponent } from './components/prendas/prendas.component';
import { PrendasService } from './services/prendas.service';
import { PedidoComponent } from './components/pedido/pedido.component';
import { DetallesPedidoComponent } from './components/detalles-pedido/detalles-pedido.component';
import { PedidosService } from './services/pedidos.service';
import { AgoliaService } from './services/agolia.service';
import { ColorEstadoPrendaPipe } from './pipes/color-estado-prenda.pipe';
import { ListaPrendasComponent } from './components/lista-prendas/lista-prendas.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
import { GuiasPendientesComponent } from './components/guias-pendientes/guias-pendientes.component';
import { PrendasPendientesComponent } from './components/prendas-pendientes/prendas-pendientes.component';
import { FacturasComponent } from './components/facturas/facturas.component';
import { SkuvalidatorDirective } from './directives/skuvalidator.directive';
import { BusquedaComponent } from './components/busqueda/busqueda.component';
import { ConfigComponent } from './components/config/config.component';
import { PermisosService } from './services/permisos.service';
import { EstadistcasService } from './services/estadistcas.service';
import { GraficaComponent } from './components/grafica/grafica.component';
import { ChartsModule } from 'ng2-charts';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    HomeComponent,
    PedidosComponent,
    PrendasComponent,
    PedidoComponent,
    DetallesPedidoComponent,
    ColorEstadoPrendaPipe,
    ListaPrendasComponent,
    MisPedidosComponent,
    GuiasPendientesComponent,
    PrendasPendientesComponent,
    FacturasComponent,
    SkuvalidatorDirective,
    BusquedaComponent,
    ConfigComponent,
    GraficaComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFirestoreModule.enablePersistence(),
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    ChartsModule
  ],
  providers: [
    LoginService,
    AuthGuardGuard,
    PrendasService,
    PedidosService,
    AgoliaService,
    PermisosService,
    EstadistcasService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
