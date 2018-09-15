import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { switchMap, map, tap, shareReplay } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  constructor( private auth:AngularFireAuth, private db:AngularFirestore) { }


  getPermisos(){
    return this.auth.authState.pipe(switchMap(usuario =>{
      return this.db.collection('usuarios', ref => ref.where('uid','==', usuario.uid)).valueChanges();
    })).pipe(tap(()=>{
      console.log("consulta");
    }),shareReplay(1),map((data:any) =>{
      return this.determinarCargo(data[0].cargo);
    }));
  }



  determinarCargo(cargo:string){
    let numero: number = 0;
      if(cargo == 'administrador'){
        numero = 4;
      } else if(cargo == 'vendedor'){
        numero = 3;
      } else if(cargo == 'facturacion'){
        numero = 2;
      } else if(cargo == 'observador'){
        numero = 1;
      }
      return numero;
  }




}
