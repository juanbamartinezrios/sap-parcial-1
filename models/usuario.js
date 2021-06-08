module.exports = class Usuario {
    constructor(id_usuario, nombre, apellido, domicilio, dni, email, password) {
        this.id_usuario = id_usuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.domicilio = domicilio;
        this.dni = dni;
        this.email = email;
        this.password = password;
    }
};