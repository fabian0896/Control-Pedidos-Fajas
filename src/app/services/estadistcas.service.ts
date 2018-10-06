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
      temp = [];
      dias = [];
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



      } else if(resultados.length == 1) {
        if(!resultados[0]){
          for(let i = 0; i < 5; i++){
            temp.push({ventas: 0, devoluciones: 0});
          }
        } else {
          for(let i = (dia-4); i <= dia; i++ ){
            if(resultados[0][i]){
              temp.push(resultados[0][i]);
            } else{
              temp.push(porDefecto);
            }
            dias.push(i);
          }
        }
        
      }

      //console.log({ dias: dias, datos: temp });
      return {type: "dias", dias: dias, datos: temp }

    }));

  }




  getEstadisticasMeses(fecha:Date){
    let obs:Observable<any>[] = [];
    let meses:any[] = [];

    if(fecha.getMonth() >= 2){
      obs[2] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear() }-${ fecha.getMonth() + 1 }`).valueChanges();
      obs[1] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear() }-${ fecha.getMonth() + 0 }`).valueChanges();
      obs[0] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear() }-${ fecha.getMonth() - 1 }`).valueChanges();
      meses.push(fecha.getMonth() - 1);
      meses.push(fecha.getMonth() - 0);
      meses.push(fecha.getMonth() + 1);
    }
    else{
      let diferencia = 2 - fecha.getMonth();
      console.log("entre al else")
      if(diferencia == 1){
        obs[0] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear() - 1  }-${ 12 }`).valueChanges(); 
        obs[1] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear()  }-${ 1 }`).valueChanges(); 
        obs[2] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear()  }-${ 2 }`).valueChanges();
        meses.push(12);
        meses.push(1);
        meses.push(2); 
      } else if(diferencia == 2){
        obs[0] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear() - 1  }-${ 11 }`).valueChanges(); 
        obs[1] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear() - 1  }-${ 12 }`).valueChanges(); 
        obs[2] = this.db.collection('estadisticas').doc(`${ fecha.getFullYear() }-${ 1 }`).valueChanges(); 
        meses.push(11);
        meses.push(12);
        meses.push(1); 
      }
      

    }


    return combineLatest(obs).pipe(map(respuesta =>{
      
      let resultado:any[] = [];
      let temp_ventas:number = 0;
      let temp_devoluciones:number = 0;
      let meses_temp:any[] = [];

      for(let x of meses){
        meses_temp.push(x);
      }

      for(let mes of respuesta){
        temp_devoluciones = 0;
        temp_ventas = 0;
        if(mes){
          for(let i=0; i < 32 ; i++){
            if(mes[i]){
              temp_ventas += mes[i].ventas;
              temp_devoluciones += mes[i].devoluciones;
            }
          }
        }
        resultado.push({ventas: temp_ventas, devoluciones: temp_devoluciones});
      }

      return {type: "meses" , datos: resultado, meses: meses_temp}
    }));
    




  }











}
