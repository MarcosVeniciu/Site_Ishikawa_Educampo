import { Tractor } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-slate-50">
      <div className="flex flex-col items-center text-center space-y-6 bg-white p-12 rounded-2xl shadow-sm border border-slate-100">
        <div className="p-4 bg-green-100 rounded-full">
          <Tractor className="w-12 h-12 text-green-700" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Bem-vindo ao Ishikawa Educampo
        </h1>
        
        <p className="text-lg text-slate-600 max-w-lg">
          A estrutura inicial do seu projeto Next.js está configurada e rodando com sucesso.
        </p>
      </div>
    </main>
  );
}
