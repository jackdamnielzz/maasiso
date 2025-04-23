import { NextApiRequest, NextApiResponse } from 'next';
import os from 'os';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
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
      timestamp: new Date().toISOString(),
      host: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        loadavg: os.loadavg()
      }
    };

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(200).json(systemInfo);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}