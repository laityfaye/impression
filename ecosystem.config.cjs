/**
 * Configuration PM2 pour Impression (si l'app est à la racine du clone)
 * Usage: depuis ~/impression : pm2 start ecosystem.config.cjs --env production
 */
module.exports = {
  apps: [
    {
      name: 'impression-app',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: { NODE_ENV: 'development' },
      env_production: { NODE_ENV: 'production', PORT: 3000 },
    },
  ],
};
