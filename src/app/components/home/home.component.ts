import { Component, OnInit, OnDestroy } from '@angular/core';
import { EstadistcasService } from '../../services/estadistcas.service';
import { Observable, Subscription } from 'rxjs';

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
  constructor(private estadisticas:EstadistcasService) {
    
    this.datosMesesSub = this.estadisticas.getEstadisticasMeses(new Date()).subscribe((data)=>{
      this.datosMeses = data;
    });  
    
    this.datosDiasSub = this.estadisticas.getEstadisticasSemana(new Date()).subscribe((data)=>{
        this.datosDias = data;
      });
   }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.datosMesesSub.unsubscribe();
    this.datosDiasSub.unsubscribe();
  }

}
