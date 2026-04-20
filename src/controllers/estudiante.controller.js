const EstudianteModel = require('../models/estudiante.model');

// Obtener la colección de estudiantes
const getAll = (req, res, next) => {
    try {
        const estudiantes = EstudianteModel.findAll();
        res.json(estudiantes);
    } catch (error) {
        next(error);
    }
};

// Consultar al estudiante mediante su Identificador principal (ID)
const getById = (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const estudiante = EstudianteModel.findById(id);

        if (!estudiante) {
            return res.status(404).json({ error: 'Estudiante no existe o no encontrado' });
        }

        res.json(estudiante);
    } catch (error) {
        next(error);
    }
};

// Crear un elemento "Estudiante"
const create = (req, res, next) => {
    try {
        const { nombre, codigo, email } = req.body;

        // Comprobamos la unicidad del código (como dice la regla de negocio)
        const existeCodigo = EstudianteModel.findByCodigo(codigo);
        if (existeCodigo) {
            return res.status(409).json({ error: `El registro con este código (${codigo}) ya se encuentra registrado` });
        }

        const id = EstudianteModel.create({ nombre, codigo, email });
        const newObj = EstudianteModel.findById(id);

        res.status(201).json({ result: newObj });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    getById,
    create
};