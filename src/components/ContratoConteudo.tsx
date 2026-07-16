import { PenLine } from 'lucide-react'
import { dataBr, formatarMoeda } from '../utils/formatters'
import equipe from '../static/equipe.png'

// Campos variáveis do contrato — o texto das cláusulas é fixo (template)
export interface DadosContrato {
  numero?: string
  cliente_nome?: string
  cliente_endereco?: string
  data?: string
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
}

// Padrão visual do modelo: títulos de seção em azul
function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-bold text-[#1a4b9c]">{titulo}</h3>
      <div className="mt-2 flex flex-col gap-2 text-[13px] leading-relaxed text-gray-700">{children}</div>
    </section>
  )
}

export function BlocoAssinatura({ assinatura, papel, nome, assinadoEm, localizacao, fallback }: {
  assinatura?: string
  papel: string
  nome?: string
  assinadoEm?: string
  localizacao?: string
  fallback: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-24 w-full items-center justify-center rounded-lg border border-gray-200 bg-white overflow-hidden">
        {assinatura ? (
          <img src={assinatura} alt={`Assinatura – ${papel}`} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-gray-300">
            <PenLine size={13} /> Aguardando assinatura
          </span>
        )}
      </div>
      <p className="text-[11px] font-bold text-[#1c1c2e] text-center">{papel}</p>
      <p className="text-xs text-gray-600 text-center">{nome || fallback}</p>
      {assinadoEm && (
        <p className="text-[10px] text-gray-400 text-center">
          Assinado digitalmente em {new Date(assinadoEm).toLocaleString('pt-BR')}
          {localizacao ? ` — ${localizacao}` : ''}
        </p>
      )}
    </div>
  )
}

export function AssinaturasContrato({ contrato }: { contrato: DadosContrato }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BlocoAssinatura
          assinatura={contrato.assinatura_contratante}
          papel="CLIENTE (CONTRATANTE)"
          nome={contrato.nome_contratante}
          assinadoEm={contrato.assinado_contratante_em}
          localizacao={contrato.endereco_contratante}
          fallback="Assinatura do Cliente"
        />
        <BlocoAssinatura
          assinatura={contrato.assinatura_contratada}
          papel="TÉCNICO RESPONSÁVEL (CONTRATADA)"
          nome={contrato.nome_contratada}
          assinadoEm={contrato.assinado_contratada_em}
          localizacao={contrato.endereco_contratada}
          fallback="Assinatura do Técnico"
        />
      </div>
      {contrato.guid && (
        <p className="text-center text-[10px] text-gray-400">ID do documento: {contrato.guid}</p>
      )}
    </div>
  )
}

export default function ContratoConteudo({ contrato }: { contrato: DadosContrato }) {
  const qtd = contrato.qtd_paineis ?? 0
  const locais = contrato.locais_paineis ?? ''
  const qtdManut = contrato.qtd_manutencoes ?? 0

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-base font-bold text-[#1c1c2e]">PROPOSTA TÉCNICA COMERCIAL</h2>
        <p className="text-xs text-gray-500">Serviços de Manutenção Elétrica{contrato.numero ? ` · ${contrato.numero}` : ''}</p>
      </div>

      <h2 className="text-center text-sm font-bold text-[#1a4b9c]">Proposta Técnica e Comercial</h2>

      <section>
        <h3 className="text-[13px] font-bold text-[#1c1c2e]">Resumo Profissional</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-gray-700">
          Profissional com mais de 12 anos de experiência em manutenção e instalações elétricas, atuando em projetos
          residenciais, corporativos e comerciais de grande porte. Formação sólida e multidisciplinar, com destaque para
          a formação técnica em Eletrotécnica e o curso de Eletricista Instalador pelo SENAI, complementada por
          especializações em NR10, NR33 e NR35, garantindo conformidade com as normas de segurança. Engenharia Elétrica
          pela Universidade Anhembi Morumbi, unindo conhecimento acadêmico à prática adquirida em campo.
        </p>
      </section>

      <section>
        <h3 className="text-[13px] font-bold text-[#1c1c2e]">Diferenciais Profissionais</h3>
        <ul className="mt-1 list-disc pl-5 text-[13px] leading-relaxed text-gray-700">
          <li>Experiência em manutenção preventiva e corretiva em empresas como Smart Fit, Riachuelo e Fast Shop, incluindo serviços de cabines primárias e subestações.</li>
          <li>Histórico de atuação em gestão de manutenção elétrica residencial de alto padrão, abrangendo sistemas elétricos de controle por automação.</li>
          <li>Conhecimentos complementares em logística, administração e finanças, agregando visão de gestão e planejamento a projetos técnicos.</li>
          <li>Certificações em segurança, primeiros socorros e brigada de incêndio, transmitindo maior confiabilidade para serviços em ambientes de risco.</li>
          <li>Idiomas: Português e Italiano (fluente).</li>
        </ul>
      </section>

      <section>
        <h3 className="text-[13px] font-bold text-[#1c1c2e]">Formação Técnica e Acadêmica</h3>
        <ul className="mt-1 list-disc pl-5 text-[13px] leading-relaxed text-gray-700">
          <li>Técnico em Eletrotécnica – Instituto Thomas Edson</li>
          <li>Curso de Eletricista Instalador – SENAI</li>
          <li>Cursos de NR10, NR33, NR35 – Segurança em Instalações Elétricas, Espaços Confinados e Trabalho em Altura</li>
          <li>Engenharia Elétrica – Universidade Anhembi Morumbi</li>
          <li>Projetista de Elite – CFPRO – Centro de Formação de Projetistas</li>
        </ul>
      </section>

      <Secao titulo="Sobre a empresa:">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <p>
              Contamos com uma equipe técnica qualificada e certificada, equipada com ferramentas especializadas e o uso
              adequado de EPIs, garantindo a execução dos serviços com segurança, eficiência e conformidade com as
              normas vigentes.
            </p>
            <p className="mt-2">
              <span className="font-semibold">CNPJ:</span> 61.841.485/0001-30<br />
              <span className="font-semibold">CFT:</span> 38346090803<br />
              <span className="font-semibold">Telefone:</span> (11) 92137-4849 / (11) 98521-9614<br />
              <span className="font-semibold">Site:</span> ensaioeletrico.com.br <span className="font-semibold">Instagram:</span> @ensaioeletrico
            </p>
            <p className="mt-2">
              <span className="font-semibold">E-mail's:</span><br />
              amauri@ensaioeletrico.com.br<br />
              gustavo.hardaim@ensaioeletrico.com.br<br />
              nilson.garcia@ensaioeletrico.com.br
            </p>
          </div>
          <img src={equipe} alt="Equipe Ensaio Elétrico" className="w-full rounded-lg sm:w-48 shrink-0" />
        </div>
      </Secao>

      <Secao titulo="Informações Cliente">
        <p><span className="font-semibold">Condomínio:</span> {contrato.cliente_nome}</p>
        {contrato.cliente_endereco && <p><span className="font-semibold">Endereço:</span> {contrato.cliente_endereco}</p>}
      </Secao>

      <Secao titulo="Objetivo da Proposta">
        <p>Solução de manutenção preventiva em ({qtd}) Painéis elétricos nos locais: {locais}.</p>
      </Secao>

      <Secao titulo="Escopo dos Serviços">
        <p className="font-semibold">Manutenção nos Painéis Elétricos ({locais}).</p>
        <p>
          Executar limpeza, reaperto das conexões e medições de tensão e corrente na saída do disjuntor geral, afim de
          assegurar o bom funcionamento das instalações e apontar as devidas correções e melhorias se necessário.
        </p>
        <p className="font-semibold">Observação:</p>
        <p>
          Havendo equipamento/dispositivos ou circuito apresentando falha técnica, contatação de não enquadro das normas
          atuais ou sistema inoperante de instalação, será apresentado uma solução de troca, ajuste, nova instalação ou
          melhoria mediante uma proposta de manutenção corretiva, conforme os devidos parâmetros estabelecidos na ABNT
          norma 5410 e NR-10.
        </p>
      </Secao>

      <Secao titulo="CLÁUSULA 1 – OBJETO DO CONTRATO">
        <p>
          O presente contrato tem por objeto a prestação de serviços de manutenção preventiva em painéis elétricos de
          baixa tensão, conforme recomendações da ABNT NBR 5410, visando:
        </p>
        <p>
          Garantir segurança elétrica; Evitar falhas e paradas operacionais; Preservar a vida útil dos equipamentos;
          Manter a conformidade normativa das instalações.
        </p>
        <p>Os serviços serão realizados nos seguintes ({qtd}) painéis elétricos:</p>
        <p>
          QGBT – Quadro Geral de Baixa Tensão; QDC – Quadro de distribuição de circuitos; QDL – Quadros de distribuição
          de iluminação; QDF – Quadros de força.
        </p>
      </Secao>

      <Secao titulo="CLÁUSULA 2 – SERVIÇOS INCLUÍDOS">
        <p>A manutenção preventiva incluirá:</p>
        <p>
          <span className="font-semibold">Inspeção Visual</span> – Verificação de aquecimento anormal; Integridade de
          barramentos; Estado de disjuntores; Estado de cabos e isolação; Identificação e sinalização dos circuitos.
        </p>
        <p>
          <span className="font-semibold">Limpeza Técnica</span> – Remoção de poeira e contaminantes; Limpeza de
          barramentos; Limpeza de componentes elétricos.
        </p>
        <p>
          <span className="font-semibold">Reaperto Mecânico</span> – Reaperto de bornes; Reaperto de barramentos;
          Reaperto de disjuntores e contatores.
        </p>
        <p>
          <span className="font-semibold">Verificação Elétrica</span> – Medição de tensão; Medição de corrente;
          Verificação de equilíbrio de fases; Teste de continuidade do condutor de proteção (PE).
        </p>
        <p>
          <span className="font-semibold">Termografia (quando contratado)</span> – Inspeção por câmera termográfica;
          Identificação de pontos quentes.
        </p>
        <p>
          <span className="font-semibold">Testes Operacionais</span> – Teste de disjuntores; Teste de dispositivos DR;
          Teste de comandos.
        </p>
      </Secao>

      <Secao titulo="CLÁUSULA 3 – PERIODICIDADE DA MANUTENÇÃO">
        <p>A manutenção preventiva será realizada com a seguinte frequência:</p>
        <p>{contrato.periodicidade}</p>
      </Secao>

      <Secao titulo="CLÁUSULA 4 – RELATÓRIO TÉCNICO">
        <p>Após cada manutenção, a CONTRATADA fornecerá:</p>
        <p>
          Relatório técnico detalhado; Registro fotográfico; Medições elétricas; Lista de não conformidades;
          Recomendações de correção.
        </p>
      </Secao>

      <Secao titulo="CLÁUSULA 5 – OBRIGAÇÕES DA CONTRATADA">
        <p>A CONTRATADA se compromete a:</p>
        <p>
          Executar os ({qtdManut}) serviços de manutenção preventiva durante o período vigente deste contrato,
          considerando as normas técnicas; Utilizar profissionais qualificados; Seguir procedimentos de segurança;
          Utilizar instrumentos calibrados; Em caso de chamado para atendimento emergencial, a contratada terá entre 24
          horas até 48 horas para chegar ao local.
        </p>
      </Secao>

      <Secao titulo="CLÁUSULA 6 – OBRIGAÇÕES DO CONTRATANTE">
        <p>O CONTRATANTE deverá:</p>
        <p>
          Permitir acesso aos painéis elétricos; Informar condições operacionais da instalação; Providenciar
          desligamentos quando necessário; Garantir condições de segurança no local.
        </p>
      </Secao>

      <Secao titulo="CLÁUSULA 7 – VALOR DO CONTRATO">
        <p>Pelos serviços prestados, o CONTRATANTE pagará à CONTRATADA o valor de:</p>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#31849b] text-white">
                <th className="px-3 py-2 text-left font-semibold">Descrição</th>
                <th className="px-3 py-2 text-center font-semibold">Valor Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="px-3 py-2">Serviço Total</td>
                <td className="px-3 py-2 text-center font-bold">{formatarMoeda(contrato.valor_total ?? 0)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold">Forma de Pagamento</td>
                <td className="px-3 py-2 text-center">{contrato.forma_pagamento}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <span className="font-semibold">Banco Inter</span> · Agência: 0001 · Conta Corrente: 47093601-0<br />
          Chave Pix (CNPJ): 61.841.485/0001-30
        </p>
      </Secao>

      <Secao titulo="CLÁUSULA 8 – PRAZO DE VIGÊNCIA">
        <p>Este contrato terá duração de:</p>
        <p>
          {contrato.vigencia_meses} meses, iniciando a partir do dia {dataBr(contrato.data_inicio ?? '')} e encerrando em{' '}
          {dataBr(contrato.data_fim ?? '')}. Podendo ser renovado mediante acordo entre as partes.
        </p>
      </Secao>

      <Secao titulo="CLÁUSULA 9 – RESCISÃO">
        <p>O contrato poderá ser rescindido:</p>
        <p>Por qualquer das partes com aviso prévio de 30 dias.</p>
        <p>
          Em caso de descumprimento desta cláusula contratual, a parte que estiver rescindindo pagará uma multa
          correspondente a 50% do valor restante previsto ao término deste contrato.
        </p>
      </Secao>

      <Secao titulo="CLÁUSULA 10 – RESPONSABILIDADE TÉCNICA">
        <p>
          Os serviços serão executados sob responsabilidade técnica de profissional habilitado, com emissão de TRT
          (Termo de Responsabilidade Técnica).
        </p>
      </Secao>

      <Secao titulo="CLÁUSULA 11 – FORO">
        <p>Fica eleito o foro da comarca de OSASCO-SP para dirimir eventuais controvérsias.</p>
      </Secao>

      <Secao titulo="Cronograma">
        <p>• Tempo total de atividade: {contrato.cronograma_tempo}</p>
        <p>• Horário de execução: {contrato.cronograma_horario}</p>
      </Secao>

      <Secao titulo="Normas Atendidas">
        <p>Todos os serviços serão realizados conforme as normas técnicas:</p>
        <p>• NBR 5410 – Instalações Elétricas de Baixa Tensão;</p>
        <p>• NR-10 – Segurança em Instalações e Serviços em Eletricidade;</p>
      </Secao>

      <Secao titulo="Garantia">
        <p>• Durante todo o período de vigência deste contrato sobre a execução dos serviços.</p>
        <p>
          • Havendo abertura de chamado fora da data da preventiva, será cobrada a taxa de visita no valor de{' '}
          {formatarMoeda(contrato.taxa_visita ?? 200)}.
        </p>
      </Secao>

      <p className="text-[13px] font-bold text-[#1a4b9c] underline">
        Responsável Técnico: {contrato.responsavel_tecnico} - CFT: {contrato.cft}
      </p>

      <Secao titulo="Assinaturas">
        <AssinaturasContrato contrato={contrato} />
        <p className="text-center text-xs font-semibold text-[#1a4b9c]">
          Local e data: Osasco, {dataBr(contrato.data ?? '')}
        </p>
      </Secao>
    </div>
  )
}
