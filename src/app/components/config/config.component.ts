import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgForm } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';
import { PermisosService } from '../../services/permisos.service';

declare var $:any;
declare var M:any;

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit, OnDestroy {

  nombre_usuario:string;
  foto:File;
  vista_previa:string;
  usuario_actual;

  imagenCargada:boolean = false;

  subscription:Subscription;

  codigoRegistro:string = "";

  rol:string;

  generado:boolean = false;

  permiso:Observable<number>;

  constructor(private logIn:LoginService, private auth:AngularFireAuth, private db:AngularFirestore, private permisos:PermisosService) { 
    
    $(document).ready(function(){
      $('.collapsible').collapsible();
      $('select').formSelect();
    });

    this.permiso = this.permisos.getPermisos();

    this.subscription = this.auth.authState.subscribe(usuario=>{
      this.usuario_actual = usuario;
      this.nombre_usuario = usuario.displayName;
      this.vista_previa = usuario.photoURL;
    });


  }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }


  guardarCambios(forma:NgForm){
    if(!(forma.touched || this.imagenCargada)){
      console.log("No se detectaron Cambios");
      return;
    }

    if(this.imagenCargada){
        this.logIn.cambiarInfoUsuario(this.nombre_usuario, this.foto).then(()=>{
          this.imagenCargada = false;
          M.toast({html: 'Cambios Guardados!!'})
        });
    }
    else if(forma.touched){
      this.logIn.cambiarInfoUsuario(this.nombre_usuario).then(()=>{
        M.toast({html: 'Cambios Guardados!!'})
      });
    }

  }

  getImagen(evento){
    this.foto = evento.target.files[0];
    if(!this.foto.type.startsWith("image")){
      M.toast({html: 'Solo se permiten imagenes!!'})
      return
    }
    let reader = new FileReader();
    reader.onload = (e:any)=>{
      this.vista_previa = e.target.result;
    }
    reader.readAsDataURL(this.foto);
    this.imagenCargada = true;
  }

  reset(){
    this.generado = false;
    this.rol = "";
    setTimeout(()=>{$('select').formSelect();}, 50);
  }

  generarCodigo(){
    let codigo:string = "";
    for(let i = 0; i< 5; i++){
      codigo = codigo + this.randomNumber();
    }
    this.codigoRegistro = codigo;
    let id = this.db.createId();
    this.db.collection('codigos').doc(id).set({
      id: id,
      codigo: codigo,
      rol: this.rol
    });
    this.generado = true;
  }


  randomNumber(){
    let x = Math.random();
    x = x*10;
    x = Math.floor(x);
    return x;
  }

}
