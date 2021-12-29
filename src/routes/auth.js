const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');

const router = express.Router();

router.post('/login', async (req, res)=> {
    const params = req.body;

    // hacer comprobacion de la contraseña
    const user = {
        userName: params.userName,
        password: params.password
    };    
    const result = await actions.Select(`SELECT COUNT(*) as count 
    FROM usuarios
    WHERE nombreUsuaurio = :userName AND contrasena = :password`, user);

    if(result && Array.isArray(result) && result.length > 0) {
        if(result[0].count == 1) {
            res.status(200).json(auth.generateToken({userName: user.userName}));
        }else {
            res.status(404).json({
                success: false,
                messague: 'Usuario no encontrado, nombre de usuario o contraseña invalida',
                data: user
            });
        }
    }else{
        res.status(404).json({
            success: false,
            messague: 'Usuario no encontrado, nombre de usuario o contraseña invalida',
            data: user
        });
    }   
});

module.exports = router;
