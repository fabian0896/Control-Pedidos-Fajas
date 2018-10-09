import { Component, OnInit, OnDestroy } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { Subscription, Observable } from 'rxjs';
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
  anularSub:Subscription;
  porAnular:any[] = [];
  numeroFactura:string;

  constructor(private ps: PedidosService) { 

    $(document).ready(function(){
      $('.tabs').tabs();
    });


    this.anularSub = this.ps.getFacturasNoAnuladas().subscribe(data=>{
      this.porAnular = data;
    });

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
    this.anularSub.unsubscribe();
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

  anularFactura(idx:number){
    this.porAnular[idx].factura = '';
    this.ps.editarPedido(this.porAnular[idx]);
    M.toast({html: 'Se anuló la factura'});
  }


}
