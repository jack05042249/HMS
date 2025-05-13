module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'ITMS API stage',
      script    : './src/app.js',
      log_date_format : "YYYY-MM-DD HH:mm Z",
      error_file : "./err.log",
      out_file : "./out.log",
      env : {
        NODE_ENV: 'stage',
        PORT: 8000
      }
    }
  ]
};
