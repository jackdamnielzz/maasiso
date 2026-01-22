module.exports = {
  apps: [{
    name: 'test-deploy',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    env: {
      PORT: 3000,
      NODE_ENV: 'production'
    }
  }]
}