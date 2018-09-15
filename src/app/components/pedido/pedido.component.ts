import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Pedido } from '../../models/pedido';
import { Prenda } from '../../models/prenda';
import { Subscription } from 'rxjs';

declare var $:any;

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {

  @Input( 'pedido' ) pedido: Pedido;
  @Input() editable:boolean = true; 
 

  @Output() onDetalles = new EventEmitter();
  

  estadoPedido: string;


  totalPrendas: number = 0;

  color:string= " red lighten-5";

  nombreVendedor:string;

  suscripcion:Subscription;

  constructor(private afs: AngularFirestore) { 
    
  }

  ngOnInit() {
    if(this.pedido){

      this.obtenerNombreVendedor();
      this.calcularEstado(this.pedido.estado);
      this.calcularTotalPrendas(this.pedido);

    }
  }

  calcularTotalPrendas(pedido:Pedido){
      let prendas:Prenda[] = pedido.prendas;
      for(let prenda of prendas){
        this.totalPrendas = this.totalPrendas + prenda.cantidad;
      }
  }

  obtenerNombreVendedor(){
    this.suscripcion = this.afs.collection('usuarios', ref => ref.where('uid','==', this.pedido.vendedor)).valueChanges().subscribe((usuario:any)=>{
      this.nombreVendedor = usuario[0].nombre;
      if(this.nombreVendedor){
        this.suscripcion.unsubscribe();
      }
    });
  }


  calcularEstado(est:number){
    switch(est){
      case 0:
        this.estadoPedido = "Algunos datos penientes";
        this.color = "red lighten-5";
        break;
      case 1:
        this.estadoPedido = "Prendas Pendientes";
        this.color = "grey lighten-3";
        break; 
      case 2:
        this.estadoPedido = "Algunas prendas en produccion";
        this.color = "yellow lighten-4";
        break;
      case 3:
        this.estadoPedido = "Prendas Listas";
        this.color = "teal lighten-4";
        break;  
      case 4:
        this.estadoPedido = "Empacado";
        this.color = "purple lighten-4";
        break;
      case 5:
        this.estadoPedido = "Despachado";
        this.color = "light-green lighten-3";
        break;
      case 6:
        this.estadoPedido = "Devolución";
        this.color = "red lighten-2";
        break;            
    }
  }


  verDetalles(){
    this.onDetalles.emit({
      nombreVendedor: this.nombreVendedor,
      estado: this.estadoPedido,
      totalPrendas: this.totalPrendas,
      pedido: this.pedido
    });
  }


}
