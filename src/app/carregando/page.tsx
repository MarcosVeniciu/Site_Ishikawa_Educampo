/**
 * @file page.tsx (Carregando)
 * @description Tela de transição e processamento de dados.
 * Responsabilidades:
 * 1. Recuperar os dados da fazenda salvos no Zustand.
 * 2. Enviar os dados para as APIs internas (BFF) de Diagnóstico e Simulação em paralelo.
 * 3. Gerenciar o estado de espera visual do usuário com feedback elegante.
 * 4. Salvar os resultados retornados no estado global e redirecionar para a Tela de Diagnóstico.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFazendaStore } from "@/store/useFazendaStore"; 
import Image from "next/image";

export default function CarregandoPage() {
  const router = useRouter();
  const { dadosFazenda, setDiagnosticoIA, setResultadoSimulacao } = useFazendaStore();
  const [mensagem, setMensagem] = useState("Verificando conexão");
  const [dots, setDots] = useState("");
  const processamentoIniciado = useRef(false);

  // Efeito para criar a animação dos "3 pontinhos"
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!dadosFazenda) {
      router.push("/formulario");
      return;
    }

    if (processamentoIniciado.current) return;
    processamentoIniciado.current = true;

    const processarAnalise = async () => {
      try {
        setMensagem("A Inteligência Artificial está projetando seus cenários");

        // Prepara os payloads para as duas requisições
        const payloadSimulacao = {
          sistema_producao: dadosFazenda.sistema_producao,
          regiao_sebrae: dadosFazenda.regiao,
          total_vacas: dadosFazenda.total_vacas,
          vacas_lactacao: dadosFazenda.vacas_lactacao,
          area_atividade: dadosFazenda.area_atividade,
          numero_trabalhadores: dadosFazenda.mao_obra_total,
          custo_concentrado: dadosFazenda.preco_concentrado || 1.81,
          producao_vaca: dadosFazenda.producao_vaca,
          preco_recebido: dadosFazenda.preco_leite,
          ccs: dadosFazenda.ccs,
        };

        // Dispara as duas requisições em paralelo para otimizar o tempo de espera
        const [diagResponse, simResponse] = await Promise.all([
          fetch("/api/diagnostico", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosFazenda),
          }),
          fetch("/api/simulacao", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadSimulacao),
          }),
        ]);

        if (!diagResponse.ok || !simResponse.ok) {
          throw new Error("Erro na comunicação com os servidores de análise.");
        }

        const diagData = await diagResponse.json();
        const simData = await simResponse.json();

        // Injeta os dois resultados no estado global
        setDiagnosticoIA(diagData);
        setResultadoSimulacao(simData);

        setMensagem("Análise concluída! Montando seu Diagnóstico");

        // Pequeno delay para garantir que o usuário veja a conclusão antes da troca de tela
        setTimeout(() => router.push("/diagnostico"), 1500);
      } catch (error) {
        console.error("Falha no processamento:", error);
        setMensagem("Ocorreu um erro ao processar os dados. Redirecionando");
        setTimeout(() => router.push("/formulario"), 3000);
      }
    };

    /**
     * @description Interroga o servidor até que ele esteja pronto (Trata Cold Start e Rate Limit).
     */
    const verificarSaude = async () => {
      try {
        const res = await fetch("/api/health");

        if (res.status === 429) {
          setMensagem("Muitas requisições. Aguardando liberação");
          setTimeout(verificarSaude, 5000);
          return;
        }

        if (res.status === 403) {
          setMensagem("Acesso negado: Chave de API inválida");
          setTimeout(() => router.push("/formulario"), 3000);
          return;
        }

        if (res.status === 503) {
          setMensagem("Serviço indisponível: Falha nos recursos");
          setTimeout(() => router.push("/formulario"), 3000);
          return;
        }

        if (res.ok) {
          const data = await res.json().catch(() => ({}));

          if (data.status === "warming_up" || data.ml_api === "waking_up") {
            setMensagem("Simulador de custos inicializando");
            setTimeout(verificarSaude, 3000);
            return;
          }

          if (data.status === "healthy") {
            processarAnalise();
            return;
          }
        }

        // Fallback: se respondeu 502/504 (Gateway timeout) indicando que a nuvem está subindo.
        setMensagem("Esperando API acordar");
        setTimeout(verificarSaude, 3000);
      } catch (error) {
        // Erro de rede (API completamente offline ou em reboot profundo)
        setMensagem("Esperando API acordar");
        setTimeout(verificarSaude, 3000);
      }
    };

    verificarSaude();
  }, [dadosFazenda, router, setDiagnosticoIA, setResultadoSimulacao]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-fundo p-6">
      <div className="w-full max-w-md text-center space-y-8 animate-pulse">
        {/* Logo Educampo para reforço de marca */}
        <div className="relative h-20 w-48 mx-auto">
          <Image
            src="/logo_educampo.png"
            alt="Logo Educampo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Spinner Visual */}
        <div className="flex justify-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-secondary flex items-center justify-center">
            <span>{mensagem}</span>
            <span className="w-6 text-left">{dots}</span>
          </h2>
          <p className="text-sm text-gray-500">
            Isso pode levar alguns segundos, estamos cruzando seus dados com o benchmarking do setor.
          </p>
        </div>
      </div>
    </main>
  );
}