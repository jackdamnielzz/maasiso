module.exports = {
  apps: [{
    name: 'frontend',
    script: 'server.js',
    cwd: '.next/standalone',
    env: {
      PORT: 3000,
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: '/api/proxy',
      STRAPI_URL: 'http://153.92.223.23:1337',
      NEXT_PUBLIC_BACKEND_URL: 'http://153.92.223.23:1337',
      NEXT_PUBLIC_SITE_URL: 'https://maasiso.nl',
      STRAPI_TOKEN: '0a5381338f9b9b1382d31e59293ee4753b1b089ade561d58159da1a0d78e1914e5f7effe1bc46decb68017ff996d4fe18c972d03f00a62906b104c2370cbac312b20e64b48ee84fc61fc9ac9602769941763e7f5a224307ecc4418deb742e7117f1b68ce1e6a5047f3a0ae332a5ddc3d64d1d45ca2671536fa38b71dfcc860c4',
      NEXT_PUBLIC_STRAPI_TOKEN: '0a5381338f9b9b1382d31e59293ee4753b1b089ade561d58159da1a0d78e1914e5f7effe1bc46decb68017ff996d4fe18c972d03f00a62906b104c2370cbac312b20e64b48ee84fc61fc9ac9602769941763e7f5a224307ecc4418deb742e7117f1b68ce1e6a5047f3a0ae332a5ddc3d64d1d45ca2671536fa38b71dfcc860c4'
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
      STRAPI_URL: 'http://153.92.223.23:1337',
      NEXT_PUBLIC_BACKEND_URL: 'http://153.92.223.23:1337',
      STRAPI_TOKEN: '0a5381338f9b9b1382d31e59293ee4753b1b089ade561d58159da1a0d78e1914e5f7effe1bc46decb68017ff996d4fe18c972d03f00a62906b104c2370cbac312b20e64b48ee84fc61fc9ac9602769941763e7f5a224307ecc4418deb742e7117f1b68ce1e6a5047f3a0ae332a5ddc3d64d1d45ca2671536fa38b71dfcc860c4',
      NEXT_PUBLIC_STRAPI_TOKEN: '0a5381338f9b9b1382d31e59293ee4753b1b089ade561d58159da1a0d78e1914e5f7effe1bc46decb68017ff996d4fe18c972d03f00a62906b104c2370cbac312b20e64b48ee84fc61fc9ac9602769941763e7f5a224307ecc4418deb742e7117f1b68ce1e6a5047f3a0ae332a5ddc3d64d1d45ca2671536fa38b71dfcc860c4'
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
