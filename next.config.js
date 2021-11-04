const urlPaths = require("./public/urls.json");

module.exports = {
  reactStrictMode: true,
  async redirects() {
    return urlPaths.redirects;
  },
};
