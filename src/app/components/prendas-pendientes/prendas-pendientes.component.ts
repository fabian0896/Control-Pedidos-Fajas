import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrendasService } from '../../services/prendas.service';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido';
import { Subscription, Observable } from 'rxjs';
import { PermisosService } from '../../services/permisos.service';
declare var $:any;

@Component({
  selector: 'app-prendas-pendientes',
  templateUrl: './prendas-pendientes.component.html',
  styleUrls: ['./prendas-pendientes.component.css']
})
export class PrendasPendientesComponent implements OnInit, OnDestroy {
  pedidos: any[];
  misPedidos: any[];

  permiso:Observable<number>;
  tipoCuenta:number;
  sub:Subscription;

  pedidosSub: Subscription;
  misPedidosSub: Subscription;
  constructor( private ps: PedidosService, private permisos:PermisosService) {
    
    this.permiso =  this.permisos.getPermisos();
    

    $(document).ready(function(){
      $('.tabs').tabs();
    });
    
    this.pedidosSub = this.ps.getPendientesTodos().subscribe((data:any) => {
        this.pedidos = data;
      });

    this.misPedidosSub = this.ps.getPendientesMisPedidos().subscribe((data:any) => {
      this.misPedidos = data;
    });
      
   }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.pedidosSub.unsubscribe();
    this.misPedidosSub.unsubscribe();
  }

}
