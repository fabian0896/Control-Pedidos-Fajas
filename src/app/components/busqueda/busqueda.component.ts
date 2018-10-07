import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AgoliaService } from '../../services/agolia.service';
import { combineLatest, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Pedido } from '../../models/pedido';
import { PedidosService } from '../../services/pedidos.service';
import { PermisosService } from '../../services/permisos.service';
declare var $:any;

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent implements OnInit {

  query:string = "";

  sub = new Subject<any>();

  observables:any[]

  pedidos:Pedido[];
  permiso:Promise<any>;
  pedidoTemporal;
  guiaTemporal:string = "";
  nombreVendedorTemporal;
  totalPrendasTemporal;
  estadoPedidoTemporal

  constructor(private permisosServices:PermisosService ,private db:AngularFirestore, private algolia:AgoliaService, private pedidoService:PedidosService ) {

    this.permiso = this.permisosServices.getPermisos();

    $(document).ready(function(){
      $('.modal').modal();
    });

    this.sub.pipe(switchMap(termino=>{
      return combineLatest(termino);
    })).subscribe((data:any) => {
      //console.log(data);
      this.pedidos = data;
    });
  
  }

  ngOnInit() {
  }

  crearObservables(datos:any[]){
    this.observables = [];
    for(let x of datos){
      let doc_id:string = x.id;
      this.observables.push(this.db.collection('pedidos').doc(doc_id).valueChanges());
    }
  }

  buscar(){
    if(this.query == ""){
      this.pedidos = [];
      return;
    }
    this.algolia.buscar(this.query).then((content)=>{
      //console.log(content.hits);
      this.crearObservables(content.hits);
      this.sub.next(this.observables);
    });
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

}
