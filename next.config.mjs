/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ativa a compilação standalone para o Docker
  output: 'standalone',

  // Configuração de Proxy para evitar problemas de CORS e portas fechadas no Render
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // O proxy redireciona a requisição do navegador para o FastAPI rodando internamente no container
        destination: 'http://127.0.0.1:8000/:path*',
      },
    ]
  },
};

export default nextConfig;