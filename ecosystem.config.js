module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: 'Server',
      script: 'app/index.js',
      source_map_support: true,
      watch: ['app'],
      ignore_watch: ['app/controllers', 'app/resources']
    }
  ]
};
