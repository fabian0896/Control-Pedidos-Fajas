import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { switchMap, map, tap, shareReplay } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
      let numero: number = 0;
      if(data[0].cargo == 'administrador'){
        numero = 4;
      } else if(data[0].cargo == 'vendedor'){
        numero = 3;
      } else if(data[0].cargo == 'facturacion'){
        numero = 2;
      } else if(data[0].cargo == 'observador'){
        numero = 1;
      }
      return numero;
    }));
  }


}
