import { Component, OnInit } from '@angular/core';
import { Prenda } from '../../models/prenda';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AngularFirestore } from 'angularfire2/firestore';
import { take, switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from "@angular/router";
import { Pedido } from '../../models/pedido';
import { Cambio } from '../../models/cambio';
import { PedidosService } from '../../services/pedidos.service';

declare var $:any;
declare var M:any;

@Component({
  selector: 'app-cambio',
  templateUrl: './cambio.component.html',
  styleUrls: ['./cambio.component.css']
})
export class CambioComponent implements OnInit {

  prendas:Prenda[] = [];

  referencias:any[] = [];

  formulario_1:FormGroup;
  formulario_2:FormGroup;

  pagina:number =  1;
  
  pedido:Pedido;

  constructor(private ps:PedidosService, private db:AngularFirestore, private router:Router, private activeRouter:ActivatedRoute) { 

    this.activeRouter.params.pipe(switchMap((params:any) =>{
      return this.db.collection('pedidos').doc(params.id).valueChanges();
    })).subscribe((pedido:any)=>{
      this.pedido = pedido;
      console.log(this.pedido);
      if(!pedido){
        this.router.navigate(['/mispedidos']);
      }
    })

    this.db.collection('prendas').valueChanges().pipe(take(1)).subscribe((prendas:any) =>{
      let datos = {}
      this.referencias = prendas;
      for(let prenda of prendas){
        datos[prenda.nombre] = prenda.imagen;
      }
      $('input.autocomplete').autocomplete({
        data: datos
      });
    });
    
    $(document).ready(function(){
      $('.collapsible').collapsible();
      $('select').formSelect();
    });

    this.formulario_1 = new FormGroup({
      nombre: new FormControl('', Validators.required),
      talla: new FormControl('', Validators.required),
      color: new FormControl('', Validators.required),
      cantidad: new FormControl('', Validators.required)
    });

    this.formulario_2 = new FormGroup({
      valor: new FormControl(''),
      motivo: new FormControl('', Validators.required)
    });


  }


  ngOnInit() {
  }


  agregarPrenda(nombrePrenda:string){
    if(!this.formulario_1.valid){
      // faltan campos por rellenar
      console.log("rellee todos los datos!");
      return;
    }

    let nombre =  nombrePrenda;
    let talla = this.formulario_1.controls.talla.value;
    let color = this.formulario_1.controls.color.value;
    let cantidad =  this.formulario_1.controls.cantidad.value;
    let temp = this.getMoreInfo(nombre);
    let sku:string = temp.sku;
    let imagen:string = temp.imagen;
    
    if(!sku){
      //prenda no existe
      console.log("Prenda no existe");
      this.formulario_1.reset();
      return;
    }
    
    let prenda_temp:Prenda = new Prenda(nombre, sku, imagen);
    prenda_temp.cantidad = cantidad;
    prenda_temp.talla = talla;
    prenda_temp.color = color;
    this.formulario_1.reset();
    this.prendas.push(prenda_temp);
  }

  borrarPrenda(idx:number){
    this.prendas.splice(idx,1);
  }

  cambiarPagina(pagina:number){
    this.pagina = pagina;
    setTimeout(()=>{
      $('select').formSelect();
    },300)
  }

  getMoreInfo(nombre:string){
    for(let prenda of this.referencias){
      if(nombre.toLocaleUpperCase().trim() === prenda.nombre.toLocaleUpperCase().trim()){
        return { sku: prenda.sku, imagen: prenda.imagen };
      }
    }
    return { sku: null, imagen: null };
  }


  guardarCambio(){
    this.cambiarPagina(1);
    this.formulario_2.reset();
    let valor = this.formulario_2.controls.valor.value;
    let cambio:Cambio =  new Cambio(new Date().getTime(), this.prendas, this.formulario_2.controls.motivo.value);
    if(valor){
      cambio.valor = valor;
    }
    this.pedido.isCambio = true;
    this.pedido.estado = 1;
    this.pedido.fecha = cambio.fechaCambio;
    this.pedido.completado = false;
    this.pedido.cambios.unshift(cambio);
    this.ps.editarPedido(this.pedido);
  }


}
