const http = require('http');
const os = require('os');

const server = http.createServer((req, res) => {
  const systemInfo = {
    status: 'healthy',
    uptime: process.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      usage: `${((1 - os.freemem() / os.totalmem()) * 100).toFixed(2)}%`
    },
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(systemInfo, null, 2));
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});