/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      fallback: [
        // These rewrites are checked after both pages/public files
        // and dynamic routes are checked
        {
          source: "/", // grupo de controle
          destination: "https://gentle-grass-06d7e0a10.5.azurestaticapps.net", // MF responsável
          // destination: "http://localhost:3001", // MF responsável
        },
        {
          source: "/:path",
          destination: "https://gentle-grass-06d7e0a10.5.azurestaticapps.net/:path*",
          // destination: "http://localhost:3001/:path*",
        },
      ],
    }
  },
  async redirects() {
    return [
      // Redireciona ao login do next-auth no main, quando
      // ocorre tentativa de acesso não autenticado em outros MF
      //
      // Obs.: Não deve modificar as configurações padrões de
      // page do next-auth [...next-auth].ts dos MFs
      {
        source: '/(.*)/api/auth/signin',
        destination: `/api/auth/signin`,
        permanent: false,
      }
    ]
  },
}

module.exports = nextConfig
