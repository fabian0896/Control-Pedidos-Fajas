import { Component, OnInit } from '@angular/core';
import { PrendasService } from '../../services/prendas.service';
import { Observable } from 'rxjs';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Prenda } from '../../models/prenda';
import { PermisosService } from '../../services/permisos.service';

declare var $:any;
declare var M:any;

@Component({
  selector: 'app-prendas',
  templateUrl: './prendas.component.html',
  styleUrls: ['./prendas.component.css']
})
export class PrendasComponent implements OnInit {

  prendas: Observable<Prenda[]>;

  nombre: string = "";
  referencia: string = "";
  imagen: String = "";
  ruta: string;

  vistaPrevia:any;

  archivo: File;

  editando:boolean = false;

  cargando: boolean = false;

  formulario: FormGroup;

  prendaTemporal:Prenda;


  permiso:Observable<number>;

  constructor(private ps:PrendasService, private permisos:PermisosService) { 
   
    this.permiso = this.permisos.getPermisos();

    this.prendas = ps.getPrendas();
    
  }

  alCerrar(){
    
  }

  ngOnInit() {
    this.formulario = new FormGroup({
      nombre: new FormControl('', Validators.required),
      sku: new FormControl('', Validators.required, this.comprobarSku.bind(this)),
      archivo: new FormControl('', Validators.required)
    });

    $(document).ready(function(){
      $('.fixed-action-btn').floatingActionButton();
      $('.modal').modal({
        dismissible: false
      });
    });

  }

  comprobaciones(){
    console.log(this.formulario);
    if(!this.formulario.valid){
      M.toast({html: 'es necesario llenar todos los campos'});
      this.reset();
      return;
    } else if( !this.archivo.type.startsWith("image") ){
      M.toast({html: 'Solo se aceptan imagenes. Intenta de nuevo'});
      this.reset();
      return;
    }
    this.agregarPrenda();
    this.nombre = "";
    this.referencia = "";
    this.ruta = "";
    $('.modal').modal("close");
    M.updateTextFields();
  }


  agregarPrenda(){
    this.cargando = true;
    this.ps.subirPrendaV2(this.archivo,this.formulario.value.nombre,this.formulario.value.sku).then(()=>{
      this.cargando = false;
      M.toast({html: 'La imagen se cargo correctamente'});
    }).catch(()=>{
      this.cargando = false;
      M.toast({html: 'se presento un error al cargar la imagen, intenta con otra ;)'});
    });
  }

  cancelar(){
    this.editando = false;
    this.nombre = "";
    this.referencia = "";
    this.ruta = "";
    this.vistaPrevia = "";
    this.formulario.reset();
  }

  openEditar(prenda){
    this.editando = true;
    this.prendaTemporal = prenda;
    this.formulario.setValue({
      nombre: prenda.nombre,
      sku: prenda.sku,
      archivo: null
    });
    this.vistaPrevia = prenda.imagen;
    $('.modal').modal("open");
  }

  guardarEditar(){ 
    let name = this.formulario.value.nombre;
    let ref = this.formulario.value.sku;
    this.ps.editarPrenda(this.prendaTemporal,name,ref);
    this.formulario.reset();
    $('.modal').modal("close");
    this.editando = false;
    this.vistaPrevia = "";
  }

  getArchivo(evento){
    this.archivo = evento.target.files[0];
    let reader = new FileReader();
    reader.onload = (e:any)=>{
      console.log(e.target);
      this.vistaPrevia = e.target.result;
    }
    reader.readAsDataURL(this.archivo);
  }


  borrarPrenda(prenda:Prenda){
    if(!confirm(`Esta seguro que desea eliminar ${ prenda.nombre } ?`)){
      return;
    }
    this.ps.borrarPrenda(prenda).then(mensaje =>{
      M.toast({html: mensaje});
    }).catch(err =>{
      M.toast({html: err});
    });
  }


  private reset(){
    this.referencia ="";
    this.nombre = "";
    this.archivo = null;
    this.ruta = "";
  }

  comprobarSku(control:FormControl){
    let promesa = new Promise((resolve,reject)=>{
      this.ps.getPrendaBySku(control.value).subscribe((data:any[]) => {
        if(data.length > 0){
          if(this.editando && data[0].sku == this.prendaTemporal.sku){
            resolve(null);
          } else {
            resolve({existe: true});
          }
        } else {
          
          resolve(null);
        }
      });
    });
    return promesa;
  }

  

}
