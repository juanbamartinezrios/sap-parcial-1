const { Router } = require('express');
const router = Router();
const admin = require('firebase-admin');
const moment = require('moment');

var serviceAcc = require('../sap-node-firebase-adminsdk-lk7cr-c9728f4c6d.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAcc),
    databaseURL: 'https://sap-node-default-rtdb.firebaseio.com/'
});

const db = admin.database();
        /**
        USUARIO
        id_usuario: 1,
        nombre: 'Juan Bautista',
        apellido: 'Martinez Ríos',
        domicilio: 'Calle Falsa 123 - 3B',
        dni: '37375957',
        email: 'juanbamartinezrios@gmail.com',
        password: 'admin'
         */
        /**
        CUENTA
        id_cotizacion: 3,
        id_unico: '1234567890123456789012',
        saldo: 1999888.99,
        id_usuario: null,
        alias: 'PESOS.WALLET.UNO',
        nro_cuenta: '20900000290350000083',
        id_usuario: 1
         */
        /**
        MOVIMIENTO
            id_usuario: 1,
            id_unico: '1234567890123456789012',
            nro_cuenta: '20900000290350000083',
            descripcion: 'DEPÓSITO',
            fecha: date
         */

var date = moment().toDate().toString();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/bitacora', (req, res) => {
    db.ref('bitacora').once('value', (snapshot) => {
        const data = snapshot.val();
        res.render('index', { logs: data });
    });
});

router.get('/deposito/:id', (req, res) => {
    res.render('index', { showFormToDeposit: true, id_unico: req.params.id });
});

router.post('/deposito/submit', (req, res, next) => {
    var id_unico = req.body.id_unico;
    var monto = parseFloat(req.body.monto);
    db.ref('cuentas').orderByChild('id_unico').equalTo(id_unico).once('value', (snapshot) => {
        var childKey = Object.keys(snapshot.val())[0];
        var saldoActual = 0;
        snapshot.forEach((child) => {
            saldoActual = parseFloat(child.val().saldo.toString());
        });
        console.log(saldoActual+monto);
        db.ref('cuentas').child(childKey).update({saldo: saldoActual+monto});
        snapshot.forEach((child) => {
            dataObj = child.val();
            db.ref('movimientos').push({
                id_usuario: dataObj.id_usuario,
                id_unico: dataObj.id_unico,
                nro_cuenta: dataObj.nro_cuenta,
                descripcion: 'DEPÓSITO',
                fecha: date
            });
        });
        res.redirect('/cuentas');
    });
});

router.get('/extraccion/:id', (req, res) => {
    res.render('index', { showFormToExtract: true, id_unico: req.params.id });
});

router.post('/extraccion/submit', (req, res, next) => {
    var id_unico = req.body.id_unico;
    var monto = parseFloat(req.body.monto);
    db.ref('cuentas').orderByChild('id_unico').equalTo(id_unico).once('value', (snapshot) => {
        var childKey = Object.keys(snapshot.val())[0];
        var saldoActual = 0;
        snapshot.forEach((child) => {
            saldoActual = parseFloat(child.val().saldo.toString());
        });
        db.ref('cuentas').child(childKey).update({saldo: saldoActual-monto});
        snapshot.forEach((child) => {
            dataObj = child.val();
            db.ref('movimientos').push({
                id_usuario: dataObj.id_usuario,
                id_unico: dataObj.id_unico,
                nro_cuenta: dataObj.nro_cuenta,
                descripcion: 'EXTRACCIÓN',
                fecha: date
            });
        });
        res.redirect('/cuentas');
    });
});

router.get('/cuentas', (req, res) => {
    db.ref('cuentas').on('value', (snapshot) => {
        const data = snapshot.val();
        res.render('index', { 
            cuentas: data,
            isCompra: false,
            helpers: {
                isEqual: function (lvalue, operator, rvalue, options) { 
                    var operators, result;
                    if (arguments.length < 3) {
                        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
                    }
                    if (options === undefined) {
                        options = rvalue;
                        rvalue = operator;
                        operator = "===";
                    }
                    var operators = {
                        '==':       function(l,r) { return l == r; },
                        '===':      function(l,r) { return l === r; },
                        '!=':       function(l,r) { return l != r; },
                        '<':        function(l,r) { return l < r; },
                        '>':        function(l,r) { return l > r; },
                        '<=':       function(l,r) { return l <= r; },
                        '>=':       function(l,r) { return l >= r; },
                        'typeof':   function(l,r) { return typeof l == r; }
                    }
                    if (!operators[operator])
                        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);
                    var result = operators[operator](lvalue,rvalue);
                    if( result ) {
                        return options.fn(this);
                    } else {
                        return options.inverse(this);
                    }
                }
            }
        });
    });
});

router.get('/movimientos/:id', (req, res) => {
    db.ref('movimientos').once('value', (snapshot) => {
        const data = [];
        snapshot.forEach((child) => {
            if (child.val().id_unico === req.params.id) {
                data.push(child.val());
            }
            return false;
        });
        res.render('index', {movimientos: data});
    });
});

router.get('/comprar', (req, res) => {
    const data = [];
    db.ref('cuentas').on('value', (snapshot) => {
        snapshot.forEach((child) => {
            if (child.val().id_cotizacion !== 2) {
                data.push(child.val());
            }
        });
        res.render('index', {
            isCompra: true,
            cuentas: data,
            helpers: {
                isEqual: function (lvalue, operator, rvalue, options) { 
                    var operators, result;
                    if (arguments.length < 3) {
                        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
                    }
                    if (options === undefined) {
                        options = rvalue;
                        rvalue = operator;
                        operator = "===";
                    }
                    var operators = {
                        '==':       function(l,r) { return l == r; },
                        '===':      function(l,r) { return l === r; },
                        '!=':       function(l,r) { return l != r; },
                        '<':        function(l,r) { return l < r; },
                        '>':        function(l,r) { return l > r; },
                        '<=':       function(l,r) { return l <= r; },
                        '>=':       function(l,r) { return l >= r; },
                        'typeof':   function(l,r) { return typeof l == r; }
                    }
                    if (!operators[operator])
                        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);
                    var result = operators[operator](lvalue,rvalue);
                    if( result ) {
                        return options.fn(this);
                    } else {
                        return options.inverse(this);
                    }
                }
            }});
    });
});

router.post('/comprar/submit', (req, res, next) => {
    var id_unico = req.body['select-cuenta'];
    var monto = parseFloat(req.body.monto);
    var childKeyCuentaSeleccionada;
    var cuentaSeleccionada;
    var childKeyCuentaCRIPTO;
    var childCRIPTOSaldoActual = 0;
    db.ref('cuentas').orderByChild('id_unico').equalTo(id_unico).once('value', (snapshot) => {
        childKeyCuentaSeleccionada = Object.keys(snapshot.val())[0];
        var saldoActualCuentaSeleccionada = 0;
        snapshot.forEach((child) => {
            cuentaSeleccionada = child.val();
            saldoActualCuentaSeleccionada = parseFloat(child.val().saldo.toString());
        });
        db.ref('cuentas').child(childKeyCuentaSeleccionada).update({saldo: saldoActualCuentaSeleccionada-monto});
    });
    db.ref('cuentas').orderByChild('id_cotizacion').equalTo(2).once('value', (snapshot) => {
        childKeyCuentaCRIPTO = Object.keys(snapshot.val())[0];
        snapshot.forEach((child) => {
            childCRIPTOSaldoActual = parseFloat(child.val().saldo.toString());
            var childCuentaSeleccionadaCRIPTO = child.val();
            var montoTransformado;
            if (cuentaSeleccionada.id_cotizacion === 1) {
                montoTransformado = monto / 35720.3;
            }
            if (cuentaSeleccionada.id_cotizacion === 3) {
                montoTransformado = (monto / 94.80) / 35720.3;
            }
            db.ref('cuentas').child(childKeyCuentaCRIPTO).update({saldo: childCRIPTOSaldoActual+montoTransformado});
            db.ref('movimientos').push({
                id_usuario: childCuentaSeleccionadaCRIPTO.id_usuario,
                id_unico: childCuentaSeleccionadaCRIPTO.id_unico,
                nro_cuenta: childCuentaSeleccionadaCRIPTO.nro_cuenta,
                descripcion: 'COMPRA',
                fecha: date
            });
        });
        res.redirect('/cuentas');
    });
});

module.exports = router;