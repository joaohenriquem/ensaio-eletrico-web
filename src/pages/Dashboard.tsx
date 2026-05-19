import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { useDashboard } from '../hooks/useDashboard'
import { STATUS_OS, STATUS_PROPOSTA } from '../utils/constants'
import { dataBr, formatarMoeda } from '../utils/formatters'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { STATUS_OS_COR } from '../utils/constants'

const COR_PIZZA = ['#f0a500', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return <p className="text-sm text-gray-400">Carregando dashboard...</p>
  if (!data) return null

  const osData = Object.entries(data.distribuicaoOs).map(([status, count]) => ({
    name: STATUS_OS[status] ?? status,
    value: count,
  }))

  const propostaData = Object.entries(data.distribuicaoPropostas).map(([status, count]) => ({
    name: STATUS_PROPOSTA[status] ?? status,
    value: count,
  }))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-[#1c1c2e]">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[
          { label: 'Clientes Ativos', v: data.clientesAtivos },
          { label: 'OS Abertas', v: data.osAbertas },
          { label: 'OS Concluídas', v: data.osConcluidas },
          { label: 'Total Relatórios', v: data.totalRelatorios },
          { label: 'Total Propostas', v: data.totalPropostas },
          { label: 'Propostas Aprovadas', v: data.propostasAprovadas },
          { label: 'Receita Aprovada', v: formatarMoeda(data.receitaAprovada) },
        ].map(({ label, v }) => (
          <div key={label} className="rounded-xl border-l-4 border-[#f0a500] bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-[#1c1c2e]">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Ordens de Serviço por Status">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={osData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {osData.map((_, i) => (
                  <Cell key={i} fill={COR_PIZZA[i % COR_PIZZA.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Propostas por Status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={propostaData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#f0a500" name="Propostas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Últimas 10 Ordens de Serviço">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500">
                <th className="pb-2 pr-4">Nº</th>
                <th className="pb-2 pr-4">Cliente</th>
                <th className="pb-2 pr-4">Tipo</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.osRecentes.map((os) => (
                <tr key={os._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-4 font-mono text-xs">{os.numero}</td>
                  <td className="py-2 pr-4">{os.cliente_nome}</td>
                  <td className="py-2 pr-4 text-xs text-gray-600">{os.tipo}</td>
                  <td className="py-2 pr-4">
                    <Badge label={STATUS_OS[os.status] ?? os.status} className={STATUS_OS_COR[os.status]} />
                  </td>
                  <td className="py-2 text-xs text-gray-500">{dataBr(os.data)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
