const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de Gestion d\'Entrepôt' });
});

// Products Route
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { warehouse: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
