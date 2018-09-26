import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentSnapshot, DocumentChangeAction, QueryDocumentSnapshot } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Pedido } from '../models/pedido';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap, take } from "rxjs/operators";
import { AgoliaService } from './agolia.service';




@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  
  CARPETA = "pedidos"
  usuario_id:string = "";

  usuario:Observable<string>;


  

  limiteConsultaDefault: number = 10;
  
  limiteConsultaTodos: number = this.limiteConsultaDefault;
  limiteConsultaCompletadosTodos: number = this.limiteConsultaDefault;

  limiteConsultaMisPedidosTodos: number = this.limiteConsultaDefault;
  limiteConsultaMisPedidosCompletado: number = this.limiteConsultaDefault;

  

  constructor(private afs: AngularFirestore,public afAuth: AngularFireAuth, private algolia:AgoliaService) { 
    

  
  }

  

  
  guardarPedido(pedido:Pedido){
    let sub:Subscription;
    let id = this.afs.createId();
    pedido.id = id;
    sub = this.afAuth.authState.subscribe(usuario=>{
      pedido.vendedor = usuario.uid;
      pedido.fechaVenta = new Date().getTime();
      pedido.fecha = pedido.fechaVenta;
    // llamar a agolia
    this.algolia.guardarNuevo(pedido).then((agoliaId:string)=>{
      pedido.algoliaId = agoliaId;
      let x = JSON.stringify(pedido);
      let y = JSON.parse(x);
      this.afs.collection(this.CARPETA).doc(id).set(y);
      sub.unsubscribe();
    });
    });
  }

  editarPedido(pedido:Pedido){
    if(!pedido.id){
      return;
    }
    this.algolia.editar(pedido);
    this.afs.collection('pedidos').doc(pedido.id).valueChanges().pipe(take(1)).subscribe((pedidoAntiguo:any)=>{
      
      let doc: AngularFirestoreDocument;
      doc = this.afs.collection('pedidos').doc(pedido.id);
      doc.update(JSON.parse(JSON.stringify(pedido)));
    });
  }




  borrarPedido(id:string){
    let doc:AngularFirestoreDocument = this.afs.collection(this.CARPETA).doc(id)
    doc.valueChanges().subscribe((pedido:Pedido)=>{
      if(pedido){
        this.algolia.borrar(pedido);
        doc.delete();
      } 
    });
    
  }


  getTodos(){
    return this.afs.collection(this.CARPETA, ref => ref.orderBy('fecha','desc').limit(this.limiteConsultaTodos)).valueChanges();
  }

  getPendientesTodos(){
    return this.afs.collection(this.CARPETA, ref => ref.where('completado','==', false).orderBy('fecha','asc')).valueChanges();
  }

  getCompletadosTodos(){
    return this.afs.collection(this.CARPETA, ref => ref.where('completado','==', true).orderBy('fecha','desc').limit(this.limiteConsultaCompletadosTodos)).valueChanges();
  }

  getMisPedidos(){
    return this.afAuth.authState.pipe(switchMap(usuario => {
      return this.afs.collection(this.CARPETA, ref => ref.where('vendedor','==', usuario.uid ).orderBy('fecha',"desc").limit(this.limiteConsultaMisPedidosTodos)).valueChanges();
    }));
  }


  getCompletadosMisPedidos(){
    return this.afAuth.authState.pipe(switchMap(usuario => {
      return this.afs.collection(this.CARPETA, ref => ref.where('vendedor','==', usuario.uid ).where('completado','==', true).orderBy('fecha',"desc").limit(this.limiteConsultaMisPedidosCompletado)).valueChanges();
    }));
  }


  getPendientesMisPedidos(){
    return this.afAuth.authState.pipe(switchMap(usuario => {
      return this.afs.collection(this.CARPETA, ref => ref.where('vendedor','==', usuario.uid ).where('completado','==', false).orderBy('fecha','asc').limit(20)).valueChanges();
    }));
  }




  getPedidosGuiasPendientesTodos(){
    return this.afs.collection(this.CARPETA, ref => ref.where('completado','==', false).where('guia','==','').orderBy('fecha','asc')).valueChanges();
  }

  getPedidosGuiasPendientesTodosV2(){
    return this.afs.collection(this.CARPETA, ref => ref.where('conGuia','==', false ).orderBy('fecha','asc')).valueChanges();
  }

  getMisPedidosGuiasPendientes(){
    return this.afAuth.authState.pipe(switchMap(usuario => {
      return this.afs.collection(this.CARPETA, ref => ref.where('vendedor','==', usuario.uid ).where('completado','==', false).where('guia','==','').orderBy('fechaVenta','asc').limit(20)).valueChanges();
    }));
  }

  getMisPedidosGuiasPendientesV2(){
    return this.afAuth.authState.pipe(switchMap(usuario => {
      return this.afs.collection(this.CARPETA, ref => ref.where('vendedor','==', usuario.uid ).where('completado','==', false).where('conGuia','==', false).orderBy('fecha','asc').limit(20)).valueChanges();
    }));
  }



  getPedidosFacturasPendientes(){
    return this.afs.collection(this.CARPETA, ref => ref.where('factura','==','').orderBy('fechaVenta','asc')).valueChanges();
  }



  



  resetLimiteConsulta(){
    this.limiteConsultaTodos = this.limiteConsultaDefault;
    this.limiteConsultaCompletadosTodos = this.limiteConsultaDefault;
    this.limiteConsultaMisPedidosTodos = this.limiteConsultaDefault;
    this.limiteConsultaMisPedidosCompletado = this.limiteConsultaDefault;
  }

  aumentarLimeteConsulta(){
    this.limiteConsultaTodos += this.limiteConsultaDefault;
  }
  aumentarLimeteConsultaCompletadosTodos(){
    this.limiteConsultaCompletadosTodos += this.limiteConsultaDefault;
  }

  aumentarLimiteConsultaMisPedidosTodos(){
    this.limiteConsultaMisPedidosTodos += this.limiteConsultaDefault;
  }

  aumentarLimiteConsultaMisPedidosCompletados(){
    this.limiteConsultaMisPedidosCompletado += this.limiteConsultaDefault;
  }

  


}
