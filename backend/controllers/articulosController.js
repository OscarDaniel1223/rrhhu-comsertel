const db = require('../config/db');

exports.articulosGet = (req, res) => {
    const { categoria, descripcion } = req.body;

    let SQL = 'SELECT * FROM articulos';
    const params = [];
    const conditions = [];

    if (categoria) {
        conditions.push('id_categoria = ?');
        params.push(categoria);
    }

    if (descripcion) {
        conditions.push('descripcion LIKE ?');
        params.push(`%${descripcion}%`);
    }
    if (conditions.length > 0) {
        SQL += ' WHERE ' + conditions.join(' AND ');
    }


    db.query(SQL, params, (err, results) => {
        if (err) {

            return res.status(500).json({ message: 'Internal server error contact support' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron artículos' });
        }

        res.json(results);
    });



}


exports.articulosPost = (req, res) => {
    const { descripcion, marca, precio, id_categoria, existencias } = req.body;

    if (!descripcion || !precio || !id_categoria || !existencias) {
        return res.status(400).json({ message: 'Ingrese todos los campos obligatorios' });

    }

    if (precio <= 0) {
        return res.status(400).json({ message: 'El precio debe ser mayor a 0' });

    }

    if (existencias < 0) {
        return res.status(400).json({ message: 'Las existencias no pueden ser negativas' });
    }


    let SQL = 'INSERT INTO articulos (descripcion, marca, precio, id_categoria, existencias) VALUES (?, ?, ?, ?, ?)';
    const params = [descripcion, marca, precio, id_categoria, existencias];

    db.query(SQL, params, (err, results) => {
        if (err) {

            return res.status(500).json({ message: 'Internal server error contact support' });
        }

        res.status(201).json({ message: 'Artículo creado exitosamente', id: results.insertId });
    });

};



exports.articulosUpdate = (req, res) => {
    const { id_articulo } = req.params;
    const { descripcion, marca, precio, id_categoria, existencias } = req.body;



    if (precio <= 0) {
        return res.status(400).json({ message: 'El precio debe ser mayor a 0' });

    }

    if (existencias < 0) {
        return res.status(400).json({ message: 'Las existencias no pueden ser negativas' });
    }

    const params = [];
    const conditions = [];

    if (descripcion) {
        params.push(descripcion);
        conditions.push('descripcion = ?');
    }
    if (marca) {
        params.push(marca);
        conditions.push('marca = ?');
    }
    if (precio) {
        params.push(precio);
        conditions.push('precio = ?');
    }
    if (id_categoria) {
        params.push(id_categoria);
        conditions.push('id_categoria = ?');
    }
    if (existencias) {
        params.push(existencias);
        conditions.push('existencias = ?');
    }
    params.push(id_articulo);

    let SQL = 'UPDATE articulos SET ' + conditions.join(', ') + ' WHERE id_articulo = ?';



    db.query(SQL, params, (err, results) => {
        if (err) {

            return res.status(500).json({ message: 'Internal server error contact support' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Artículo no encontrado' });

        }

        res.json({ message: 'Artículo actualizado exitosamente' });
    });




};


exports.articulosDelete = (req, res) => {
    const { id_articulo } = req.params;

    if (!id_articulo) {
        return res.status(400).json({ message: 'Articulo no encontrado' });
    }

    let SQL = 'UPDATE articulos SET estado = 0 WHERE id_articulo = ?';

    db.query(SQL, [id_articulo], (err, results) => {
        if (err) {

            return res.status(500).json({ message: 'Internal server error contact support' });

        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Artículo no encontrado' });
        }

        res.json({ message: 'Artículo eliminado exitosamente' });
    });


};