// ecosystem.config.cjs
/** @type import('pm2').App[] */
module.exports = {
  apps: [
    {
      name: 'capixabay-back-dev',
      script: 'src/Server.ts',
      interpreter: './node_modules/.bin/ts-node',
      watch: ['./src'],      
      interpreter_args: '-r ts-node/register -r tsconfig-paths/register',
      env: {
        NODE_ENV: 'development'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      merge_logs: true
    }
  ]
}


