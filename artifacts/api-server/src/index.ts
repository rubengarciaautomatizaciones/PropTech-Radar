import app from "./app.js";

// Render.com inyectará su propio puerto a través de process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor de PropTech-Radar activo y escuchando en el puerto ${PORT}`);
});