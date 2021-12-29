# Delilah-resto
API REST para aplicación de pedidos en linea 

Endpoints 
* login: Genera un token de acceso validando información del usuario
* users: Gestiona la información del usuario
* products: Gestiona la información de productos registrados
* orders: Gestiona los pedidos del sistema

## Dependencias:

* Node.js (express)
* JSON Web Token (JWT)
* MySQL (sequalize)

## Instrucciones de inicio:

### Programas necesarios:
- Editor de codigo (VS Code)
- Node JS Version 14.17.6 LTS
- MySQL Version 8.0.26

Primero se debe instalar Node JS
* Windows Ir a la ultima versión oficial de Node: [latest stable version](https://nodejs.org/en/download/)
* Linux: Correr npm i node

```
$ git clone https://github.com/AndresHernandezOrtega/deliah_resto_api.git
```
O con SSH 

```
SSH: git@github.com:AndresHernandezOrtega/deliah_resto_api.git
```
### Instalar dependencias

```
run this command to install all the packages needed in the project: npm install

```

## Importar Base de datos


- Crear la conección por medio de Workbench y configurar la contraseña para el servidor de mySql

- Cliquear en data Import e importar los archivos SQL al esquema creado

- Click in _start import_ button.

## Conección a la base de datos:

Modificar el archivo _actions.js_ y poner el siguiente string reemplazando los datos con los que se configuró la DB

```
const database = new Sequelize('mysql://user:password@hosting:port/DB_name'); //actual value
```

## Iniciar servidor
run the next command in your console:
```
$ npm start
```
