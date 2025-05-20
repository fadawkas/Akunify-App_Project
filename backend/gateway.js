const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const proxyRequest = (targetUrl) => async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${targetUrl}${req.url}`,
      data: req.body,
      headers: {
        ...req.headers, 
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Internal Server Error' });
  }
};

// Add every service using the reusable handler
app.use('/income', proxyRequest('http://localhost:3001'));
app.use('/users', proxyRequest('http://localhost:3002'));
app.use('/cash', proxyRequest('http://localhost:3003'));
app.use('/auth', proxyRequest('http://localhost:3004'));
app.use('/stock', proxyRequest('http://localhost:3005'));
app.use('/operational', proxyRequest('http://localhost:3007'));
app.use('/assets', proxyRequest('http://localhost:3008'));
app.use('/order', proxyRequest('http://localhost:3010'));
app.use('/payment', proxyRequest('http://localhost:3011'));
app.use('/distribution', proxyRequest('http://localhost:3012'));

app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Gateway is working' });
});

app.listen(3000, () => console.log('API Gateway running on port 3000'));
