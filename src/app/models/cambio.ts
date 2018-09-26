import { Prenda } from "./prenda";

export class Cambio {
    fechaCambio;
    fechaDespacho;
    prendas:Prenda[];
    valor:number;
    motivo:string;
    guia:string;
    cancelaFlete:boolean;
    completado:boolean;
    constructor(fechaCambio, prendas:Prenda[], motivo:string, valor = 0){
        this.fechaCambio = fechaCambio;
        this.prendas = prendas;
        this.motivo = motivo;
        this.valor = valor;
        this.guia = "";
        this.completado = false;
        this.cancelaFlete = false;
    }
}