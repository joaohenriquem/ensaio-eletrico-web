import { useNavigate } from 'react-router'
import { Users, ClipboardList, Wrench, FileText, Zap } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import { formatarMoeda } from '../utils/formatters'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function MetricCard({ label, value, color = '#f0a500' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" style={{ borderLeft: `4px solid ${color}` }}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#1e3050]">{value}</p>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { data, isLoading } = useDashboard()

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl bg-gradient-to-r from-[#1e3050] to-[#2a4570] p-6 text-white">
        <div className="flex items-center gap-3">
          <Zap size={32} className="text-[#f0a500]" />
          <div>
            <h1 className="text-2xl font-bold text-[#f0a500]">ENSAIO ELÉTRICO</h1>
            <p className="text-white/70">Sistema de Gestão Operacional</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Carregando métricas...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <MetricCard label="Clientes Ativos" value={data?.clientesAtivos ?? 0} />
          <MetricCard label="OS Abertas" value={data?.osAbertas ?? 0} color="#3b82f6" />
          <MetricCard label="Relatórios" value={data?.totalRelatorios ?? 0} color="#8b5cf6" />
          <MetricCard
            label="Propostas Aprovadas"
            value={data?.propostasAprovadas ?? 0}
            color="#22c55e"
          />
        </div>
      )}

      {data && (
        <Card>
          <p className="mb-1 text-sm text-gray-500">Receita Aprovada (propostas)</p>
          <p className="text-xl font-bold text-[#f0a500]">{formatarMoeda(data.receitaAprovada)}</p>
        </Card>
      )}

      <Card title="Ações Rápidas">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Button onClick={() => navigate('/ordens')}>
            <ClipboardList size={16} /> Nova OS
          </Button>
          <Button onClick={() => navigate('/relatorios')}>
            <Wrench size={16} /> Novo Relatório
          </Button>
          <Button onClick={() => navigate('/propostas')}>
            <FileText size={16} /> Nova Proposta
          </Button>
          <Button onClick={() => navigate('/clientes')}>
            <Users size={16} /> Novo Cliente
          </Button>
        </div>
      </Card>
    </div>
  )
}
