export interface Usuario {
  id: string
  username: string
  nome: string
  perfil: string
}

export interface UsuarioAdmin {
  id: string
  nome: string
  email: string
  username: string
  perfil: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  criado_em?: string
}

export interface Cliente {
  _id: string
  nome: string
  endereco?: string
  cidade?: string
  estado?: string
  contato?: string
  telefone?: string
  email?: string
  sindico?: string
  torres?: number
  observacoes?: string
  ativo: boolean
  criado_em?: string
}

export interface OrdemServico {
  _id: string
  numero: string
  cliente_id?: string
  cliente_nome: string
  tipo: string
  status: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada'
  data: string
  tecnico?: string
  local?: string
  prioridade?: 'Normal' | 'Alta' | 'Urgente'
  descricao: string
  observacoes?: string
  obs_status?: string
  criado_em?: string
}

export interface PainelChecklist {
  [key: string]: string
}

export interface VerificacaoEletrica {
  medicao_tensao: string
  medicao_corrente: string
  equilibrio_fases: string
  continuidade_condutor_pe: string
  [key: string]: string
}

export interface Painel {
  nome: string
  tipo: string
  inspecao_visual: PainelChecklist
  limpeza_tecnica: PainelChecklist
  reaperto_mecanico: PainelChecklist
  verificacao_eletrica: VerificacaoEletrica
  nao_conformidades: string
  recomendacoes: string
  fotos_inspecao_visual?: string[]
  fotos_limpeza_tecnica?: string[]
  fotos_reaperto_mecanico?: string[]
}

export interface Relatorio {
  _id: string
  numero: string
  cliente_id?: string
  cliente_nome: string
  local: string
  endereco?: string
  data: string
  tecnico?: string
  cft?: string
  trt?: string
  normas?: string[]
  objetivo?: string
  paineis?: Painel[]
  tomadas?: string
  iluminacao?: string
  conclusao?: string
  assinatura?: string
  nome_aprovador?: string
  assinatura_contratado?: string
  nome_contratado?: string
  status: 'rascunho' | 'finalizado'
  criado_em?: string
}

export interface InvestimentoItem {
  descricao: string
  valor: number
}

export interface Proposta {
  _id: string
  numero: string
  cliente_id?: string
  cliente_nome: string
  cliente_endereco?: string
  data: string
  descricao: string
  objetivo?: string
  servicos?: string[]
  materiais?: string[]
  etapas?: string[]
  normas?: string[]
  prazo?: string
  garantia?: string
  condicoes_pagamento?: string
  investimento?: InvestimentoItem[]
  total?: number
  assinatura?: string
  nome_aprovador?: string
  assinatura_contratado?: string
  nome_contratado?: string
  fotos?: string[]
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado'
  criado_em?: string
}

export interface DashboardStats {
  clientesAtivos: number
  osAbertas: number
  osConcluidas: number
  totalRelatorios: number
  totalPropostas: number
  propostasAprovadas: number
  receitaAprovada: number
  osRecentes: OrdemServico[]
  distribuicaoOs: Record<string, number>
  distribuicaoPropostas: Record<string, number>
}

export interface LoginResponse {
  token: string
  user: Usuario
}
