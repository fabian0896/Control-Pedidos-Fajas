import { Component, OnInit, OnDestroy } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { Subscription } from 'rxjs';
import { Pedido } from '../../models/pedido';
declare var $:any;
declare var M:any;

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit, OnDestroy {
  pedidos:any[];
  pedidoTemporal;
  pedidosSub:Subscription;
  
  numeroFactura:string;

  constructor(private ps: PedidosService) { 
    
    

    this.pedidosSub = ps.getPedidosFacturasPendientes().subscribe(data => {
      this.pedidos = data;
    });
  
  }

  ngOnInit() {
    $(document).ready(function(){
      $('.modal').modal();
    });
  }

  ngOnDestroy(){
    this.pedidosSub.unsubscribe();
  }

  abrirModal(pedido:Pedido){
    this.pedidoTemporal = pedido;
    $('#modal1').modal('open');
  }


  guardarFactura(){
    this.pedidoTemporal.factura = this.numeroFactura;
    this.ps.editarPedido(this.pedidoTemporal);
    this.numeroFactura = "";
  }


}
