module.exports = class Movimiento {
    constructor(id_usuario, id_unico, nro_cuenta, descripcion, fecha) {
        this.id_usuario = id_usuario;
        this.id_unico = id_unico;
        this.nro_cuenta = nro_cuenta;
        this.descripcion = descripcion;
        this.fecha = fecha;
    }
};