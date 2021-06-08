module.exports = class Cuenta {
    constructor(id_cotizacion, id_unico, saldo, id_usuario, alias, nro_cuenta) {
        this.id_cotizacion = id_cotizacion;
        this.id_unico = id_unico;
        this.saldo = saldo;
        this.id_usuario = id_usuario;
        this.alias = alias;
        this.nro_cuenta = nro_cuenta;
    }
};