const { Router } = require('express');
const router = Router();
const admin = require('firebase-admin');
const moment = require('moment');

var Bitacora = require('../models/bitacora');
var Cuenta = require('../models/cuenta');
var Movimiento = require('../models/movimiento');

var serviceAcc = require('../sap-node-firebase-adminsdk-lk7cr-c9728f4c6d.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAcc),
    databaseURL: 'https://sap-node-default-rtdb.firebaseio.com/'
});

const db = admin.database();

var date = moment().toDate().toString();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/bitacora', (req, res) => {
    db.ref('bitacora').once('value', (snapshot) => {
        const snapshotContainer = snapshot;
        const data = [];
        snapshotContainer.forEach((child) => {
            data.push(new Bitacora(child.val().criticidad, child.val().descripcion));
        });
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
        const snapshotContainer = snapshot;
        const data = [];
        snapshotContainer.forEach((child) => {
            data.push(new Cuenta(child.val().id_cotizacion, child.val().id_unico, child.val().saldo, child.val().id_usuario, child.val().alias, child.val().nro_cuenta));
        });
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
        const snapshotContainer = snapshot;
        const data = [];
        snapshotContainer.forEach((child) => {
            if (child.val().id_unico === req.params.id) {
                data.push(new Movimiento(child.val().id_usuario, child.val().id_unico, child.val().nro_cuenta, child.val().descripcion, child.val().fecha));
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


router.get('/transferencia', (req, res) => {
    const data = [];
    db.ref('cuentas').on('value', (snapshot) => {
        snapshot.forEach((child) => {
            if (child.val().id_cotizacion !== 2) {
                data.push(child.val());
            }
        });
        res.render('index', {
            isTransferencia: true,
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

router.post('/transferencia/submit', (req, res, next) => {
    var id_unico_debito = req.body['select-cuenta-debito'];
    var id_unico_credito = req.body['select-cuenta-credito'];
    var monto = parseFloat(req.body.monto);
    var childKeyCuentaSeleccionadaDEBITO;
    var childKeyCuentaSeleccionadaCREDITO;
    var cuentaSeleccionadaDEBITO;
    var cuentaSeleccionadaCREDITO;
    db.ref('cuentas').orderByChild('id_unico').equalTo(id_unico_debito).once('value', (snapshot) => {
        childKeyCuentaSeleccionadaDEBITO = Object.keys(snapshot.val())[0];
        var saldoActualCuentaSeleccionadaDEBITO = 0;
        snapshot.forEach((child) => {
            cuentaSeleccionadaDEBITO = child.val();
            saldoActualCuentaSeleccionadaDEBITO = parseFloat(child.val().saldo.toString());
        });
        db.ref('cuentas').child(childKeyCuentaSeleccionadaDEBITO).update({saldo: saldoActualCuentaSeleccionadaDEBITO-monto});
    });
    db.ref('cuentas').orderByChild('id_unico').equalTo(id_unico_credito).once('value', (snapshot) => {
        childKeyCuentaSeleccionadaCREDITO = Object.keys(snapshot.val())[0];
        var saldoActualCuentaSeleccionadaCREDITO = 0;
        snapshot.forEach((child) => {
            cuentaSeleccionadaCREDITO = child.val();
            saldoActualCuentaSeleccionadaCREDITO = parseFloat(child.val().saldo.toString());
            var montoTransformado;
            if (cuentaSeleccionadaDEBITO.id_cotizacion === 1 && cuentaSeleccionadaCREDITO.id_cotizacion === 3) {
                montoTransformado = monto * 94.80;
            }
            if (cuentaSeleccionadaDEBITO.id_cotizacion === 3 && cuentaSeleccionadaCREDITO.id_cotizacion === 1) {
                montoTransformado = monto / 94.80;
            }
            db.ref('cuentas').child(childKeyCuentaSeleccionadaCREDITO).update({saldo: saldoActualCuentaSeleccionadaCREDITO+montoTransformado});
            db.ref('movimientos').push({
                id_usuario: cuentaSeleccionadaDEBITO.id_usuario,
                id_unico: cuentaSeleccionadaDEBITO.id_unico,
                nro_cuenta: cuentaSeleccionadaDEBITO.nro_cuenta,
                descripcion: 'TRANSFERENCIA',
                fecha: date
            });
        });
        res.redirect('/cuentas');
    });
});

module.exports = router;