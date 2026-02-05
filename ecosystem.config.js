module.exports = {
  apps: [{
    name: 'frontend',
    script: 'server.js',
    cwd: '.next/standalone',
    env: {
      PORT: 3000,
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: '/api/proxy',
      STRAPI_URL: 'https://maasiso.nl',
      NEXT_PUBLIC_BACKEND_URL: 'https://maasiso.nl',
      NEXT_PUBLIC_SITE_URL: 'https://maasiso.nl',
      STRAPI_TOKEN: process.env.STRAPI_TOKEN || ''
    },
    instances: 1,
    exec_mode: 'fork',
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 5000,
    shutdown_with_message: true,
    max_memory_restart: '1G',
    max_restarts: 10,
    restart_delay: 3000,
    exp_backoff_restart_delay: 100,
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    watch: false,
    node_args: '--max-old-space-size=1024',
    env_production: {
      NODE_ENV: 'production',
      STRAPI_TOKEN: process.env.STRAPI_TOKEN || ''
    },
    source_map_support: false,
    vizion: false,
    autorestart: true,
    post_update: [
      "npm install --legacy-peer-deps",
      "npm run build:prod",
      "cp -r node_modules .next/standalone/"
    ]
  }]
}
