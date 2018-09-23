import { Prenda } from "./prenda";
import { Cambio } from "./cambio";

export class Pedido{
    id:string;
    nombre: string; //*** 
    telefono: string; //*** 
    ciudad: string; //*** 
    prendas:Prenda[]; //*** 
    valorTotal: number; //*** 
    medioVenta:string; //**** 
    fechaVenta; //****
    estado: number; // 0=dalgunso datos pendientes, 1=Pendiente por despacho, 2 = algunas prendas produccion, 3 = empacado, 4 = despachado
    fechaDespacho;
    fecha;
    vendedor: string;
    guia: string;
    observaciones:string;
    medioPago: string;
    direccion: string;
    completado: boolean;
    factura:string;
    algoliaId:string;
    cambios:Cambio[];
    isCambio:boolean;
    constructor( nombre:string="", 
                 telefono:string="",
                 ciudad:string="",
                 direccion:string="", 
                 prendas:Prenda[]=[], 
                 medioVenta:string="",
                 medioPago:string="",
                 observaciones:string ="", 
                 valorTotal:number=0,
                 estado?:number){
        this.nombre = nombre;
        this.algoliaId = "";
        this.telefono = telefono;
        this.ciudad = ciudad;
        this.prendas = prendas;
        this.medioVenta = medioVenta;
        this.medioPago = medioPago;
        this.valorTotal = valorTotal;
        this.fechaDespacho = null;
        this.guia = "";
        this.observaciones = observaciones;
        this.direccion = direccion;
        this.id="";
        this.completado = false;
        this.factura = "";
        this.isCambio = false;
        this.cambios = [];
        if(estado){
            this.estado = estado;
        } else {
        if(!(nombre && telefono && ciudad && prendas && medioPago && medioVenta && direccion)){
            this.estado = 0;
        } else {
            this.estado = 1;
        }
    }
    
}


}