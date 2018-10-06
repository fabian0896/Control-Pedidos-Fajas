import { Component, OnInit, OnDestroy } from '@angular/core';
import { Prenda } from '../../models/prenda';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AngularFirestore } from 'angularfire2/firestore';
import { take, switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from "@angular/router";
import { Pedido } from '../../models/pedido';
import { Cambio } from '../../models/cambio';
import { PedidosService } from '../../services/pedidos.service';
import { Subscription } from 'rxjs';
import { PermisosService } from '../../services/permisos.service';

declare var $:any;
declare var M:any;

@Component({
  selector: 'app-cambio',
  templateUrl: './cambio.component.html',
  styleUrls: ['./cambio.component.css']
})
export class CambioComponent implements OnInit, OnDestroy {

  prendas:Prenda[] = [];

  referencias:any[] = [];

  formulario_1:FormGroup;
  formulario_2:FormGroup;

  pagina:number =  1;

  permitirCambio:boolean = false;
  ruta:string = "mispedidos";
  ultimoDespacho;
  sub:Subscription;
  pedido:Pedido;
  permiso:Promise<number>;
  idx:number = 0;

  constructor(private permisoService:PermisosService ,private ps:PedidosService, private db:AngularFirestore, private router:Router, private activeRouter:ActivatedRoute) { 

    this.permiso = this.permisoService.getPermisos();

    this.sub =  this.activeRouter.params.pipe(take(1),switchMap((params:any) =>{
      this.ruta = params.ruta;
      return this.db.collection('pedidos').doc(params.id).valueChanges();
    })).subscribe((pedido:any)=>{
      this.pedido = pedido;
      this.ultimoDespacho = this.calcularUltimaFechaDespacho(this.pedido);

      this.idx = this.calcularUltimoDespacho();

      if(this.pedido.isCambio){
        if(this.pedido.cambios[0].completado){
          this.permitirCambio = true;
        } else {
          this.permitirCambio = false;
        }
      } else {
        this.permitirCambio = true;
      }

      if(!pedido){
        this.router.navigate(['/mispedidos']);
      }

      setTimeout(()=>{
        $('.collapsible').collapsible();
        $('select').formSelect();
      }, 200);
      
    });
    
    //--------------
    
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
    
    //---------------

    $(document).ready(function(){
      $('.collapsible').collapsible();
      $('select').formSelect();
      $('.fixed-action-btn').floatingActionButton();
    });


    this.formulario_1 = new FormGroup({
      nombre: new FormControl('', Validators.required),
      talla: new FormControl('', Validators.required),
      color: new FormControl('', Validators.required),
      cantidad: new FormControl('', Validators.required)
    });

    this.formulario_2 = new FormGroup({
      valor: new FormControl('0'),
      motivo: new FormControl('', Validators.required),
      flete: new FormControl(''),
    });


  }

  ngOnDestroy(){
    this.sub.unsubscribe();
  }

  ngOnInit() {
  }

  calcularUltimaFechaDespacho(pedido:Pedido){
    if(pedido.isCambio){
      for(let i in pedido.cambios){
        if(pedido.cambios[i].completado){
          return pedido.cambios[i].fechaDespacho;
        }
      }
      return pedido.fechaDespacho; 
    } else {
      return pedido.fechaDespacho;
    }
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
    prenda_temp.valor = "0";
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
    let valor = this.formulario_2.controls.valor.value;
    let cambio:Cambio =  new Cambio(new Date().getTime(), this.prendas, this.formulario_2.controls.motivo.value);
    cambio.cancelaFlete = this.formulario_2.controls.flete.value;
    if(valor){
      cambio.valor = valor;
    }
    
    this.pedido.isCambio = true;
    this.pedido.estado = 1;
    this.pedido.fecha = cambio.fechaCambio;
    this.pedido.completado = false;
    this.pedido.conGuia = false;
    this.pedido.cambios.unshift(cambio);
    this.ps.editarPedido(this.pedido);
    this.formulario_2.reset();
  }


  goBack(){
    this.router.navigate([this.ruta]);
  }



  calcularUltimoDespacho(){
    if(this.pedido.isCambio){
      for(let i in this.pedido.cambios){
        if(this.pedido.cambios[i].completado){
          return parseInt(i);
        }
      }
      return null; // ningun cambio esta completado;
    } else {
      return null;
    }
  }


}
