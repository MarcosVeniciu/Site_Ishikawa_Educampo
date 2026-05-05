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
import { Info } from 'lucide-react';

/**
 * @description Componente interno para renderizar o rótulo com unidade e tooltip de ajuda.
 */
const LabelComDica = ({ htmlFor, label, unidade, dica }: { htmlFor: string, label: string, unidade?: string, dica?: string }) => (
  <div className="flex items-center gap-2 mb-1">
    <label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700">
      {label} {unidade && <span className="text-gray-400 font-normal">({unidade})</span>}
    </label>
    {dica && (
      <div className="group relative flex items-center">
        <Info size={15} className="text-primary cursor-help hover:text-primary-light transition-colors" />
        <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2.5 rounded shadow-lg w-56 bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 text-center font-normal leading-relaxed">
          {dica}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    )}
  </div>
);

interface InputComDicaProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unidade?: string;
  dica?: string;
}

/**
 * @description Componente de entrada com rótulo, unidade, dica de ajuda e placeholder padronizado.
 */
const InputComDica: React.FC<InputComDicaProps> = ({ label, unidade, dica, placeholder, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    <LabelComDica htmlFor={props.id as string} label={label} unidade={unidade} dica={dica} />
    <input
      {...props}
      placeholder={placeholder ? `Ex: ${placeholder}` : ''}
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-300 ${props.className || ''}`}
    />
  </div>
);

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
              <InputComDica 
                id="nomeFazenda" name="nomeFazenda" type="text" 
                label="Nome da Fazenda"
                placeholder="Fazenda Leiteira Experimental"
                dica="Nome de identificação da sua propriedade."
                value={formData.nomeFazenda} onChange={handleChange} required maxLength={100}
              />
              <div className="flex flex-col gap-1 w-full">
                <LabelComDica 
                  htmlFor="sistemaProducao" 
                  label="Sistema de Produção" 
                  dica="Modelo de confinamento ou pastagem adotado na propriedade." 
                />
                <select 
                  id="sistemaProducao" name="sistemaProducao" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.sistemaProducao} onChange={handleChange} required
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
              <InputComDica 
                id="totalVacas" name="totalVacas" type="number" 
                label="Total de Vacas" unidade="cab." placeholder="100"
                dica="Quantidade total de vacas (secas e em lactação)."
                value={formData.totalVacas} onChange={handleChange} min={0} max={50000} required 
              />
              <InputComDica 
                id="vacasLactacao" name="vacasLactacao" type="number" 
                label="Vacas em Lactação" unidade="cab." placeholder="85"
                dica="Apenas as vacas que estão produzindo leite atualmente."
                value={formData.vacasLactacao} onChange={handleChange} min={0} max={50000} required 
              />
              <InputComDica 
                id="totalAnimais" name="totalAnimais" type="number" 
                label="Total no Rebanho" unidade="cab." placeholder="150"
                dica="Todas as categorias de animais do rebanho leiteiro."
                value={formData.totalAnimais} onChange={handleChange} min={0} max={100000} required 
              />
              <InputComDica 
                id="areaAtividade" name="areaAtividade" type="number" step="0.01" 
                label="Área da Atividade" unidade="ha" placeholder="10.0"
                dica="Área total destinada à pecuária de leite em hectares."
                value={formData.areaAtividade} onChange={handleChange} min={0.1} max={50000} required 
              />
              <div className="md:col-span-2">
                <InputComDica 
                  id="maoDeObra" name="maoDeObra" type="number" 
                  label="Mão de Obra Total" unidade="trabalhadores" placeholder="3"
                  dica="Número total de trabalhadores envolvidos na atividade leiteira."
                  value={formData.maoDeObra} onChange={handleChange} min={1} max={1000} required 
                />
              </div>
            </div>
          </section>

          {/* Quadrante 3: Produção e Qualidade */}
          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Produção e Qualidade</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputComDica 
                id="producaoPorVaca" name="producaoPorVaca" type="number" step="0.01" 
                label="Prod. por Vaca" unidade="L/dia" placeholder="35.0"
                dica="Média de litros produzidos por vaca em lactação."
                value={formData.producaoPorVaca} onChange={handleChange} min={0} max={100} required 
              />
              <div>
                <InputComDica 
                  id="ccs" name="ccs" type="number" 
                  label="Qualidade" unidade="CCS x1000" placeholder="150"
                  dica="Importante: Digite apenas os primeiros números. Ex: Para 150.000, digite 150."
                  value={formData.ccs} onChange={handleChange} min={0} max={9999} required 
                />
                <p className="text-xs text-gray-500 mt-1.5 ml-1">Informe o valor simplificado. O sistema multiplicará por 1.000 automaticamente.</p>
              </div>
              <InputComDica 
                id="precoLeite" name="precoLeite" type="number" step="0.01" 
                label="Preço Recebido" unidade="R$/L" placeholder="3.20"
                dica="Valor bruto recebido pelo litro do leite."
                value={formData.precoLeite} onChange={handleChange} min={0} max={15} required 
              />
              <InputComDica 
                id="precoReferencia" name="precoReferencia" type="number" step="0.01" 
                label="Preço de Referência" unidade="R$/L" placeholder="2.50"
                dica="Preço base ou média regional para comparação."
                value={formData.precoReferencia} onChange={handleChange} min={0} max={15} required 
              />
              <div className="md:col-span-2">
                <div className="flex flex-col gap-1 w-full">
                  <LabelComDica 
                    htmlFor="regiao" 
                    label="Região" 
                    dica="Região da fazenda para balizar comparações com o mercado local." 
                  />
                  <select 
                    id="regiao" name="regiao" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
                    value={formData.regiao} onChange={handleChange} required
                  >
                  <option value="">Selecione a região</option>
                  <option value="triangulo">Triângulo Mineiro</option>
                  <option value="rio doce e vale do aco">Rio Doce e Vale do Aço</option>
                  <option value="noroeste e alto paranaiba">Noroeste e Alto Paranaíba</option>
                  <option value="centro">Centro</option>
                  <option value="centro-oeste e sudoeste">Centro-Oeste e Sudoeste</option>
                  <option value="sul">Sul</option>
                  <option value="norte">Norte</option>
                  <option value="zona da mata e vertentes">Zona da Mata e Vertentes</option>
                  <option value="jequitinhonha e mucuri">Jequitinhonha e Mucuri</option>
                </select>
              </div>
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

        {/* --- INÍCIO: PREENCHIMENTO AUTOMÁTICO PARA TESTES (REMOVER EM PRODUÇÃO - basta excluir esse bloco) --- */}
        <div className="mt-12 flex justify-center border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => setFormData({
              nomeFazenda: 'Fazenda Auto Teste',
              sistemaProducao: 'compost barn',
              totalVacas: '100',
              vacasLactacao: '85',
              totalAnimais: '120',
              areaAtividade: '10.0',
              maoDeObra: '2',
              producaoPorVaca: '35.0',
              precoLeite: '3.20',
              precoReferencia: '2.50',
              ccs: '150',
              regiao: 'triangulo',
            })}
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 font-medium py-2 px-4 rounded-md transition-colors"
          >
            🧪 Preenchimento Automático (DEV)
          </button>
        </div>
        {/* --- FIM: PREENCHIMENTO AUTOMÁTICO --- */}
      </main>
    </div>
  );
}