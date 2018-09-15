import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class EstadistcasService {


  constructor(private db: AngularFirestore) {
    
  }

  getEstadisticasSemana(fecha:Date){
    //console.log(fecha);
    let dia = fecha.getDate()
    let observables:Observable<any>[] = [];
    let temp:any[] = [];
    let dias:any[] = [];
    let porDefecto = { ventas: 0, devoluciones: 0 };

    if(fecha.getDate() < 5){
      observables[1] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear() }-${ fecha.getMonth() + 1 }`).valueChanges();
      observables[0] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear() }-${ fecha.getMonth() }`).valueChanges();
    } else {
      observables[0] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear() }-${ fecha.getMonth() + 1 }`).valueChanges();
    }

     return combineLatest(observables).pipe(map(resultados =>{
      //console.log(resultados);
      
      if(resultados.length == 2){
       
        let diaInicio:any = 0;
       let totalDiasMes:number = 0;
       
       if(fecha.getMonth() > 0){
         totalDiasMes = new Date(fecha.getFullYear(), fecha.getMonth() , 0).getDate();
         diaInicio = totalDiasMes - (4 - dia);
       } else {
         totalDiasMes = new Date(fecha.getFullYear() - 1, 12 , 0).getDate(); // si el mes es enero, el anterior mes va a ser diciembre del año anterior
         diaInicio = totalDiasMes - (4 - dia);
       }
       
       if(resultados[0]){
          for(let i = diaInicio; i <= totalDiasMes; i ++){
            if(resultados[0][i]){
              temp.push(resultados[0][i]);
            } else{
              temp.push(porDefecto);
            }
            dias.push(i);
          }      
       } else{
        for(let i = diaInicio; i <= totalDiasMes; i ++){
          temp.push(porDefecto);
          dias.push(i);
        }
       }


       if(resultados[1]){
        for(let i = 1; i <= dia; i++){
          if(resultados[1][i]){
            temp.push(resultados[1][i]);
          } else {
            temp.push(porDefecto);
          }
          dias.push(i);
        }
       } else{
        for(let i = 1; i <= dia; i ++){
          temp.push(porDefecto);
          dias.push(i);
        }
       }



      } else if(resultados.length == 0) {
        for(let i = (dia-4); i <= dia; i++ ){
          if(resultados[0][i]){
            temp.push(resultados[0][i]);
          } else{
            temp.push(porDefecto);
          }
          dias.push(i);
        }
      }

      //console.log({ dias: dias, datos: temp });
      return { dias: dias, datos: temp }

    }));

  }




}
