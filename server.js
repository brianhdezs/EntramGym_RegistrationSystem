const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;

// Directorio donde se guardarán las imágenes
const uploadDir = path.join(__dirname, 'uploads');

// Crear carpeta si no existe
fs.ensureDirSync(uploadDir);

// Configurar Multer (almacena con nombre temporal)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `temp_${Date.now()}.png`); // Nombre temporal
  }
});

const upload = multer({ storage });

// Middleware para manejar JSON y FormData
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para subir imágenes
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se recibió la imagen" });
  }

  // Obtener datos del formulario
  const { clientName, registrationDate } = req.body;

  if (!clientName || !registrationDate) {
    return res.status(400).json({ error: "Faltan datos del cliente" });
  }

  // Generar nombre de archivo final
  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, "_");
  const finalFileName = `${safeName}_${registrationDate}.png`;
  const finalFilePath = path.join(uploadDir, finalFileName);

  // Renombrar el archivo
  fs.rename(req.file.path, finalFilePath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Error al renombrar el archivo" });
    }

    res.json({ message: 'Imagen guardada correctamente', file: finalFileName });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
