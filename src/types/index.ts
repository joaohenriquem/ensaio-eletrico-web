export interface Usuario {
  id: string
  username: string
  nome: string
  perfil: string
  foto_url?: string
}

export interface UsuarioAdmin {
  id: string
  nome: string
  email: string
  username: string
  perfil: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  foto_url?: string
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
  status: 'aberta' | 'em_andamento' | 'aprovada' | 'concluida' | 'reprovada' | 'cancelada'
  data: string
  tecnico?: string
  local?: string
  prioridade?: 'Normal' | 'Alta' | 'Urgente'
  descricao: string
  observacoes?: string
  obs_status?: string
  valor?: number
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
  fotos_verificacao_eletrica?: string[]
}

export interface Anexo {
  nome: string
  url: string
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
  conclusao?: string
  anexos?: Anexo[]
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

export interface Contrato {
  _id: string
  numero: string
  cliente_id?: string
  cliente_nome: string
  cliente_endereco?: string
  data: string
  qtd_paineis?: number
  locais_paineis?: string
  periodicidade?: string
  qtd_manutencoes?: number
  valor_total?: number
  forma_pagamento?: string
  vigencia_meses?: number
  data_inicio?: string
  data_fim?: string
  taxa_visita?: number
  cronograma_tempo?: string
  cronograma_horario?: string
  responsavel_tecnico?: string
  cft?: string
  guid?: string
  assinatura_contratada?: string
  nome_contratada?: string
  assinado_contratada_em?: string
  latitude_contratada?: number
  longitude_contratada?: number
  endereco_contratada?: string
  assinatura_contratante?: string
  nome_contratante?: string
  assinado_contratante_em?: string
  latitude_contratante?: number
  longitude_contratante?: number
  endereco_contratante?: string
  status: 'rascunho' | 'aguardando_assinatura' | 'assinado'
  criado_em?: string
}

export interface ContratoPublico {
  _id: string
  numero: string
  cliente_nome: string
  cliente_endereco?: string
  data: string
  qtd_paineis?: number
  locais_paineis?: string
  periodicidade?: string
  qtd_manutencoes?: number
  valor_total?: number
  forma_pagamento?: string
  vigencia_meses?: number
  data_inicio?: string
  data_fim?: string
  taxa_visita?: number
  cronograma_tempo?: string
  cronograma_horario?: string
  responsavel_tecnico?: string
  cft?: string
  guid?: string
  assinatura_contratada?: string
  nome_contratada?: string
  assinado_contratada_em?: string
  endereco_contratada?: string
  assinatura_contratante?: string
  nome_contratante?: string
  assinado_contratante_em?: string
  endereco_contratante?: string
  assinado: boolean
  assinado_em?: string
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

export interface MfaResponse {
  requiresMfa: true
  userId: string
  email: string
}

export interface LoginLog {
  id: string
  usuario_nome: string
  latitude?: number
  longitude?: number
  endereco?: string
  criado_em: string
}
