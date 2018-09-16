import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-grafica',
  templateUrl: './grafica.component.html',
  styleUrls: ['./grafica.component.css']
})
export class GraficaComponent implements OnInit, OnChanges {

  @Input() tipo:string = 'bar';
  @Input() datos:Estadisticas;

  public barChartLabels:string[] = [];
  public barChartLegend:boolean = true;
 
  public barChartData:any[] = [
    /* {data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A'},
    {data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B'} */
  ];

  public barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      yAxes: [{
          ticks: {
              beginAtZero:true,
              stepSize: 1
          }
      }],
      
  }
  };
  
  constructor(){
    
  }

  setDataDias(tipo:string){
    let arregloTempVentas:any[] = [];
    let arregloTempDevoluciones:any[] = [];
    this.barChartLabels = this.datos[tipo];
    for(let dato of this.datos.datos){
      arregloTempVentas.push(dato.ventas);
    }
    for(let dato of this.datos.datos){
      arregloTempDevoluciones.push(dato.devoluciones);
    }
    this.barChartData[1] = {data: arregloTempVentas, label: "Ventas"};
    this.barChartData[0] = {data: arregloTempDevoluciones, label: "Devoluciones"}; 
  }


  ngOnChanges(){
    if(this.datos){
      this.setDataDias(this.datos.type);
    }
  }

  ngOnInit(){

  }
  




}





interface Estadisticas {
  type:string;
  datos: any;
  dias?:any;
  meses?:any;
}
