const express = require('express');
const auth = require('../security/auth');
const authProduct = require('../security/product_auth');
const actions = require('../database/actions');

const router = express.Router();

router.get('/products', auth.auth, async (req, res)=> {
    let result = await actions.Select('SELECT * FROM producto', {});
    res.status(200).json(result)
});


router.get('/product/:id', auth.auth, async (req, res)=> {
    let result

    result = await actions.Select('SELECT * FROM producto WHERE id = :id', { id: req.params.id });
    res.status(200).json(result);
}); 

router.post('/product', auth.auth, auth.authRol, authProduct.authProduct, async (req, res)=> {
    //autenticar campos de producto
    /* Solo ingresa productos el Admin */
    const product = req.body;
    const Admin = req.isAdmin;
    let result;

    if (Admin){
        result = await actions.Insert(`INSERT INTO producto (nombre, valor, foto) 
        VALUES (:nombre, :valor, :foto)`, product);
    }else {
        res.status(403).json({
            success: false,
            message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin}
        })
    }
    if(result.error) {
        res.status(500).json({
            success: false,
            message: "Error de escritura en la BD o ingreso de datos invalido",
            data: req.body
        });
    } else {
        res.status(200).json({
            message: "Producto creado con exito"
        });
    }    
});


router.patch('/product/:id', auth.auth, auth.authRol, authProduct.authProductObject, async (req, res)=> { 
  
    const product = req.body;
    let query_options = req.queries;
    let query;
    if (req.isAdmin) {
        query = `UPDATE producto SET ${query_options} WHERE id = ${req.params.id}`;
    } else {
        res.status(403).json({
            success: false,
            message: 'El usuario que esta intentando ingresar no tiene privilegios suficientes',
            data: {Admin: req.isAdmin}
        });
    }
    const result = await actions.Update(query, product);
    res.status(200).json({
        message: `Se actualizo el producto con exito`,
        parameters: product
    });
});

router.delete('/product/:id', auth.auth, auth.authRol, async (req, res)=> {

    let result;
    if (req.isAdmin) {
        exist = await actions.Select('SELECT * FROM producto WHERE id = :id', { id: req.params.id });
        if (exist.length === 0) {
            res.status(404).json({
                success: false,
                messague: `El producto con el id ${req.params.id} no existe`,
                data: {id: req.params.id}
            })
        }
        result = await actions.Delete('DELETE FROM detailesordenes WHERE idProducto = :id', { id: req.params.id });
        result = await actions.Delete('DELETE FROM producto WHERE id = :id', { id: req.params.id });
        res.status(200).json({
            message: "El producto fue eliminado exitosamente",
            id_product: req.params.id
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