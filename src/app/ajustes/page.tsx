/**
 * @file src/app/ajustes/page.tsx
 * @description Interface visual para ajuste e recálculo dos dados da fazenda.
 * Reaproveita a estrutura visual de coleta, mas atua como uma ferramenta de edição.
 * Inclui proteção anti-spam com cooldown de 30 segundos nas requisições à API.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useFazendaStore } from '@/store/useFazendaStore';
import { fazendaSchema, FazendaFormData } from '@/lib/schemas';
import { Navbar } from '@/components/ui/Navbar'; // Assumindo que a Navbar existe
import { Info } from 'lucide-react';

const LabelComDica = ({ htmlFor, label, unidade, dica }: { htmlFor: string, label: string, unidade?: string, dica?: string }) => (
  <div className="flex items-center gap-2 mb-1">
    <label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700">
      {label} {unidade && <span className="text-gray-500 font-normal">({unidade})</span>}
    </label>
    {dica && (
      <div className="group relative flex items-center cursor-help">
        <Info className="w-4 h-4 text-primary" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
          {dica}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    )}
  </div>
);

export default function AjustesPage() {
  const { dadosFazenda, setDadosFazenda, setDiagnosticoIA } = useFazendaStore();
  
  // Inicializa o estado local com os dados da store (se existirem)
  const [formData, setFormData] = useState<Partial<FazendaFormData>>(dadosFazenda || {});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Efeito para gerir a contagem decrescente do botão
  useEffect(() => {
    if (cooldown > 0) {
      const timerId = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timerId); // Limpa o timeout se o componente desmontar ou atualizar
    }
  }, [cooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0 || isSubmitting) return; // Barreira de proteção extra

    setIsSubmitting(true);

    try {
      // 1. Validação Zod
      const dadosValidados = fazendaSchema.parse(formData);

      // 2. Requisição para o BFF (API Real)
      const response = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosValidados),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Falha ao processar análise.`);
      }

      const diagnostico = await response.json();

      // 3. Sucesso: Atualiza o Zustand e inicia Cooldown de 30s
      setDadosFazenda(dadosValidados);
      setDiagnosticoIA(diagnostico);
      setCooldown(30);
      
      // Feedback visual opcional
      alert('Dados atualizados com sucesso e análises refeitas!');

    } catch (error: any) {
      console.error('Erro na submissão:', error);
      alert(`Erro ao atualizar: ${error.message || 'Verifique os dados e tente novamente.'}`);
      setCooldown(0); // Reseta o cooldown imediatamente em caso de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se não houver dados, idealmente redirecionar ou mostrar aviso
  if (!dadosFazenda) {
    return <div className="p-8 text-center text-red-500 font-bold">Nenhum dado encontrado. Por favor, preencha o formulário inicial.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ajuste de Dados da Fazenda</h1>
          <p className="text-gray-600 mb-8">Modifique os valores abaixo para recalcular o diagnóstico. Limite de uma atualização a cada 30 segundos.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Bloco 1: Estrutura da Fazenda (Exemplo, adicione os outros baseados no seu page.tsx) */}
            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                Estrutura e Rebanho
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <LabelComDica htmlFor="nome_fazenda" label="Nome da Fazenda" />
                  <input
                    id="nome_fazenda" name="nome_fazenda" type="text" required
                    value={formData.nome_fazenda || ''} onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  />
                </div>
                <div>
                  <LabelComDica htmlFor="total_vacas" label="Total de Vacas" dica="Todo o rebanho leiteiro" />
                  <input
                    id="total_vacas" name="total_vacas" type="number" required
                    value={formData.total_vacas || ''} onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                  />
                </div>
                {/* NOTA: Cole o resto dos seus inputs do src/app/formulario/page.tsx aqui */}
              </div>
            </section>

            {/* Rodapé de Ações com Cooldown */}
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting || cooldown > 0}
                className={`font-bold py-3 px-10 rounded-lg shadow-md transition duration-200 ${
                  isSubmitting || cooldown > 0 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-primary hover:bg-primary-light text-white'
                }`}
              >
                {isSubmitting ? 'Calculando...' : cooldown > 0 ? `Aguarde ${cooldown}s...` : 'Atualizar Dados'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}