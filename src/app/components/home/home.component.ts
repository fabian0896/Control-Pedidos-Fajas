import { Component, OnInit, OnDestroy } from '@angular/core';
import { EstadistcasService } from '../../services/estadistcas.service';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { PedidosService } from '../../services/pedidos.service';
import { shareReplay, switchMap } from 'rxjs/operators';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit,OnDestroy {

  datosDiasSub:Subscription;
  datosMesesSub:Subscription;
  datosDias:any;
  datosMeses:any;

  pedidosPendientes:Observable<any>;
  cambiosPendientes: Observable<any>;

  emoji:string = "";

  indice:number = 2;

  mes:BehaviorSubject<number> = new BehaviorSubject<number>(2);

  mesActual:string = '';
  porcentaje:number = 0;

  meses:string[] = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
  'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  
  constructor(private estadisticas:EstadistcasService, private ps:PedidosService) {
    
    this.mes.subscribe(idx =>{
      this.indice = idx;
      if(this.datosMeses){
        this.porcentaje = this.calcularPorcentaje(this.indice);
      } 
    });
    
    this.datosMesesSub = this.estadisticas.getEstadisticasMeses(new Date()).subscribe((data)=>{
      this.datosMeses = data;
      this.porcentaje = this.calcularPorcentaje(this.indice);
      this.emoji = this.calcularEmogi(this.porcentaje);
    });  
    
    this.datosDiasSub = this.estadisticas.getEstadisticasSemana(new Date()).subscribe((data)=>{
        this.datosDias = data;
      });

      this.pedidosPendientes = this.ps.getVentasPendientes(5).pipe(shareReplay(1));
     this.cambiosPendientes = this.ps.getCambiosPendientes().pipe(shareReplay(1));

   }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.datosMesesSub.unsubscribe();
    this.datosDiasSub.unsubscribe();
  }

  calcularPorcentaje(idx:number){
    let mes_actual = this.datosMeses.meses[idx];
    this.mesActual = this.meses[mes_actual - 1];
    let datos:{ventas:number, devoluciones:number} = this.datosMeses.datos[idx];
    if( (datos.ventas + datos.devoluciones) < 10 ){
      return null;
    }
    return (datos.ventas * 100)/ (datos.ventas + datos.devoluciones);
  }

  calcularEmogi(porcent:number){
      if(porcent > 90){
        return 'em-clap'
      }  
      else if(porcent < 50){
        return 'em--1'
      } else if (porcent < 60 ){
        return 'em-cry'
      } else if( porcent < 70){
        return ' em-anguished'
      } else if (porcent < 80){
        return 'em-face_with_raised_eyebrow'
      } else if( porcent <= 90){
        return 'em---1'
      }
  }

  cambiarMes(op:string){
    if(op == "+" && this.indice < 2 ){
      this.indice++;
      this.mes.next(this.indice);
    } else if(op == "-" && this.indice > 0){
      this.indice--;
      this.mes.next(this.indice);
    }
  }

}
