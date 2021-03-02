module.exports = {
  apps: [
    {
      name: 'Points Backstage Server',
      script: './main.js',
      error: './logs/error.log',
      output: './logs/server.log',
      log_type: 'json',
      env: {
        NODE_TLS_REJECT_UNAUTHORIZED: '0'
      }
    },
  ],
};
