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
      STRAPI_TOKEN: 'd52d11ab3633ba12f38ee5e7b8f79d8507a148b1dd2b4b6dacb02e3057d6ea60ff0f8335e5658a06926d217cc40abdb399c576babe36b3274407b069e840042e5e8b461386dd785838b012652add9aae6d2b44a4c20488e974747ed56acfe034b928d1d9d93ebad4d6d4d80b4e74f9043e7f2ec2e7439144e119d9bbb6fff61d',
      NEXT_PUBLIC_STRAPI_TOKEN: 'd52d11ab3633ba12f38ee5e7b8f79d8507a148b1dd2b4b6dacb02e3057d6ea60ff0f8335e5658a06926d217cc40abdb399c576babe36b3274407b069e840042e5e8b461386dd785838b012652add9aae6d2b44a4c20488e974747ed56acfe034b928d1d9d93ebad4d6d4d80b4e74f9043e7f2ec2e7439144e119d9bbb6fff61d'
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
  :start_line:36
  -------
      NODE_ENV: 'production',
      STRAPI_TOKEN: 'd52d11ab3633ba12f38ee5e7b8f79d8507a148b1dd2b4b6dacb02e3057d6ea60ff0f8335e5658a06926d217cc40abdb399c576babe36b3274407b069e840042e5e8b461386dd785838b012652add9aae6d2b44a4c20488e974747ed56acfe034b928d1d9d93ebad4d6d4d80b4e74f9043e7f2ec2e7439144e119d9bbb6fff61d',
      NEXT_PUBLIC_STRAPI_TOKEN: 'd52d11ab3633ba12f38ee5e7b8f79d8507a148b1dd2b4b6dacb02e3057d6ea60ff0f8335e5658a06926d217cc40abdb399c576babe36b3274407b069e840042e5e8b461386dd785838b012652add9aae6d2b44a4c20488e974747ed56acfe034b928d1d9d93ebad4d6d4d80b4e74f9043e7f2ec2e7439144e119d9bbb6fff61d',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || ''
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
