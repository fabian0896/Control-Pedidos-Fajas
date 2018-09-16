import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { core } from '@angular/compiler';
import { Router } from '@angular/router';

declare var M: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  correo: string = "";
  password: string = "";
  nombre: string = "";
  codigo: string = "";

  registro:boolean = false;

  constructor(public lg: LoginService, public router:Router) { }

  ngOnInit() {
  }

  ingresar(){
    //console.log("ingresar");
    this.lg.ingresar(this.correo, this.password)
            .then(data => {
              //console.log(data);
              this.reset();
              this.router.navigate(['/home']);
            })
            .catch(err => {
              console.log(err);
              M.toast({html: "Error: verifique que el correo y/o la contraseña este correctos"});
              this.reset();
            });
    
  }

  registrar(){
    if(!this.registro){
      this.registro = true;
      return;
    }
    if(this.codigo == ''){
      M.toast({html: 'Ingresa codigo de registro'});
      return;
    }
    this.lg.registrarse(this.correo, this.password,this.codigo, this.nombre)
            .then(() => {
                this.ingresar();
            })
            .catch(err => {
              let mensaje:string;
              if(err.code){
                if(err.code == "auth/invalid-email"){
                  mensaje = "El correo no es valido, intenta con otro correo";
                } else if (err.code == "auth/email-already-in-use") {
                  mensaje = "el correo ya esta regitrado!"
                }
              } else {
                mensaje = err;
              }
              M.toast({html: mensaje});
            });
  }

  private reset(){
    this.nombre = "";
    this.correo = "";
    this.password = "";
  }

  cancelar(){
    this.reset();
    this.registro = false;
  }


}
