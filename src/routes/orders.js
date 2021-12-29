const express = require('express');
const auth = require('../security/auth');
const authOrder = require('../security/order_auth');
const actions = require('../database/actions');

const router = express.Router();


// Traer todas las ordenes
router.get('/orders', auth.auth, auth.authRol, async (req, res)=> {
    const Admin = req.isAdmin;
    let query;

    if(Admin){
        query = `SELECT * FROM ordenes`
    } else {
        query = `SELECT * FROM ordenes WHERE IdUser = ${req.userId}`
    }
    const result = await actions.Select(query, {});
    res.status(200).json(result);
});


// Traer una orden por ID
router.get('/order/:id', auth.auth, auth.authRol, async (req, res)=> {
    const Admin = req.isAdmin;
    if(Admin){
        const result = await actions.Select('SELECT * FROM ordenes WHERE id = :id', {id: req.params.id});
        res.status(200).json(result);
    } else {
        res.status(403).json({
            success: false,
            message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin, id: req.params.id}
        });
    }
});


// Crear una orden
router.post('/order', auth.auth, auth.authRol, authOrder.authOrder, async (req, res)=> {
    const reqComplete = req.body;

    const orderInfo = reqComplete.order;
    const detallesOrderInfo = reqComplete.detalleOrder

    const resultOrderInsert = await actions.Insert(`INSERT INTO ordenes  
    (hora, tipoPago, IdUser, estado) 
    VALUES (NOW(), :tipoPago, :IdUser, :estado)`, orderInfo);

    const idOrden = resultOrderInsert[0];
    
    for (const detalleOrderInfo of detallesOrderInfo) {
        await actions.Insert(`INSERT INTO detallesordenes  
        (idOrden, idProducto, cantidad) 
        VALUES (:idOrden, :idProducto, :cant)`, { idOrden, ...detalleOrderInfo});
    }

    const resultQueryName = await actions.Select(
        `
        SELECT SUM(p.valor * do.cantidad) as total,
        GROUP_CONCAT(do.cantidad, "x ", p.nombre, " ") as name
        FROM detallesordenes as do
        INNER JOIN producto as p ON (p.id = do.idProducto)
        WHERE do.idOrden = :idOrden
        
        `
    , { idOrden });

    console.log("mi total y nombre",resultQueryName)

    const resultOrderUpdate = await actions.Update(`UPDATE ordenes 
    SET nombre = :nombre, total = :total WHERE id = :idOrden`, { idOrden, nombre: resultQueryName[0].name, total: resultQueryName[0].total });

    const result = await actions.Select(`SELECT * FROM ordenes WHERE id= ${idOrden}`)

    if(resultOrderUpdate.error) {
        res.status(500).json({
            success: false,
            message: `Error de escritura en la BD o ingreso de datos invalido, ${resultOrderUpdate.message}`,
            data: req.body
        });
    } else {
        res.status(200).json({
            message: "Orden creada con exito"
        });
    }    
});


// Modificar una orden
router.put('/order/:id', auth.auth, auth.authRol, authOrder.authOrderStatus, async (req, res)=> {
    const userStatus = req.body;
    let query;
    if (req.isAdmin) {
        query = `UPDATE ordenes SET estado =:estado WHERE id = ${req.params.id}`;
    } else {
        res.status(403).json({
            success: false,
            message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin}
        });
    }
    const result = await actions.Update(query, userStatus);
    res.status(200).json({
        message: `Se actualizo la orden con exito`,
        parameters: userStatus
    });
});

// Eliminar una orden
router.delete('/order/:id', auth.auth, auth.authRol, async (req, res)=> {
    let result;
    if (req.isAdmin) {
        exist = await actions.Select('SELECT * FROM ordenes WHERE id = :id', { id: req.params.id });
        if (exist.length === 0) {
            res.status(404).json({
                success: false,
                message: `El producto con el id ${req.params.id} no existe`,
                data: {id: req.params.id}
            })
        }
        result = await actions.Delete('DELETE FROM detallesordenes WHERE idOrden = :id', { id: req.params.id });
        result = await actions.Delete('DELETE FROM ordenes WHERE id = :id', { id: req.params.id });
        res.status(200).json({
            message: "la orden fue eliminada exitosamente",
            id_order: req.params.id
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
