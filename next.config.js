/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // MF que tem todas as rotas autenticadas
      //
      // Obs.: Cada deve configurar o próprio middleware com next-auth
      // {
      //   source: "/auth-only",
      //   destination: `${MF_AUTH_ONLY}/auth-only`,
      // },
      // {
      //   source: "/auth-only/:path",
      //   destination: `${MF_AUTH_ONLY}/auth-only/:path*`,
      // },
      //
      // -------------------------------------------------------------------
      //
      // MF que tem rotas públicas e autenticadas
      // {
      //   source: "/mixed",
      //   destination: `${MF_MIXED}/mixed`,
      // },
      // {
      //   source: "/mixed/:path",
      //   destination: `${MF_MIXED}/mixed/:path*`,
      // },
      // MF que tem todas as rotas de acesso públicos
      //
      // -------------------------------------------------------------------
      //
      // Obs.: O código abaixo consegue manipular todas as rotas base da URL
      // logo para que as demais rotas como /mixed e /auth-only funcionem
      // esse objeto SEMPRE deve ser o último da lista, caso contrário
      // nenhum outro MF vai conseguir se conectar
      {
        source: "/", // grupo de controle
        destination: "https://gentle-grass-06d7e0a10.5.azurestaticapps.net", // MF responsável
      },
      // O objeto abaixo pode levar a comportamentos inesperados
      // devido a possibilidade de conflito com as demais rotas
      // caso tenham os mesmos nomes, para evitar isso, esse deve ser o último
      // item dos rewrites, assim conflitos de rotas iram priorizar as demais
      {
        source: "/:path",
        destination: "https://gentle-grass-06d7e0a10.5.azurestaticapps.net/:path*",
      },
    ]
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
