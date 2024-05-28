const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());

app.get('/api/indicador/:code/:date', async (req, res) => {
    const { code, date } = req.params;
    const url = `https://mindicador.cl/api/${code}/${date}`;
  
    try {
      const response = await axios.get(url);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los datos del indicador' });
    }
  });
  

app.listen(port, () => {
  console.log(`Servidor intermedio escuchando en el puerto ${port}`);
});
