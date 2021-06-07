# SAP - Parcial 1

## Enunciado
```
1) Desarrollar un diagrama de clases (Solo el Domain Model) y una solución web donde se observen claramente los campos, propiedades y métodos para un sistema de compra/venta de Cripto Monedas con opción de billetera a modo de resguardo. Los tipos de cuenta que debería manejar son en Pesos ($), Dólares (USD) y Cripto (Por ejemplo BTC, puede escoger una crypto que usted desee para realizar el Test). Las acciones posibles para realizar son transferencias entre las cuentas, compra de Cripto y depósitos en cualquiera de las tres.
Las diferencias principales entre los tipos de cuenta son que las cuentas fiduciarias (Pesos y dólares) poseen CBU, Alias y Número de Cuenta, mientras que la de Cripto solo posee una dirección UUID (Universally Unique Identifier) hacia dónde dirigir la acción (Depósito, Transferencia) y que para poder comprar cripto los fondos deben partir de la cuenta en pesos, convertir a dólares y de ese estadío, a Cripto. Depósito y transferencia entre mismo tipo de cuenta, puede hacerse directamente.
2) Generar un modelo de Repositorio accesible a través de una WebApi (Con los métodos necesarios para las operaciones solicitadas) para persistir la información de depósitos, extracciones, transferencias entre cuentas y compra de cripto para luego poder consultar las mismas. Puede utilizar cualquier modelo de persistencia, incluso en memoria, para las entidades intervinientes.
3) El modelo de solución generado deberá contener mínimamente los siguientes 4 componentes: Sitio web para al cliente, WebApi, Domain Model y Repositorio, asignando las responsabilidades correspondientes. Utilizar patrones de diseño y extender la arquitectura si lo cree conveniente.
```

## Setup
La solución se encuentra realizada con NodeJS (express), Handlebars y Firebase (Realtime Database)
```
- Ingresar a la carpeta del proyecto
- Abrir un cli y ejecutar 'npm i' para instalar las dependencias necesarias
- Ejecutar 'npm run dev'
- El servidor se levantará en el puerto 3000
- Ingresar a http://localhost:3000/cuentas
```

## Setup variable de entorno para autenticación de Firebase
Ejecutar powershell (adm) y pegar la linea de abajo para definir la variable de entorno:
```
$env:GOOGLE_APPLICATION_CREDENTIALS="D:\SAP-parcial1\sap-node-firebase-adminsdk-lk7cr-c9728f4c6d.json"
```
