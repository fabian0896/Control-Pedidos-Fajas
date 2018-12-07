import { AngularFirestore } from 'angularfire2/firestore';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { Subscription, Observable } from 'rxjs';
import { Pedido } from '../../models/pedido';
import { map, take } from 'rxjs/operators';
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
  nombreUsuarios:Object = {};

  constructor(private ps: PedidosService, private bd:AngularFirestore) { 

    this.bd.collection('usuarios').valueChanges().subscribe((users:any[])=>{
      users.forEach((user)=>{
        this.nombreUsuarios[user.uid] = user.nombre;
      });
    });

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

  getVendedor(vendedorId:string){
    /* return this.bd.collection('usuarios', ref => ref.where('uid','==', vendedorId)).valueChanges()
                  .pipe(map((vendedor:any)=>{
                    console.log(vendedor);
                    return vendedor[0].nombre;
                  })); */
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
