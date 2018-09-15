import { Component, OnInit } from '@angular/core';
import { EstadistcasService } from '../../services/estadistcas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private estadisticas:EstadistcasService) {
      this.estadisticas.getEstadisticasSemana(new Date()).subscribe(data=>{
        console.log(data);
      });

      this.estadisticas.getEstadisticasMeses(new Date()).subscribe(data => {
        console.log(data);
      });
   }

  ngOnInit() {
  }

  agregar(){
    
  }

}
