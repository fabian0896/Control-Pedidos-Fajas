"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
admin.firestore().settings({ timestampsInSnapshots: true });
/* exports.actualizarEstadisticas = functions.firestore.document('pedidos/{pedidoId}').onWrite((chage, context)=>{
    console.log("Se ejecuto!");
    const anteriorPedido = chage.before.data();
    const nuevoPedido = chage.after.data();
    const fecha = new Date(nuevoPedido.fechaVenta);
    const referencia = admin.firestore().collection('estadisticas').doc(`${ fecha.getFullYear() }-${ fecha.getMonth() + 1 }`);
    
    console.log(anteriorPedido, nuevoPedido);
    return referencia.get().then((data) => {
        console.log("datos", data.data());
    }).catch(err=>{
        console.log(err);
    });
    
}); */
exports.creacionPedido = functions.firestore.document('pedidos/{pedidoId}').onCreate((snapshot, context) => {
    //creacion de pedido
    const offsetTime = 18000000;
    const nuevo_pedido = snapshot.data();
    const fecha = new Date(nuevo_pedido.fechaVenta - offsetTime);
    const total_prendas = CalcularTotal(nuevo_pedido);
    let dia;
    let temp = {};
    const ref = admin.firestore().collection('estadisticas').doc(`${fecha.getFullYear()}-${fecha.getMonth() + 1}`);
    return ref.get().then(respuesta => {
        const data = respuesta.data();
        if (data) {
            dia = data[fecha.getDate()];
            if (dia) {
                temp[fecha.getDate()] = {
                    ventas: dia.ventas + total_prendas,
                    devoluciones: dia.devoluciones
                };
                ref.update(temp).then().catch();
            }
            else {
                temp[fecha.getDate()] = {
                    ventas: total_prendas,
                    devoluciones: 0
                };
                ref.update(temp).then().catch();
            }
        }
        else {
            temp[fecha.getDate()] = {
                ventas: total_prendas,
                devoluciones: 0
            };
            ref.set(temp).then().catch();
        }
    }).catch(err => {
        console.log(err);
    });
});
exports.eliminacionPedido = functions.firestore.document('pedidos/{pedidoId}').onDelete((snapshot, context) => {
    //cuando se elimina un pedido
    const offsetTime = 18000000;
    const nuevo_pedido = snapshot.data();
    const fecha = new Date(nuevo_pedido.fechaVenta - offsetTime);
    const total_prendas = CalcularTotal(nuevo_pedido);
    let dia;
    let temp = {};
    const ref = admin.firestore().collection('estadisticas').doc(`${fecha.getFullYear()}-${fecha.getMonth() + 1}`);
    return ref.get().then(respuesta => {
        let data = respuesta.data();
        if (data) {
            console.log("se elimino el pedido");
            dia = data[fecha.getDate()];
            if (nuevo_pedido.estado >= 6) {
                //se borro un pedido que fue devolucion
                if (dia.devoluciones > 0) {
                    temp[fecha.getDate()] = {
                        ventas: dia.ventas,
                        devoluciones: (dia.devolucion - total_prendas)
                    };
                    ref.update(temp).then().catch();
                }
            }
            else {
                // se borro un pedido que no era devolucion
                if (dia.ventas > 0) {
                    temp[fecha.getDate()] = {
                        ventas: (dia.ventas - total_prendas),
                        devoluciones: dia.devoluciones
                    };
                    ref.update(temp).then().catch();
                }
            }
        }
        else {
            console.log("No se puede borrar por que nunca se registró");
        }
    }).catch(err => {
        console.log(err);
    });
});
exports.edicionPedido = functions.firestore.document('pedidos/{pedidoId}').onUpdate((change) => {
    // edicion del pedido
    const offsetTime = 18000000;
    const nuevo_pedido = change.after.data();
    const anterior_pedido = change.before.data();
    const fecha = new Date(nuevo_pedido.fechaVenta - offsetTime);
    const total_prendas_nuevo = CalcularTotal(nuevo_pedido);
    const total_prendas_anterior = CalcularTotal(anterior_pedido);
    let dia;
    let temp = {};
    let caso = 0;
    if (nuevo_pedido.estado == 6 && anterior_pedido.estado != 6) {
        // el pedido cambio a devolucion
        caso = 1;
    }
    else if (nuevo_pedido.estado == 6 && anterior_pedido.estado == 6) {
        // el pedido siempre fue devolucion
        caso = 2;
    }
    else if (nuevo_pedido.estado != 6 && anterior_pedido.estado == 6) {
        // el pedido era devolucion pero ya no
        caso = 3;
    }
    else if (nuevo_pedido.estado != 6 && anterior_pedido.estado != 6) {
        //el pedido nuca fue devolucion
        caso = 4;
    }
    if (caso == 4 || caso == 2) {
        if (total_prendas_nuevo == total_prendas_anterior) {
            console.log("no es necesario actualizar");
            return false;
        }
    }
    const ref = admin.firestore().collection('estadisticas').doc(`${fecha.getFullYear()}-${fecha.getMonth() + 1}`);
    return ref.get().then(respuesta => {
        const data = respuesta.data();
        if (data) {
            dia = data[fecha.getDate()];
            if (caso == 1) {
                temp[fecha.getDate()] = {
                    ventas: (dia.ventas - total_prendas_nuevo),
                    devoluciones: (dia.devoluciones + total_prendas_nuevo)
                };
            }
            else if (caso == 2) {
                temp[fecha.getDate()] = {
                    ventas: dia.ventas,
                    devoluciones: (dia.devoluciones + (total_prendas_nuevo - total_prendas_anterior))
                };
            }
            else if (caso == 3) {
                temp[fecha.getDate()] = {
                    ventas: (dia.ventas + total_prendas_nuevo),
                    devoluciones: (dia.devoluciones - total_prendas_nuevo)
                };
            }
            else if (caso == 4) {
                temp[fecha.getDate()] = {
                    ventas: (dia.ventas + (total_prendas_nuevo - total_prendas_anterior)),
                    devoluciones: dia.devoluciones
                };
            }
            ref.update(temp).then().catch();
        }
    }).catch(err => {
        console.log(err);
    });
});
function CalcularTotal(pedido) {
    const prendas = pedido.prendas;
    let total = 0;
    for (const prenda of prendas) {
        total += prenda.cantidad;
    }
    return total;
}
//# sourceMappingURL=index.js.map