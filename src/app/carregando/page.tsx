/**
 * @file page.tsx (Carregando)
 * @description Tela de transição e processamento de dados.
 * Responsabilidades:
 * 1. Recuperar os dados da fazenda salvos no Zustand.
 * 2. Enviar os dados para a API interna (BFF).
 * 3. Gerenciar o estado de espera visual do usuário com feedback elegante.
 * 4. Salvar o diagnóstico retornado no estado global e redirecionar para o Dashboard.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFazendaStore } from "@/store/useFazendaStore";
import Image from "next/image";

export default function CarregandoPage() {
  const router = useRouter();
  const { dadosFazenda, setDiagnostico } = useFazendaStore();
  const [mensagem, setMensagem] = useState("Preparando análise...");

  useEffect(() => {
    /**
     * @description Função assíncrona para disparar a análise assim que a tela monta.
     * Caso não existam dados na store (acesso direto à URL), redireciona para o formulário.
     */
    const processarAnalise = async () => {
      if (!dadosFazenda) {
        router.push("/formulario");
        return;
      }

      try {
        setMensagem("A Inteligência Artificial está analisando seus dados...");
        
        const response = await fetch("/api/diagnostico", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosFazenda),
        });

        if (!response.ok) throw new Error("Erro na comunicação com o servidor.");

        const data = await response.json();
        
        // Injeta o diagnóstico real retornado da API Python no estado global
        setDiagnostico(data);
        
        setMensagem("Análise concluída! Montando seu Dashboard...");
        
        // Pequeno delay para garantir que o usuário veja a conclusão antes da troca de tela
        setTimeout(() => router.push("/dashboard"), 1500);

      } catch (error) {
        console.error("Falha no processamento:", error);
        setMensagem("Ocorreu um erro ao processar os dados. Redirecionando...");
        setTimeout(() => router.push("/formulario"), 3000);
      }
    };

    processarAnalise();
  }, [dadosFazenda, router, setDiagnostico]);

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
          <h2 className="text-xl font-bold text-secondary">{mensagem}</h2>
          <p className="text-sm text-gray-500">
            Isso pode levar alguns segundos, estamos cruzando seus dados com o benchmarking do setor.
          </p>
        </div>
      </div>
    </main>
  );
}