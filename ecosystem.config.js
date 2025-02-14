module.exports = {
  apps: [{
    name: 'maasiso',
    script: 'server.js',
    env: {
      PORT: 3000,
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'http://153.92.223.23:1337',
      NEXT_PUBLIC_STRAPI_API_URL: 'http://153.92.223.23:1337'
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true
  }]
}
