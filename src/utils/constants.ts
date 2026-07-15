export const STATUS_OS: Record<string, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em Andamento',
  aprovada: 'Aprovada',
  concluida: 'Concluída',
  reprovada: 'Reprovada',
  cancelada: 'Cancelada',
}

export const STATUS_OS_COR: Record<string, string> = {
  aberta: 'bg-yellow-100 text-yellow-800',
  em_andamento: 'bg-blue-100 text-blue-800',
  aprovada: 'bg-emerald-100 text-emerald-800',
  concluida: 'bg-green-100 text-green-800',
  reprovada: 'bg-orange-100 text-orange-800',
  cancelada: 'bg-red-100 text-red-800',
}

export const STATUS_PROPOSTA: Record<string, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviada',
  aprovado: 'Aprovada',
  rejeitado: 'Rejeitada',
}

export const STATUS_PROPOSTA_COR: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  enviado: 'bg-blue-100 text-blue-800',
  aprovado: 'bg-green-100 text-green-800',
  rejeitado: 'bg-red-100 text-red-800',
}

export const STATUS_CONTRATO: Record<string, string> = {
  rascunho: 'Rascunho',
  aguardando_assinatura: 'Aguardando Assinatura',
  assinado: 'Assinado',
}

export const STATUS_CONTRATO_COR: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  aguardando_assinatura: 'bg-blue-100 text-blue-800',
  assinado: 'bg-green-100 text-green-800',
}

export const STATUS_RELATORIO: Record<string, string> = {
  rascunho: 'Rascunho',
  finalizado: 'Finalizado',
}

export const STATUS_RELATORIO_COR: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  finalizado: 'bg-green-100 text-green-800',
}

export const TIPOS_OS = [
  'Manutenção Preventiva',
  'Manutenção Corretiva',
  'Instalação Elétrica',
  'Troca de Lâmpadas / Fotocélulas',
  'Inspeção Elétrica',
  'Projeto Elétrico',
  'Outro',
]

export const TIPOS_PAINEL = [
  'Subsolo',
  'Térreo',
  'Barrilete + B. Incêndio',
  'Guarita',
  'Cobertura',
  'Outro',
]

export const NORMAS_PADRAO = [
  'NBR 5410 – Instalações Elétricas de Baixa Tensão em Edificações',
  'NR-10 – Segurança para Instalações e Serviços em Eletricidade',
  'NR-33 – Segurança e Saúde nos Trabalhos em Espaços Confinados',
  'NR-35 – Trabalho em Altura',
  'ABNT NBR 17019 – Requisitos para instalação de pontos de recarga de veículos elétricos',
  'IEC 61851 – Sistemas de recarga condutiva de veículos elétricos',
]

export const ITENS_INSPECAO_VISUAL: Record<string, string> = {
  verificacao_aquecimento: 'Verificação de Aquecimento',
  integridade_barramentos: 'Integridade dos Barramentos',
  estado_disjuntores: 'Estado dos Disjuntores',
  estado_cabos_isolacao: 'Estado de Cabos e Isolação',
  identificacao_circuitos: 'Identificação de Circuitos',
  acrilico_protecao: 'Acrílico de Proteção',
}

export const ITENS_LIMPEZA: Record<string, string> = {
  remocao_poeira: 'Remoção de Poeira',
  limpeza_barramentos: 'Limpeza de Barramentos',
  componentes_eletricos: 'Componentes Elétricos',
}

export const ITENS_REAPERTO: Record<string, string> = {
  reaperto_bornes: 'Reaperto de Bornes',
  reaperto_barramentos: 'Reaperto de Barramentos',
  reaperto_disjuntores: 'Reaperto de Disjuntores',
  reaperto_contatores: 'Reaperto de Contatores',
}

export const ITENS_VERIFICACAO_ELETRICA: Record<string, string> = {
  medicao_tensao: 'Medição de Tensão',
  medicao_corrente: 'Medição de Corrente',
  equilibrio_fases: 'Equilíbrio de Fases',
  continuidade_condutor_pe: 'Continuidade Condutor (PE)',
}

export const OBJETIVO_PADRAO =
  'Realizar manutenção preventiva em painéis elétricos com o objetivo de garantir a segurança, confiabilidade operacional, ' +
  'continuidade do fornecimento de energia e prevenção de falhas. Também apontar melhorias para segurança de acordo com as normas ' +
  'vigentes, observando e propondo ações corretivas quando houver necessidade. Por fim, executar troca de lâmpadas queimadas, ' +
  'fotocélula, sensores de presença e até mesmo tomadas 10A/20A que apresentar defeito.'

export const CONCLUSAO_PADRAO =
  'Após a manutenção preventiva, os painéis elétricos encontram-se em condições operacionais seguras, com necessidade de ajustes ' +
  'pontuais conforme descrito nas não conformidades. Foi verificado circuitos de iluminação das áreas comuns e efetuado troca de ' +
  'lâmpadas queimadas. As devidas recomendações seguirão de propostas corretivas havendo solicitação das mesmas.'

export function painelVazio(nome = 'Novo Painel') {
  return {
    nome,
    tipo: 'Térreo',
    inspecao_visual: Object.fromEntries(
      Object.keys(ITENS_INSPECAO_VISUAL).map((k) => [k, 'conforme'])
    ),
    limpeza_tecnica: Object.fromEntries(
      Object.keys(ITENS_LIMPEZA).map((k) => [k, 'conforme'])
    ),
    reaperto_mecanico: Object.fromEntries(
      Object.keys(ITENS_REAPERTO).map((k) => [k, 'conforme'])
    ),
    verificacao_eletrica: {
      medicao_tensao: '220V',
      medicao_corrente: '',
      equilibrio_fases: 'conforme',
      continuidade_condutor_pe: 'conforme',
    },
    nao_conformidades: '',
    recomendacoes: '',
    fotos_inspecao_visual: [],
    fotos_limpeza_tecnica: [],
    fotos_reaperto_mecanico: [],
  }
}
