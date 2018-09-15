import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  

  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore, private storage:AngularFireStorage) { 
    
  }

  registrarse(email: string, password: string, codigo:string, nombre:string){
   let promesa = new Promise((resolve, reject)=>{
    let sub:Subscription = this.afs.collection('codigos', ref => ref.where('codigo','==', codigo)).valueChanges().subscribe((data:any) => {
      if(data.length == 0){
        reject("el codigo no existe");
        sub.unsubscribe();
      } else {
        let codigoRegistro = data[0].rol;
        this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(()=>{
          this.actualizarPerfil(nombre, codigoRegistro);
          resolve();
          sub.unsubscribe();
          this.afs.collection('codigos').doc(data[0].id).delete();
        }).catch(err => {
          reject(err);
          sub.unsubscribe();
        });
      }
    });
   });
   return promesa;
  }

  actualizarPerfil(name:string, rol:string){
    let user = this.afAuth.auth.currentUser;
    user.updateProfile({
      displayName: name,
      photoURL: "../../../assets/default.jpg",
    }).then(()=> {
      this.afs.collection('usuarios').add({
        nombre: user.displayName,
        uid: user.uid,
        cargo: rol
      });
    });  
  }

  cambiarInfoUsuario(name:string, foto?:File){
    
    let promesa = new Promise((resolve,reject)=>{
    let user = this.afAuth.auth.currentUser;
    let fotoPath:string = "";
    if(foto){
      this.subirFotoPerfil(foto).then(data=>{
        fotoPath = data;
        user.updateProfile({
          displayName: name,
          photoURL: fotoPath
        }).then(()=> {
          this.guardaEnDb(user.uid, name, fotoPath);
          resolve()
        });
      });
    }else {
      user.updateProfile({
        displayName: name,
        photoURL: user.photoURL
      }).then(()=> {
        this.guardaEnDb(user.uid, name, user.photoURL);
        resolve()
      });
    }
    });
    return promesa;
    
  }


  guardaEnDb(uid:string ,nombre?:string, url?:string){
    this.afs.collection('usuarios', ref => ref.where('uid','==',uid)).snapshotChanges().subscribe((data:any)=>{
      if(data){
        this.afs.collection('usuarios').doc(data[0].payload.doc.id).update({
          nombre: nombre,
          foto: url
        });
      }
    });
  }

  subirFotoPerfil(file:File){
    let promesa = new Promise<string>((resolve, reject)=>{
    let nombre_foto = this.afs.createId();
    const filePath = `imagen_perfil/${ nombre_foto }`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath,file);
    task.snapshotChanges().pipe(finalize(()=>{
      fileRef.getDownloadURL().subscribe(Url=>{
        console.log(Url);
        resolve(Url);
      });
    })).subscribe();
    });
    return promesa;
  }


  ingresar(email: string, password: string){
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
  }

  

  
}
