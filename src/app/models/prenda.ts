export class Prenda {
    nombre: string;
    sku: string;
    imagen: string;
    color:string;
    talla: string;
    valor: string;
    cantidad: number;
    estado:number; // 0 = no se ha buscado; 1 = en producion: 2 = Lista
    fullPath:string;
    prenda_id:string;

    constructor(nombre: string, sku: string, imagen: string){
        this.nombre = nombre;
        this.sku = sku;
        this.imagen = imagen;
        this.estado = 0;
        this.prenda_id = "";
    }
}