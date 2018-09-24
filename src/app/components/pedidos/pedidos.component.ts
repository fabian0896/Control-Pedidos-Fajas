import { Component, OnInit, OnDestroy, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido';
import { Subscription, Subject, BehaviorSubject, Observable } from 'rxjs';
import { Prenda } from '../../models/prenda';
import { AngularFirestoreDocument, DocumentSnapshot } from 'angularfire2/firestore';
import { switchMap } from 'rxjs/operators';
import { PermisosService } from '../../services/permisos.service';
declare var $:any;
declare var M:any;

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit, OnDestroy {

  pedidos:Pedido[] = [];
  pedidosCompletados:Pedido[];
  pedidosPendientes:Pedido[];


  //Variables para el Modal
  pedidoTemporal:Pedido;
  nombreVendedorTemporal:string;
  estadoPedidoTemporal:string;
  totalPrendasTemporal:string;
  guiaTemporal:string;

  permiso:Promise<number>;

  todosLosPedidosSub:Subscription;
  pedidosPendientesSub: Subscription;
  pedidosCompletadosSub: Subscription;

  mostrarVerMasTodos: boolean = true;
  mostrarVerMasCompletados: boolean = true;

  constructor(private router:Router, private pedidoService: PedidosService, private permisos:PermisosService) {
    $(document).ready(function(){
      $('.tabs').tabs();
      $('.modal').modal();
    });

    this.permiso = this.permisos.getPermisos();

    this.todosLosPedidosSub = pedidoService.getTodos().subscribe((data:Pedido[]) => {
      this.pedidos = data;
    });

    this.pedidosPendientesSub = pedidoService.getPendientesTodos().subscribe((data:any) => {
      this.pedidosPendientes = data
    });

    this.pedidosCompletadosSub = pedidoService.getCompletadosTodos().subscribe((data:any) => {
      this.pedidosCompletados = data
    }); 
    
    

  }

  ngOnInit() {
  }

  mostrarMasTodos(){
    this.todosLosPedidosSub.unsubscribe();
    this.pedidoService.aumentarLimeteConsulta();
    this.todosLosPedidosSub = this.pedidoService.getTodos().subscribe((data:Pedido[]) => {
      if(this.pedidos.length == data.length ){
        this.mostrarVerMasTodos = false;
      }
      this.pedidos = data;
    });
  }

  mostrarCompletados(){
    this.pedidosCompletadosSub.unsubscribe();
    this.pedidoService.aumentarLimeteConsultaCompletadosTodos();
    this.pedidosCompletadosSub = this.pedidoService.getCompletadosTodos().subscribe((data:Pedido[]) => {
      if(this.pedidosCompletados.length == data.length ){
        this.mostrarVerMasCompletados = false;
      }
      this.pedidosCompletados = data;
    });
  }

  ngOnDestroy(){
    this.todosLosPedidosSub.unsubscribe();
    this.pedidosPendientesSub.unsubscribe();
    this.pedidosCompletadosSub.unsubscribe();
    this.pedidoService.resetLimiteConsulta();
  }

 
  crearPedido(){
    this.router.navigate(['/detalles']);
  }

  agregarGuia(){
    if(this.pedidoTemporal.isCambio){
      this.pedidoTemporal.cambios[0].guia = this.guiaTemporal;
    } else {
      this.pedidoTemporal.guia = this.guiaTemporal;
    }
    this.pedidoService.editarPedido(this.pedidoTemporal);
    this.guiaTemporal = "";
  }

  cambiarEstadoPedido(estado:number){
    if(estado == 5){
      //aqui hay que hacer la condicional para saber si el pedido es un cambio o no
      // y en base en eso revisar si el cambio ya tiene guia
      // caso contrario pedir la guia y guardarla en el cambio ademas de modificar el estado del cambio
      if(this.pedidoTemporal.isCambio){
        
        if(this.pedidoTemporal.cambios[0].guia == ""){
          $('#modal2').modal('open');  
          return;
        }
        this.pedidoTemporal.estado = 5;
        this.pedidoTemporal.completado = true;
        this.pedidoTemporal.cambios[0].completado = true;
        this.pedidoTemporal.cambios[0].fechaDespacho = new Date().getTime();
        this.pedidoService.editarPedido(this.pedidoTemporal);
        return;
      }
      if(this.pedidoTemporal.guia){
        this.pedidoTemporal.estado = estado;
        this.pedidoTemporal.completado = true;
        this.pedidoTemporal.fechaDespacho = new Date().getTime();
        this.pedidoService.editarPedido(this.pedidoTemporal);
        return;
      }else {
        $('#modal2').modal('open');  
        return;
      } 
    } else if(estado == 6){
      this.pedidoTemporal.estado = estado;
      this.pedidoService.editarPedido(this.pedidoTemporal);
      return; 
    }
    this.pedidoTemporal.estado = estado;
    this.pedidoTemporal.completado = false;
    this.pedidoService.editarPedido(this.pedidoTemporal);
  }

  verDetalles(idx:number, info){
    this.nombreVendedorTemporal = info.nombreVendedor;
    this.estadoPedidoTemporal = info.estado;
    this.totalPrendasTemporal = info.totalPrendas;
    /* this.pedidoTemporal = this.pedidos[idx];
    this.guiaTemporal = this.pedidos[idx].guia; */
    this.pedidoTemporal = info.pedido;
    this.guiaTemporal = info.pedido.guia;
    $('#modal1').modal('open');
    
  }

}
