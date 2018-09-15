import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Pedido } from '../models/pedido';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';

declare var algoliasearch: any;

@Injectable({
  providedIn: 'root'
})
export class AgoliaService {

client;
index;

  constructor( private db:AngularFirestore) {
    this.client = algoliasearch(environment.algolia.appId, environment.algolia.apikey);
    this.index = this.client.initIndex('pedidos');
    
   /*  this.index.search({
      query: 'c'
      }).then(content => console.log(content)); */
    
     /*  this.index.addObjects([{
        nombre:'fabian David',
        apellido: 'dueñas'
      }],(err, content)=>{
        console.log(content);
      }); */
    
    }

    buscar(query:string): Promise<any>{
      return this.index.search({
        query: query
      });
    }


    guardarNuevo(pedido:Pedido){ 
      let promesa = new Promise((resolve, rejct)=>{
        this.index.addObjects([{
          nombre: pedido.nombre,
          ciudad: pedido.ciudad,
          telefono: pedido.telefono,
          nickname: pedido.observaciones,
          guia: pedido.guia,
          id: pedido.id
        }], (err, content)=>{
          resolve(content.objectIDs[0]);
        });
      });
      return promesa;
    }
      
    editar(pedido:Pedido){
      this.index.getObjects([pedido.algoliaId],(err, content)=>{
        let pedidoTemp = content.results[0];
        if(pedidoTemp.nombre.trim() == pedido.nombre.trim() && 
           pedidoTemp.ciudad.trim() == pedido.ciudad.trim() && 
           pedidoTemp.guia.trim() == pedido.guia.trim() &&
           pedidoTemp.nickname.trim() == pedido.observaciones.trim() &&
           pedidoTemp.telefono.trim() == pedido.telefono.trim()){
            return;
           } else {
            this.index.saveObject({
              objectID: pedido.algoliaId,
              nombre: pedido.nombre,
              ciudad: pedido.ciudad,
              telefono: pedido.telefono,
              nickname: pedido.observaciones,
              guia: pedido.guia,
              id: pedido.id
            });
           }
      });
    }


    borrar(pedido:Pedido){
      this.index.deleteObjects([pedido.algoliaId]);
    }
   

}
