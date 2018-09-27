import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Pedido } from '../../models/pedido';
import { PedidosService } from '../../services/pedidos.service';
import { Prenda } from '../../models/prenda';
declare var M:any;
declare var $:any;

@Component({
  selector: 'app-lista-prendas',
  templateUrl: './lista-prendas.component.html',
  styleUrls: ['./lista-prendas.component.css']
})
export class ListaPrendasComponent implements OnInit, OnChanges {

  @Input() pedido:Pedido;
  @Input() editable:boolean = true;
  @Input() modificable:boolean = true;
  @Input() isCambio:boolean = false;
  @Input() indice:number = 0;
  @Output() onCambio = new EventEmitter();

  constructor(private pedidoService:PedidosService) { 
    
    
  }

  ngOnInit() {
  

  }

  ngOnChanges(){
    if(this.pedido.estado >= 5){
      this.editable = false;
    } else{
      this.editable = true;
    }
  }

  estadoPrenda(estado:number, idx:number){
    if(estado == 1){
      M.toast({html: 'Prenda en produccion', displayLength: 1000});
    } else if ( estado == 2) {
      M.toast({html: 'Prenda lista!', displayLength: 1000});
    }
    if(this.pedido.isCambio){
      this.pedido.cambios[0].prendas[idx].estado = estado;
      this.pedido.estado = this.calcularEtadoPedido(this.pedido.cambios[0].prendas);
    } else {
      this.pedido.prendas[idx].estado = estado;
      this.pedido.completado = false;
      this.pedido.estado = this.calcularEtadoPedido(this.pedido.prendas);
    }
    this.pedidoService.editarPedido(this.pedido);
    this.onCambio.emit();
}

private calcularEtadoPedido(prendas:Prenda[]){
  let completado: number = 0;
  for(let prenda of prendas){
    if(prenda.estado == 1){
      return 2; // Algunas prendas en Produccon
    } else if ( prenda.estado == 0 ){
      return 1; // algunas prendas pendientes
    } else if (prenda.estado == 2){
     completado++; 
    }
  }
  if(completado == prendas.length){
    return 3;
  }
}

}
