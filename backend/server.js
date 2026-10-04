const app = require('./app');
cors = require('cors');
const PORT = process.env.PORT || 5000;
app.use(cors());
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
