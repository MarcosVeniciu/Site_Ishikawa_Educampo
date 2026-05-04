/**
 * @file src/app/formulario/page.tsx
 * @description Interface visual de coleta de dados da fazenda.
 * * COMO FUNCIONA:
 * 1. O componente renderiza um layout de formulário dividido em três categorias
 * lógicas (Informações Gerais, Estrutura e Rebanho, Produção e Qualidade).
 * 2. Utiliza estado local para capturar as entradas do usuário.
 * 3. Ao submeter, valida os dados (aqui interceptaremos os erros se houver). Se válidos,
 * injeta os dados na `useFazendaStore` (Zustand) e redireciona o usuário
 * para a tela de carregamento via `useRouter`.
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFazendaStore } from '@/store/useFazendaStore';
import { fazendaSchema } from '@/lib/schemas';

export default function FormularioPage() {
  const router = useRouter();
  const setDadosFazenda = useFazendaStore((state: any) => state.setDadosFazenda);

  // Estados dos formulários (tipados e inicializados)
  const [formData, setFormData] = useState({
    nomeFazenda: '',
    sistemaProducao: '',
    totalVacas: '',
    vacasLactacao: '',
    totalAnimais: '',
    areaAtividade: '',
    maoDeObra: '',
    producaoPorVaca: '',
    precoLeite: '',
    precoReferencia: '',
    ccs: '',
    regiao: '',
  });

  const [erros, setErros] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErros([]);

    // Mapeamento e conversão de tipos para o formato esperado pelo schema
    const dadosParaValidar = {
      nomeFazenda: formData.nomeFazenda,
      sistemaProducao: formData.sistemaProducao,
      totalVacas: Number(formData.totalVacas),
      vacasLactacao: Number(formData.vacasLactacao),
      animaisRebanho: Number(formData.totalAnimais),
      areaAtividade: Number(formData.areaAtividade),
      maoObraTotal: Number(formData.maoDeObra),
      producaoVaca: Number(formData.producaoPorVaca),
      precoLeite: Number(formData.precoLeite),
      precoRegional: Number(formData.precoReferencia),
      ccs: Number(formData.ccs),
      regiao: formData.regiao,
    };

    // Validação real usando o Schema centralizado do projeto
    const validacao = fazendaSchema.safeParse(dadosParaValidar);

    if (!validacao.success) {
      // Garante suporte robusto para extrair a lista de erros, evitando falhas de prototype no JSDOM
      const errorData = validacao.error as any;
      const errorList = Array.isArray(errorData) ? errorData : (errorData?.issues || errorData?.errors || [{ message: 'Dados inválidos', path: ['Formulário'] }]);
      
      // Mapeia os erros do Zod para mensagens amigáveis na interface
      const mensagensErro = errorList.map((err: any) => {
        const path = err.path && Array.isArray(err.path) ? err.path.join(' ') : 'Campo';
        return `${path}: ${err.message}`;
      });
      
      setErros(mensagensErro);
      return;
    }

    // Se for sucesso, os dados já vêm tipados e tratados pelo Zod
    setDadosFazenda(validacao.data);
    router.push('/carregando');
  };

  return (
    <div className="min-h-screen bg-fundo-alt pb-12">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image 
            src="/banner_educampo.png" 
            alt="Educampo Logo" 
            width={180} 
            height={50} 
            className="object-contain"
            priority
          />
          <h1 className="text-xl font-semibold text-primary">Diagnóstico de Fazenda</h1>
        </div>
      </header>

      {/* Container Principal */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Box de Erros de Validação */}
        {erros.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm">
            <h3 className="font-bold">Atenção (Inválido):</h3>
            <ul className="list-disc ml-5 mt-2">
              {erros.map((erro, index) => (
                <li key={index}>{erro}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Quadrante 1: Informações Gerais */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Informações Gerais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nomeFazenda" className="block text-sm font-medium text-gray-700 mb-2">Nome da Fazenda</label>
                <input 
                  id="nomeFazenda" name="nomeFazenda" type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Ex: Fazenda Leiteira Experimental"
                  value={formData.nomeFazenda} onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="sistemaProducao" className="block text-sm font-medium text-gray-700 mb-2">Sistema de Produção</label>
                <select 
                  id="sistemaProducao" name="sistemaProducao" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  value={formData.sistemaProducao} onChange={handleChange}
                >
                  <option value="">Selecione o sistema</option>
                  <option value="semi confinado">Semi-confinado</option>
                  <option value="compost barn">Compost Barn</option>
                  <option value="confinado">Confinado</option>
                </select>
              </div>
            </div>
          </section>

          {/* Quadrante 2: Estrutura e Rebanho */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Estrutura e Rebanho</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="totalVacas" className="block text-sm font-medium text-gray-700 mb-2">Total de Vacas (cabeças)</label>
                <input id="totalVacas" name="totalVacas" type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.totalVacas} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="vacasLactacao" className="block text-sm font-medium text-gray-700 mb-2">Vacas em Lactação (cabeças)</label>
                <input id="vacasLactacao" name="vacasLactacao" type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.vacasLactacao} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="totalAnimais" className="block text-sm font-medium text-gray-700 mb-2">Total de Animais no Rebanho (cabeças)</label>
                <input id="totalAnimais" name="totalAnimais" type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.totalAnimais} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="areaAtividade" className="block text-sm font-medium text-gray-700 mb-2">Área da Atividade (hectares)</label>
                <input id="areaAtividade" name="areaAtividade" type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.areaAtividade} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="maoDeObra" className="block text-sm font-medium text-gray-700 mb-2">Mão de Obra Total (trabalhadores)</label>
                <input id="maoDeObra" name="maoDeObra" type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.maoDeObra} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Quadrante 3: Produção e Qualidade */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Produção e Qualidade</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="producaoPorVaca" className="block text-sm font-medium text-gray-700 mb-2">Produção por Vaca (L/dia)</label>
                <input id="producaoPorVaca" name="producaoPorVaca" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.producaoPorVaca} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="ccs" className="block text-sm font-medium text-gray-700 mb-2">CCS</label>
                <input id="ccs" name="ccs" type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.ccs} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="precoLeite" className="block text-sm font-medium text-gray-700 mb-2">Preço do Leite (R$)</label>
                <input id="precoLeite" name="precoLeite" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.precoLeite} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="precoReferencia" className="block text-sm font-medium text-gray-700 mb-2">Preço de Referência (R$)</label>
                <input id="precoReferencia" name="precoReferencia" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.precoReferencia} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="regiao" className="block text-sm font-medium text-gray-700 mb-2">Região</label>
                <select id="regiao" name="regiao" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.regiao} onChange={handleChange}>
                  <option value="">Selecione a região</option>
                  <option value="triangulo">Triângulo Mineiro</option>
                  <option value="sul">Sul de Minas</option>
                  <option value="outra">Outra</option>
                </select>
              </div>
            </div>
          </section>

          {/* Rodapé de Ações */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-10 rounded-lg shadow-md transition duration-200"
            >
              Avançar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}