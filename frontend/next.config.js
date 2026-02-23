let config = {
  reactStrictMode: true,
}

try {
  const withPWA = require('next-pwa')
  const runtimeCaching = require('next-pwa/cache')
  config = withPWA({
    ...config,
    pwa: {
      dest: 'public',
      runtimeCaching,
      register: true,
      skipWaiting: true,
    },
  })
} catch (e) {
  // next-pwa not installed; export basic config
  // console.warn('next-pwa not available, skipping PWA config')
}

module.exports = config
