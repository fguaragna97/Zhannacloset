import app from './lib/app.js';

const PORT = Number(process.env.API_PORT) || 3001;
app.listen(PORT, () => {
  console.log(`my-closet server listening on http://localhost:${PORT}`);
});
