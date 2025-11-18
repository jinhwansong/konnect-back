module.exports = {
  apps: [
    {
      name: "konnect-back",
      script: "dist/main.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
