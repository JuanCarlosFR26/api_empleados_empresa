// Importamos dependencias
import express from 'express';
// import dotenv from 'dotenv';
import cors from 'cors';
import data from './api.js';
import { v4 as uuidv4 } from 'uuid';
// Cargarmos las variables de entorno
// dotenv.config();

// Creamos instancia de express
const app = express();

// Usamos CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send(data);
});

app.get('/departamentos', (req, res) => {
    res.send(data.departamentos);
})

app.get('/departamentos/:id', (req, res) => {
    console.log("IDs disponibles en los datos:", data.departamentos.map(d => d.id));
    const departamentoID = req.params.id;
    console.log("Buscando ID:", departamentoID);
    const departamento = data.departamentos.find(d => d.id_departamento === departamentoID);
    if (!departamento) {
        console.error("Departamento no encontrado para el ID:", departamentoID);
        return res.status(404).json({ error: "Departamento no encontrado" });
    }
    res.json(departamento);
});

app.get('/empleados', (req, res) => {
    const todosLosEmpleados = data.departamentos
                                   .map(departamento => departamento.empleados_departamento)
                                   .flat();
    res.json(todosLosEmpleados);
});


app.post('/empleados/:id_departamento', (req, res) => {
    const { nombre_empleado, apellidos_empleado, email_empleado, genero_empleado, puesto_empleado, salario_anual_empleado, seguro_empleado, codigo_acceso } = req.body;
    const { id_departamento } = req.params;

    // Validaciones simples
    if (!nombre_empleado || !apellidos_empleado || !email_empleado || !genero_empleado || !puesto_empleado || !salario_anual_empleado || !seguro_empleado  || !codigo_acceso) {
        return res.status(400).json({ error: 'La solicitud debe contener nombre_empleado, apellidos_empleado, email_empleado, genero_empleado, puesto_empleado, salario_anual_empleado, seguro_empleado, codigo_acceso' });
    }

    // Validación del formato del email con una expresión regular básica
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email_empleado)) {
        return res.status(400).json({ error: 'El formato del email no es válido.' });
    }

    if(salario_anual_empleado < 24000) {
        return res.status(400).json({ error: 'El salario no puede ser inferior a 24000'});
    }

    const departamento = data.departamentos.find(d => d.id_departamento === id_departamento);
    if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
    }

    const nuevoEmpleado = {
        id_empleado: uuidv4(),
        nombre_empleado,
        apellidos_empleado,
        email_empleado, 
        genero_empleado, 
        puesto_empleado, 
        salario_anual_empleado, 
        seguro_empleado,
        foto_empleado: `https://robohash.org/${uuidv4()}?set=set1`,
        codigo_acceso
    };

    departamento.empleados_departamento.push(nuevoEmpleado);

    res.status(201).json(nuevoEmpleado);
});

app.put('/empleados/:id_departamento/:id_empleado', (req, res) => {
    const { nombre_empleado, apellidos_empleado, email_empleado, genero_empleado, puesto_empleado, salario_anual_empleado, seguro_empleado, codigo_acceso } = req.body;
    const { id_departamento, id_empleado } = req.params;

    // Validaciones simples
    if (!nombre_empleado || !apellidos_empleado || !email_empleado || !genero_empleado || !puesto_empleado || !salario_anual_empleado || !seguro_empleado  || !codigo_acceso) {
        return res.status(400).json({ error: 'La solicitud debe contener nombre_empleado, apellidos_empleado, email_empleado, genero_empleado, puesto_empleado, salario_anual_empleado, seguro_empleado, codigo_acceso' });
    }

    // Validación del formato del email
    if (!/\S+@\S+\.\S+/.test(email_empleado)) {
        return res.status(400).json({ error: 'El formato del email no es válido.' });
    }

    const departamento = data.departamentos.find(d => d.id_departamento === id_departamento);
    if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
    }

    const empleadoIndex = departamento.empleados_departamento.findIndex(e => e.id_empleado === id_empleado);
    if (empleadoIndex === -1) {
        return res.status(404).json({ error: 'Empleado no encontrado en el departamento' });
    }

    const empleadoActualizado = {
        ...departamento.empleados_departamento[empleadoIndex],
        nombre_empleado,
        apellido_empleado,
        email_empleado,
        genero_empleado,
        puesto_empleado,
        salario_anual_empleado,
        seguro_empleado,
        codigo_acceso
    };

    departamento.empleados_departamento[empleadoIndex] = empleadoActualizado;

    res.json(empleadoActualizado);
});

app.delete('/empleados/:id_departamento/:id_empleado', (req, res) => {
    const { id_departamento, id_empleado } = req.params;

    // Encuentra el departamento al que pertenece el empleado
    const departamento = data.departamentos.find(d => d.id_departamento === id_departamento);
    if (!departamento) {
        return res.status(404).json({ error: 'Departamento no encontrado' });
    }

    // Encuentra el índice del empleado dentro del arreglo de empleados_departamento
    const index = departamento.empleados_departamento.findIndex(e => e.id_empleado === id_empleado);
    if (index === -1) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Elimina el empleado del arreglo de empleados_departamento
    departamento.empleados_departamento.splice(index, 1);

    res.status(200).json({ message: 'Empleado eliminado con éxito' });
});


// Escuchamos en el puerto indicado
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

module.exports = app;