import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { Prenda } from '../../models/prenda';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido';
import { Router,ActivatedRoute } from '@angular/router';
declare var $:any;
declare var M:any;

@Component({
  selector: 'app-detalles-pedido',
  templateUrl: './detalles-pedido.component.html',
  styleUrls: ['./detalles-pedido.component.css']
})
export class DetallesPedidoComponent implements OnInit, OnDestroy {

  datos: Observable<any>;

  autocompletado: Object = {};
  resultadosDB:any[] = [];

  nombre: string = "";
  telefono: string = "";
  medio: string = "";
  ciudad: string = "";
  direccion:string = "";

  factura:string = "";
  guia:string = "";

  prendas:Prenda[] = []

  talla:string;
  valor: string;
  cantidad: string = "1";
  color:string;

  estado: number;


  observaciones: string = "";
  pago:string = "";

  x:string = "";

  isEdicion:boolean = false;

  valorTotal:number = 0;
  
  pedido:Pedido;

  pedidoId:string;

  isDeleting:boolean = false;

  constructor(public activeRouter: ActivatedRoute,private router:Router,private afs: AngularFirestore, public pedidosService:PedidosService) { 
    
    activeRouter.params.subscribe(parametros => {
      //console.log(parametros.id);
      if(parametros.id){
        this.pedidoId = parametros.id;
        this.setData(parametros.id);
        this.isEdicion = true;
      }
    });

    $(document).ready(function(){
      $('select').formSelect();
      $('.fixed-action-btn').floatingActionButton();
    });
        
    this.datos = afs.collection('prendas').valueChanges();
    this.datos.subscribe(data =>{
      //console.log(data);
      this.resultadosDB = data;
      for(let item of data){
        this.autocompletado[item.nombre] = item.imagen;
      }
      $('input.autocomplete').autocomplete({
        data: this.autocompletado
      });
      //console.log(this.autocompletado);
    });
  }

  ngOnInit() {
    M.updateTextFields();
  }

  ngOnDestroy(){
    //console.log("destruido");
    this.datos = null;
  }


  private isChanged(){


    if(this.nombre != "" || 
       this.telefono != "" || 
       this.medio != "" || 
       this.ciudad != "" || 
       this.direccion != "" || 
       this.prendas.length != 0 || 
       this.observaciones != "" || 
       this.pago != ""){
      if(this.pedido){
        if(this.nombre.trim() == this.pedido.nombre && 
           this.telefono.trim() == this.pedido.telefono &&
           this.observaciones.trim() == this.pedido.observaciones &&
           this.ciudad.trim() == this.pedido.ciudad &&
           this.direccion.trim() == this.pedido.direccion &&
           this.prendas == this.pedido.prendas ){
            return false;
          } else {
            return true;
          }
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  crearPedido(){
    if(this.isEdicion && !this.isChanged()){
      this.router.navigate(['/pedidos']);
      return;
    }

    let mensaje:string;
    if(this.isEdicion){
      mensaje = "editar"
    } else {
      mensaje = "guardar"
    }
    if(!confirm(`seguro que desea ${ mensaje } el pedido?`)){
      return;
    }
    let pedidoNuevo:Pedido = new Pedido(this.nombre,this.telefono,this.ciudad,this.direccion ,this.prendas,this.medio,this.pago,this.observaciones,this.valorTotal, this.estado);
    if(this.isEdicion){
      pedidoNuevo.completado = this.pedido.completado;
      pedidoNuevo.factura = this.factura;
      pedidoNuevo.guia = this.guia;
      pedidoNuevo.id = this.pedido.id;
      pedidoNuevo.vendedor = this.pedido.vendedor;
      pedidoNuevo.algoliaId = this.pedido.algoliaId;
      this.pedidosService.editarPedido(pedidoNuevo);
      console.log("se Actualizo");
    } else{
      this.pedidosService.guardarPedido(pedidoNuevo);
    }
    
    
    this.router.navigate(['/pedidos']);
  }


  borrarPedido(){
    if(!confirm(`Esta seguro que desea eliminar el pedido de ${ this.pedido.nombre }`)){
      return;
    }
    this.isDeleting = true;
    this.router.navigate(['/pedidos']);
    this.pedidosService.borrarPedido(this.pedidoId);
  }


  crearPrenda(nombre_prenda:string){

    if(!(nombre_prenda && this.talla && this.color && this.valor && this.cantidad)){
      M.toast({html: 'Para agragar una prenda son necesarios todos los valores'});
      return;
    }

 
    let temp: Prenda;
    for(let item of this.resultadosDB){
      if(item.nombre.toLowerCase() == nombre_prenda.toLowerCase() ){
        temp = new Prenda(nombre_prenda,item.sku,item.imagen);
        temp.color = this.color;
        temp.talla = this.talla;
        temp.valor = this.valor;
        temp.cantidad = parseInt(this.cantidad);
        break;
      }
    }
    this.prendas.push(temp);
    //console.log(temp);
    
    this.calcularValorTotal();                  

    this.talla = "";
    this.valor = "";
    this.cantidad = "1";
    this.color = "";
    this.x = "";
    M.updateTextFields();
  }


  private calcularValorTotal(){
    this.valorTotal = 0;
    for(let prenda of this.prendas){
      this.valorTotal = this.valorTotal + (parseInt(prenda.valor) * prenda.cantidad ) ;
    }
  }


  borrarPrenda(idx:number){
    this.prendas.splice(idx,1);
    this.calcularValorTotal();
  }

  cancelarCreacion(){
    if(!this.isChanged()){
      this.router.navigate(['/pedidos']);
      return;
    }
    let mensaje: string;
    if(this.isEdicion){
      mensaje = "edicion"
    } else {
      mensaje = "creacion"
    }
    if(!confirm(`seguro que desea cancelar la ${ mensaje } del pedido?`)){
      return;
    }
    this.router.navigate(['/pedidos']);
  }


  setData(id:string){
    this.afs.collection('pedidos', ref => ref.where('id','==', id )).valueChanges().subscribe((pedidos:Pedido[])=>{
      if(pedidos.length == 0 ){
        if(this.isDeleting){
          return;
        }
        this.router.navigate(['/detalles']);
        return;
      }

      let pedido:Pedido;
      pedido = pedidos[0];
      this.pedido = pedidos[0];
      
      this.guia = pedido.guia;
      this.factura = pedido.factura;
      this.estado = pedido.estado;
      this.nombre = pedido.nombre;
      this.telefono = pedido.telefono;
      this.medio = pedido.medioVenta;
      this.pago = pedido.medioPago;
      this.observaciones = pedido.observaciones;
      this.ciudad = pedido.ciudad;
      this.direccion = pedido.direccion;
      this.prendas = pedido.prendas;
      this.valorTotal = pedido.valorTotal;
      M.updateTextFields();
    });
  }

}
