import { Component, OnInit, OnDestroy, DoCheck, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido';
import { Subscription } from 'rxjs';
import { Prenda } from '../../models/prenda';
import { AngularFireAuth } from 'angularfire2/auth';
import { PermisosService } from '../../services/permisos.service';
declare var $:any;
declare var M:any;



@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css']
})
export class MisPedidosComponent implements OnInit, OnDestroy, OnChanges {

  pedidos:Pedido[] = [];
  pedidosCompletados:Pedido[];
  pedidosPendientes:Pedido[];


  //Variables para el Modal
  pedidoTemporal:Pedido;
  nombreVendedorTemporal:string;
  estadoPedidoTemporal:string;
  totalPrendasTemporal:string;
  guiaTemporal:string = "";

  nombreUsuario:string = "";

  permiso:Promise<any>

  todosLosPedidosSub:Subscription;
  pedidosPendientesSub: Subscription;
  pedidosCompletadosSub: Subscription;
  authSub:Subscription;

  mostrarVerMasCompletados: boolean = true;
  mostrarVerMasTodos: boolean = true;

  constructor(private permisosServices:PermisosService ,private router:Router, private pedidoService: PedidosService, private auth: AngularFireAuth) {
    
    this.permiso = this.permisosServices.getPermisos();
    
    $(document).ready(function(){
      $('.tabs').tabs();
      $('.modal').modal();
     
    });

    this.authSub = this.auth.authState.subscribe(usuario => {
      if(usuario){
        this.nombreUsuario = usuario.displayName;
      }
    });

    this.todosLosPedidosSub = pedidoService.getMisPedidos().subscribe((data:Pedido[]) => {
      this.pedidos = data;
    });

    this.pedidosPendientesSub = pedidoService.getPendientesMisPedidos().subscribe((data:any) => {
      this.pedidosPendientes = data
    });

    this.pedidosCompletadosSub = pedidoService.getCompletadosMisPedidos().subscribe((data:any) => {
      this.pedidosCompletados = data
    });
   }

   ngOnInit() {
  }

  ngOnChanges(){
  }

  ngOnDestroy(){
    this.pedidosPendientesSub.unsubscribe();
    this.todosLosPedidosSub.unsubscribe();
    this.pedidosCompletadosSub.unsubscribe();
    this.authSub.unsubscribe();
    this.pedidoService.resetLimiteConsulta();
  }

  mostrarMasTodos(){
    this.todosLosPedidosSub.unsubscribe();
    this.pedidoService.aumentarLimiteConsultaMisPedidosTodos();
    this.todosLosPedidosSub = this.pedidoService.getMisPedidos().subscribe((data:Pedido[]) => {
      if(this.pedidos.length == data.length ){
        this.mostrarVerMasTodos = false;
      }
      this.pedidos = data;
    });
  }

  mostrarMasCompletados(){
    this.pedidosCompletadosSub.unsubscribe();
    this.pedidoService.aumentarLimiteConsultaMisPedidosCompletados();
    this.pedidosCompletadosSub = this.pedidoService.getCompletadosMisPedidos().subscribe((data:any) => {
      if(this.pedidosCompletados.length == data.length ){
        this.mostrarVerMasCompletados = false;
      }
      this.pedidosCompletados = data
    });
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
    this.pedidoTemporal.conGuia = true;
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
    //this.guiaTemporal = info.pedido.guia;
    $('#modal1').modal('open');
    
  }

  goToCambio(){
    this.router.navigate(['/cambio', this.pedidoTemporal.id, 'mispedidos']);
  }

}
