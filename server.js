const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const uploadDir = path.join(__dirname, 'uploads');
const clientsFile = path.join(__dirname, 'clients.json');

app.use(cors());
app.use('/uploads', express.static(uploadDir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Asegurar que `clients.json` existe
if (!fs.existsSync(clientsFile)) {
    fs.writeJsonSync(clientsFile, []);
}

// Configurar almacenamiento de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const { clientName, registrationDate } = req.body;
        if (!clientName || !registrationDate) {
            return cb(new Error("Faltan datos para generar el nombre del archivo"));
        }
        const safeName = clientName.replace(/[^a-zA-Z0-9]/g, "_");
        cb(null, `${safeName}_${registrationDate}.png`);
    }
});

const upload = multer({ storage });
fs.ensureDirSync(uploadDir);

// Obtener la lista de clientes
app.get('/clients', async (req, res) => {
    const clients = await fs.readJson(clientsFile);
    res.json(clients);
});

// Eliminar un cliente por ID
app.delete('/clients/:id', async (req, res) => {
    try {
        let clients = await fs.readJson(clientsFile);
        const clientId = req.params.id;

        const client = clients.find(c => c.id === clientId);
        if (!client) return res.status(404).json({ error: "Cliente no encontrado" });

        // Eliminar archivo de imagen
        const imagePath = path.join(uploadDir, client.photo);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Filtrar clientes y guardar
        clients = clients.filter(c => c.id !== clientId);
        await fs.writeJson(clientsFile, clients);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar cliente" });
    }
});

// Subir imagen y guardar cliente en `clients.json`
app.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        const { clientName, registrationDate, expirationDate } = req.body;
        const file = req.file;

        if (!clientName || !registrationDate || !file) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        let clients = await fs.readJson(clientsFile);
        const newClient = {
            id: Date.now().toString(),
            name: clientName,
            registrationDate,
            expirationDate,
            photo: file.filename
        };

        clients.push(newClient);
        await fs.writeJson(clientsFile, clients);

        res.json({ message: "Cliente registrado", file: file.filename });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar cliente" });
    }
});

//ruta para actualizar un cliente
app.put('/clients/:id', upload.single('photo'), async (req, res) => {
  try {
      let clients = await fs.readJson(clientsFile);
      const clientId = req.params.id;
      const { clientName, registrationDate, expirationDate } = req.body;
      const file = req.file;

      let client = clients.find(c => c.id === clientId);
      if (!client) return res.status(404).json({ error: "Cliente no encontrado" });

      client.name = clientName;
      client.registrationDate = registrationDate;
      client.expirationDate = expirationDate;

      // Si se subió una nueva foto, eliminar la anterior y actualizarla
      if (file) {
          if (client.photo) {
              fs.unlinkSync(path.join(uploadDir, client.photo));
          }
          client.photo = file.filename;
      }

      await fs.writeJson(clientsFile, clients);
      res.json({ success: true });
  } catch (error) {
      res.status(500).json({ error: "Error al actualizar cliente" });
  }
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
