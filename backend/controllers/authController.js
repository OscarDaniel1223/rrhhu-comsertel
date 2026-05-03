const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor, completa todos los campos.' });
        }

        const SQL = 'SELECT * FROM usuarios WHERE email = ? AND estado = 1';

        // db.query ya devuelve promesa
        const [results] = await db.query(SQL, [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'No se encontro el usuario.' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Correo o contraseña incorrecta.' });
        }

        const token = jwt.sign(
            { id: user.id_usuario },
            'your_jwt_secret',
            { expiresIn: '1h' }
        );

        return res.json({
            token,
            message: 'Bienvenido ' + user.nombre,
            rol: user.idrol,
            id: user.id_usuario,
            name: user.nombre,
            cambio_pass: user.cambio_pass

        });

    } catch (err) {

        return res.status(500).json({ message: 'Internal server error contact support' });
    }
};

exports.changePassword = async (req, res) => {
    const { temp_password, new_password, id_usuario } = req.body;
    console.log(temp_password, new_password, id_usuario);

    if (temp_password == new_password) {
        return res.status(400).json({ status: 400, message: 'La contraseña debe ser diferente a la temporal.' });
    }

    if (new_password.length < 6) {
        return res.status(400).json({ status: 400, message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        if (!temp_password || !new_password) {
            return res.status(400).json({ status: 400, message: 'Por favor, completa todos los campos.' });
        }

        const SQL = 'SELECT * FROM usuarios WHERE id_usuario = ? AND estado = 1';

        // db.query ya devuelve promesa
        const [results] = await db.query(SQL, [id_usuario]);

        if (results.length === 0) {
            return res.status(401).json({ status: 401, message: 'No se encontro el usuario.' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(temp_password, user.password);

        if (!isMatch) {
            return res.status(401).json({ status: 401, message: 'Contraseña temporal incorrecta.' });
        }

        // encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        const SQL_UPDATE = 'UPDATE usuarios SET password = ? , cambio_pass = 1 WHERE id_usuario = ? ';

        // db.query ya devuelve promesa
        const [results_update] = await db.query(SQL_UPDATE, [hashedPassword, id_usuario]);


        return res.status(200).json({ status: 200, message: 'Contraseña actualizada correctamente puedes iniciar sesion con tu nueva contraseña.' });

    } catch (err) {

        return res.status(500).json({ status: 500, message: 'Internal server error contact support' });
    }
};
