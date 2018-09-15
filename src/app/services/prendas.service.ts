import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { finalize, map } from 'rxjs/operators';
import { Prenda } from '../models/prenda';
import { Observable} from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';




@Injectable({
  providedIn: 'root'
})
export class PrendasService {

  CARPETA="prendas";
  private itemsCollection: AngularFirestoreCollection<Prenda>;
  downloadURL: Observable<string>;

  constructor(private afs: AngularFirestore,private storage: AngularFireStorage, private auth: AngularFireAuth) {
    
   }


  private guardarEnDB(prenda: Prenda){
    prenda.prenda_id = this.afs.createId();
    this.afs.collection(this.CARPETA).doc(prenda.prenda_id).set({prenda_id: prenda.prenda_id,nombre: prenda.nombre.toUpperCase(),sku: prenda.sku,imagen: prenda.imagen, fullPath: prenda.fullPath});
    //this.afs.collection(this.CARPETA).add({nombre: prenda.nombre,sku: prenda.referencia,imagen: prenda.imagen, fullPath: prenda.fullPath});
  }


  subirPrenda(foto: File, nombre:string, referencia:string){
    return new Promise((resolve, reject)=>{
      //const filePath = this.CARPETA + "/" + foto.name;
      const filePath = this.CARPETA + "/" + this.afs.createId();
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath,foto)
      task.then(snapshot => {
        task.snapshotChanges().pipe(finalize(()=>{
        this.downloadURL = fileRef.getDownloadURL();
        //console.log("esta mierda ya cargo");
        this.downloadURL.subscribe(data=>{
          let prenda = new Prenda(nombre, referencia, data);
          prenda.fullPath = snapshot.metadata.fullPath;
          this.guardarEnDB(prenda);
          resolve();
        });
      })).subscribe();
    });
    });
    
  }


  borrarPrenda(prenda:Prenda){
    console.log("entro a borrar prenda");
    if(!prenda.fullPath){
      console.error("No se pudo ubicar la prenda!");
      return;
    }
    this.afs.collection(this.CARPETA).doc(prenda.prenda_id).delete().then(()=>{
      const ref = this.storage.ref(prenda.fullPath);
      ref.delete();
      console.log("se borro la prenda correctamente");
    });    
  }


  getPrendas(){
    this.itemsCollection = this.afs.collection<Prenda>(this.CARPETA);
    return this.itemsCollection.valueChanges();
    
  }

  private getPedidosPendientes(){
    return  this.afs.collection('pedidos', ref => ref.where('completado','==', false).orderBy('fechaVenta','desc')).valueChanges()
  }


  getPrendasPendientes(){
    let prendas:any[] = [];
    return this.getPedidosPendientes().pipe(map(pedidos =>{
      console.log();
      if(pedidos){
        for(let pedido of pedidos){
          prendas.push(pedido['prendas']);
        }
        return prendas;
      } else {
        return [];
      }
    }));
  }

  getPrendaBySku(sku:string){
    return this.afs.collection('prendas', ref => ref.where('sku','==',sku)).valueChanges();
  }

  editarPrenda(prenda:Prenda, nombre: string, sku:string){
    let documento:AngularFirestoreDocument = this.afs.collection('prendas').doc(prenda.prenda_id);
    documento.update({
      nombre: nombre.toUpperCase(),
      sku: sku
    });
  }


}
