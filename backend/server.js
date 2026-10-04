const app = require('./app');
cors = require('cors');
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: 'https://school-fee-management-system-iqni.onrender.com'
}));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
