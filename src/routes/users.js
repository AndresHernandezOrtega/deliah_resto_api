const express = require('express');
const auth = require('../security/auth');
const authUser = require('../security/user_auth');
const actions = require('../database/actions');

const router = express.Router();


router.get('/users', auth.auth, auth.authRol, async (req, res)=> {
    let result
    if (req.isAdmin) {
        result = await actions.Select('SELECT * FROM usuarios', {});
    } else {
        result = await actions.Select('SELECT * FROM usuarios WHERE nombreUsuaurio = :userName', { userName: req.user.userName });
    }
    res.status(200).json(result)
    
});


router.get('/user/:id', auth.auth, auth.authRol, async (req, res)=> {
    let result
    if (req.isAdmin) {
        result = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
        res.status(200).json(result);
    }else {
        res.status(403).json({
            success: false,
            message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin, id: req.params.id}
        });
    }
}); 


router.post('/user', authUser.authUser, async (req, res)=> {
    //autenticar campos de usuarios
    /* Solo se pueden crear usuarios clientes */
    const user = req.body;
    user.idRole = 2;
    let result;
    user.nombreUsuaurio = user.nombreUsuaurio.toLowerCase();
    result = await actions.Insert(`INSERT INTO usuarios (nombreUsuaurio, nombreCompleto, email, telefono, direccion, contrasena, idRole) 
    VALUES (:nombreUsuaurio, :nombreCompleto, :email, :telefono, :direccion, :contrasena, :idRole)`, user);
    if(result.error) {
        res.status(500).json({
            success: false,
            message: "Error de escritura en la BD o ingreso de datos invalido",
            data: req.body
        });
    } else {
        res.status(200).json({
            message: "Usuario creado con exito"
        });
    }    
});


router.patch('/user/:id', auth.auth, auth.authRol, authUser.authUserObject, async (req, res)=> { 
    //comprobar que los campos esten o arrojar errores, poner por defecto los valores de usuario
    //refactor solo poner en el query las propiedades que estan en el objeto
    // poner los status

    const user = req.body;
    let query_options = req.queries;
    let query;
    if (req.isAdmin) {
        query = `UPDATE usuarios SET ${query_options} WHERE id = ${req.params.id}`;
    } else {
        if (req.userId !== req.params.id) {
            res.status(403).json({
                success: false,
                message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
                data: {Admin: req.isAdmin, id: req.params.id}
            })
        }
        query = `UPDATE usuarios SET ${query_options} WHERE id = ${req.params.id}`;
    }
    const result = await actions.Update(query, user);
    res.status(200).json({
        message: `Se actualizo el usuario con exito`,
        parameters: user
    });
});


router.delete('/user/:id', auth.auth, auth.authRol, async (req, res)=> {
    let result;
    if (req.isAdmin) {
        exist = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });
        if (exist.length === 0) {
            res.status(404).json({
                success: false,
                message: `El usuario con el id ${req.params.id} no existe`,
                data: {id: req.params.id}
            })
        }
        result = await actions.Delete('DELETE FROM usuarios WHERE id = :id', { id: req.params.id });
        res.status(200).json({
            message: "El usuario fue eliminado exitosamente",
            id_user: req.params.id
        });
    }else {
        res.status(403).json({
            success: false,
            message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin, id: req.params.id}
        });
    }
});

module.exports = router;