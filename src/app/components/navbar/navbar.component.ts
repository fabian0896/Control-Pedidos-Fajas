import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PedidosService } from '../../services/pedidos.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';
import { PermisosService } from '../../services/permisos.service';
declare var $: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  usuarioOb: Observable<any>;
  fotoUrl: string;
  usuario;

  cargo:Observable<string>;
  permiso:Promise<any>;

  guiasP:number;
  facturasP : number;
  prendasP: number = 0;;
  pedidosP: number;

  guiasSub: Subscription;
  facturasSub:Subscription;
  prendasSub:Subscription;

  constructor(public afAuth: AngularFireAuth, 
              public router: Router, 
              private ps:PedidosService, 
              private db:AngularFirestore,
              private permisos: PermisosService) { 
    $(document).ready(function(){
      $('.sidenav').sidenav();
      $('.collapsible').collapsible();
    });
   
    


    this.usuarioOb = afAuth.authState; 
    
    this.usuarioOb.subscribe(data => {
      this.usuario = data;
      
      if(data){
       
        this.permiso = this.permisos.getPermisos();


        this.guiasSub =  this.ps.getMisPedidosGuiasPendientesV2().subscribe(data =>{
          if(data){
            this.guiasP = data.length;
            //console.log(this.guiasP);
          }  
        });

        this.prendasSub = this.ps.getPendientesMisPedidos().subscribe((data:any) =>{ 
          if(data){
            this.pedidosP = data.length;
            this.prendasP = 0;
            for(let pedido of data){
              if(pedido.isCambio){
                for(let prenda of pedido.cambios[0].prendas){
                  if(prenda.estado <= 1 ){
                    this.prendasP += prenda.cantidad;
                  }
                }
              }else{
                for(let prenda of pedido.prendas){
                  if(prenda.estado <= 1 ){
                    this.prendasP += prenda.cantidad;
                  }
                }
              }
            }
            //console.log(this.prendasP);   
        }
        });


        this.facturasSub = this.ps.getPedidosFacturasPendientes().subscribe(data =>{
          if(data){
            this.facturasP = data.length;
            //console.log(this.facturasP);
          }  
        });


       this.cargo = this.db.collection('usuarios', ref => ref.where('uid','==',data.uid)).valueChanges().pipe(map((reg:any) => {           
        if(reg.length > 0){
            return reg[0].cargo;
          } else {
            return null;
          }
        }));

      }

    });
    
  }

  ngOnDestroy(){
    this.prendasSub.unsubscribe();
    this.facturasSub.unsubscribe();
    this.guiasSub.unsubscribe();
  }

  ngOnInit() {
  }

  abrirMenu(){
    $('.sidenav').sidenav('open');
  }

  salir(){
    sessionStorage.clear();
    this.prendasSub.unsubscribe();
    this.facturasSub.unsubscribe();
    this.guiasSub.unsubscribe();
    this.usuario = null;
    this.permiso = null;
    this.afAuth.auth.signOut();
    this.router.navigate(['/login']);
  }

}
