const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;
const routes = require('./routes/routes')


const app = express();

app.use(cors());
app.use(express.json())

app.use("/hcl", routes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


