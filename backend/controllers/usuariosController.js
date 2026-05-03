const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
exports.getUsuarios = async (req, res) => {
    const { idrol, estado } = req.query;

    try {
        let sql = 'SELECT u.*, r.rol FROM usuarios u JOIN roles r ON u.idrol = r.id_rol';
        const params = [];
        const conditions = [];
        if (idrol !== undefined && idrol !== null && idrol !== '') {
            conditions.push('u.idrol = ?');
            params.push(idrol);
        }
        if (estado !== undefined && estado !== null && estado !== '') {
            conditions.push('u.estado = ?');
            params.push(estado);
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [rows] = await db.query(sql, params);
        if (rows.length === 0) {
            //devolver vacio
            return res.status(200).json([]);
        }
        res.json(rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
}

exports.getRoles = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM roles where estado = 1');
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron roles' });
        }
        res.json(rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al obtener los roles' });
    }
}


exports.newUser = async (req, res) => {

    try {
        const { nombres, apellidos, email, telefono, numero_documento, idrol, password } = req.body;
        //encriptar la contraseña
        // encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (nombres === undefined || nombres === null || nombres === '') {
            return res.status(400).json({ status: 400, message: 'Nombres es obligatorio' });
        }
        if (apellidos === undefined || apellidos === null || apellidos === '') {
            return res.status(400).json({ status: 400, message: 'Apellidos es obligatorio' });
        }
        if (email === undefined || email === null || email === '') {
            return res.status(400).json({ status: 400, message: 'Email es obligatorio' });
        }
        if (telefono === undefined || telefono === null || telefono === '') {
            return res.status(400).json({ status: 400, message: 'Telefono es obligatorio' });
        }
        if (numero_documento === undefined || numero_documento === null || numero_documento === '') {
            return res.status(400).json({ status: 400, message: 'Numero de documento es obligatorio' });
        }
        if (idrol === undefined || idrol === null || idrol === '') {
            return res.status(400).json({ status: 400, message: 'Idrol es obligatorio' });
        }
        var nombre_completo = nombres + ' ' + apellidos;
        const sql = 'INSERT INTO usuarios (nombre, password, email, telefono, numero_documento, idrol) VALUES (?, ?, ?, ?, ?, ?)';
        const params = [nombre_completo, hashedPassword, email, telefono, numero_documento, idrol];
        const [result] = await db.query(sql, params);
        res.json({ status: 200, message: 'Usuario creado correctamente', id: result.insertId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: 'Error al crear el usuario' });
    }
}

exports.updateUser = async (req, res) => {
    try {

        const { id_usuario, nombre, email, telefono, numero_documento, idrol } = req.body;

        if (!id_usuario) {
            return res.status(400).json({ status: 400, message: 'Id de usuario es obligatorio' });
        }
        if (!nombre) {
            return res.status(400).json({ status: 400, message: 'Nombre es obligatorio' });
        }
        if (!email) {
            return res.status(400).json({ status: 400, message: 'Email es obligatorio' });
        }
        if (!telefono) {
            return res.status(400).json({ status: 400, message: 'Telefono es obligatorio' });
        }
        if (!numero_documento) {
            return res.status(400).json({ status: 400, message: 'Numero de documento es obligatorio' });
        }
        if (!idrol) {
            return res.status(400).json({ status: 400, message: 'Rol es obligatorio' });
        }

        const data = {
            nombre,
            email,
            telefono,
            numero_documento,
            idrol
        };

        console.log(data);

        const sql = 'UPDATE usuarios SET ? WHERE id_usuario = ?';

        const [result] = await db.query(sql, [data, id_usuario]);

        res.json({
            status: 200,
            message: 'Usuario actualizado correctamente',
            id: id_usuario
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: 'Error al actualizar el usuario' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id_usuario } = req.body;
        if (id_usuario === undefined || id_usuario === null || id_usuario === '') {
            return res.status(400).json({ status: 400, message: 'Identificador de usuario es obligatorio' });
        }
        const sql = 'UPDATE usuarios SET estado = 0 WHERE id_usuario = ?';
        const params = [id_usuario];
        const [result] = await db.query(sql, params);
        res.json({ status: 200, message: 'Usuario eliminado correctamente', id: result.id_usuario });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: 'Error al eliminar el usuario' });
    }
}


exports.getUsuarioById = async (req, res) => {
    try {
        const { id_usuario } = req.query;
        if (!id_usuario) {
            return res.status(400).json({ status: 400, message: 'Identificador de usuario es obligatorio' });
        }
        const sql = 'SELECT u.*, r.rol AS rol_nombre FROM usuarios u JOIN roles r ON u.idrol = r.id_rol WHERE u.id_usuario = ?';
        const [rows] = await db.query(sql, [id_usuario]);
        if (rows.length === 0) {
            return res.status(404).json({ status: 404, message: 'Usuario no encontrado' });
        }
        res.json({ status: 200, data: rows[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: 'Error de comunicacion con el servidor, contacte a soporte tecnico' });
    }
}

exports.activarUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.body;
        if (id_usuario === undefined || id_usuario === null || id_usuario === '') {
            return res.status(400).json({ status: 400, message: 'Identificador de usuario es obligatorio' });
        }
        const sql = 'UPDATE usuarios SET estado = 1 WHERE id_usuario = ?';
        const params = [id_usuario];
        const [result] = await db.query(sql, params);
        res.json({ status: 200, message: 'Usuario activado correctamente', id: result.id_usuario });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: 'Error al activar el usuario' });
    }
}
