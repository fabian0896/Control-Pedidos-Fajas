import { Component, OnInit, OnDestroy } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido';
import { Subscription } from 'rxjs';

declare var $:any;
declare var M:any;

@Component({
  selector: 'app-guias-pendientes',
  templateUrl: './guias-pendientes.component.html',
  styleUrls: ['./guias-pendientes.component.css']
})
export class GuiasPendientesComponent implements OnInit, OnDestroy {

  pedidosTodos: Pedido[] = [];
  misPedidos: Pedido[] = []; 

  pedidoTemporal:Pedido;

  numeroGuia:string;

  pedidosTodosSub: Subscription;
  misPedidosSub: Subscription;

  constructor(private pedidosService: PedidosService) { 

    $(document).ready(function(){
      $('.tabs').tabs();
      $('.modal').modal();
    });

    this.pedidosTodosSub = this.pedidosService.getPedidosGuiasPendientesTodosV2().subscribe((data:any)=>{
      this.pedidosTodos = data;
    });

    this.misPedidosSub = this.pedidosService.getMisPedidosGuiasPendientesV2().subscribe((data:any)=>{
      this.misPedidos = data;
    });

  }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.misPedidosSub.unsubscribe();
    this.pedidosTodosSub.unsubscribe();
  }

  editarGuia(pedido:Pedido){
    if(this.pedidoTemporal != pedido){
      this.numeroGuia = "";
    }
    this.pedidoTemporal = pedido;
    $('.modal').modal('open');
  }

  actualizarGuia(){
    if(this.pedidoTemporal.isCambio){
      this.pedidoTemporal.cambios[0].guia = this.numeroGuia;
    } else {
      this.pedidoTemporal.guia = this.numeroGuia;
    } 
    this.pedidoTemporal.conGuia = true;
    this.pedidosService.editarPedido(this.pedidoTemporal);
  }

 copyToClipboard(texto:string) {
    var $temp = $("<input>")
    $("body").append($temp);
    $temp.val(texto).select();
    document.execCommand("copy");
    $temp.remove();
    M.toast({html: `se copió: ${ texto }`,displayLength: 600})
  }


}
