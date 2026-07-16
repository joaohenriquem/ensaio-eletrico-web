import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { Download, Check, FileSignature, AlertTriangle, ScrollText } from 'lucide-react'
import { buscarContratoPublico, assinarContratoPublico, baixarPdfContratoPublico } from '../api/contratos'
import type { ContratoPublico } from '../types'
import { dataBr, formatarMoeda } from '../utils/formatters'
import SignaturePad from '../components/ui/SignaturePad'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ContratoConteudo, { BlocoAssinatura } from '../components/ContratoConteudo'
import logo from '../static/logo.jpeg'

export default function AssinarContrato() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [contrato, setContrato] = useState<ContratoPublico | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erroLink, setErroLink] = useState(false)

  const [nome, setNome] = useState('')
  const [assinatura, setAssinatura] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [assinado, setAssinado] = useState(false)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const geoRef = useRef<{ latitude: number; longitude: number } | null>(null)

  async function getIpGeo(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const res = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      if (data.latitude && data.longitude) {
        return { latitude: Number(data.latitude), longitude: Number(data.longitude) }
      }
    } catch { /* ignora */ }
    return null
  }

  useEffect(() => {
    if (!id || !token) { setErroLink(true); setCarregando(false); return }
    buscarContratoPublico(id, token)
      .then((ct) => {
        setContrato(ct)
        if (ct.assinado) setAssinado(true)
        if (ct.nome_contratante) setNome(ct.nome_contratante)
      })
      .catch(() => setErroLink(true))
      .finally(() => setCarregando(false))
  }, [id, token])

  useEffect(() => {
    if (!navigator.geolocation) {
      getIpGeo().then((geo) => { geoRef.current = geo })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => { geoRef.current = { latitude: pos.coords.latitude, longitude: pos.coords.longitude } },
      async () => { geoRef.current = await getIpGeo() },
      { timeout: 8000, maximumAge: 60000 }
    )
  }, [])

  async function assinar() {
    if (!id || !contrato) return
    if (!nome.trim()) { setErro('Informe seu nome completo.'); return }
    if (!assinatura) { setErro('Faça sua assinatura no campo acima.'); return }
    setErro('')
    setEnviando(true)
    try {
      if (!geoRef.current) geoRef.current = await getIpGeo()
      const geo = geoRef.current
      await assinarContratoPublico(id, token, nome.trim(), assinatura, geo?.latitude, geo?.longitude)
      setAssinado(true)
      setContrato((ct) => ct ? {
        ...ct,
        nome_contratante: nome.trim(),
        assinatura_contratante: assinatura,
        assinado_contratante_em: new Date().toISOString(),
        assinado: true,
      } : ct)
    } catch (e) {
      const resp = (e as { response?: { data?: { error?: string } } }).response
      setErro(resp?.data?.error ?? 'Não foi possível registrar a assinatura. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#1e3050] px-4 py-5 text-center">
        <img src={logo} alt="Ensaio Elétrico" className="mx-auto h-16 w-auto rounded" />
        <h1 className="mt-2 text-lg font-bold text-white">Assinatura de Contrato</h1>
        <p className="text-xs text-white/60">Ensaio Elétrico · CNPJ 61.841.485/0001-30</p>
      </header>

      <main className="mx-auto max-w-xl px-4 py-6 flex flex-col gap-4">
        {carregando ? (
          <p className="py-16 text-center text-sm text-gray-400">Carregando contrato...</p>
        ) : erroLink ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-8 text-center shadow-sm">
            <AlertTriangle size={40} className="text-amber-500" />
            <h2 className="font-bold text-[#1e3050]">Link inválido ou expirado</h2>
            <p className="text-sm text-gray-500">
              Não foi possível localizar este contrato. Confira se o link foi copiado por completo ou solicite um novo
              link à Ensaio Elétrico.
            </p>
          </div>
        ) : contrato ? (
          <>
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3050]/10">
                  <FileSignature size={18} className="text-[#1e3050]" />
                </div>
                <div>
                  <p className="font-mono text-xs text-gray-400">{contrato.numero}</p>
                  <h2 className="font-bold text-[#1e3050]">Contrato de Manutenção Preventiva</h2>
                </div>
              </div>

              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500 shrink-0">Cliente</dt>
                  <dd className="font-medium text-right text-[#1e3050]">{contrato.cliente_nome}</dd>
                </div>
                {contrato.cliente_endereco && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500 shrink-0">Endereço</dt>
                    <dd className="text-right">{contrato.cliente_endereco}</dd>
                  </div>
                )}
                {contrato.qtd_paineis ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500 shrink-0">Objeto</dt>
                    <dd className="text-right">Manutenção preventiva em {contrato.qtd_paineis} painéis elétricos</dd>
                  </div>
                ) : null}
                {contrato.valor_total ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500 shrink-0">Valor</dt>
                    <dd className="font-bold text-[#1e3050] text-right">{formatarMoeda(contrato.valor_total)}</dd>
                  </div>
                ) : null}
                {contrato.forma_pagamento && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500 shrink-0">Pagamento</dt>
                    <dd className="text-right">{contrato.forma_pagamento}</dd>
                  </div>
                )}
                {contrato.vigencia_meses ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500 shrink-0">Vigência</dt>
                    <dd className="text-right">
                      {contrato.vigencia_meses} meses
                      {contrato.data_inicio ? ` · ${dataBr(contrato.data_inicio)} a ${dataBr(contrato.data_fim ?? '')}` : ''}
                    </dd>
                  </div>
                ) : null}
                {contrato.responsavel_tecnico && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500 shrink-0">Resp. Técnico</dt>
                    <dd className="text-right">{contrato.responsavel_tecnico}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => setModalAberto(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1e3050] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2a4370]"
                >
                  <ScrollText size={16} /> Ler contrato na íntegra
                </button>
                <button
                  onClick={() => id && baixarPdfContratoPublico(id, token, contrato.numero)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-[#1e3050] hover:bg-gray-100"
                >
                  <Download size={16} /> Baixar PDF
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-bold text-[#1e3050]">Assinaturas</h3>
              {assinado ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              ) : (
                <div className="mx-auto w-full sm:max-w-xs">
                  <BlocoAssinatura
                    assinatura={contrato.assinatura_contratada}
                    papel="TÉCNICO RESPONSÁVEL (CONTRATADA)"
                    nome={contrato.nome_contratada}
                    assinadoEm={contrato.assinado_contratada_em}
                    localizacao={contrato.endereco_contratada}
                    fallback="Assinatura do Técnico"
                  />
                </div>
              )}
              {contrato.guid && (
                <p className="mt-4 text-center text-[10px] text-gray-400">ID do documento: {contrato.guid}</p>
              )}
            </div>

            {assinado ? (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-8 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <Check size={28} className="text-green-600" />
                </div>
                <h2 className="font-bold text-[#1e3050]">Contrato assinado com sucesso!</h2>
                <p className="text-sm text-gray-500">
                  {contrato.assinado_contratante_em
                    ? `Assinatura registrada em ${new Date(contrato.assinado_contratante_em).toLocaleString('pt-BR')}.`
                    : 'Sua assinatura foi registrada digitalmente.'}
                  {' '}Você pode baixar o PDF assinado no botão acima.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-white p-5 shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-[#1e3050]">Assinatura do Cliente (contratante)</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Leia o contrato completo antes de assinar. Ao assinar, você concorda com todas as cláusulas.
                  </p>
                </div>
                <Input label="Nome completo *" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" />
                <SignaturePad label="Sua assinatura *" value={assinatura} onChange={setAssinatura} />
                {erro && <p className="text-sm text-red-500">{erro}</p>}
                <Button onClick={assinar} disabled={enviando} className="w-full">
                  {enviando ? 'Registrando assinatura...' : '✍️ Assinar Contrato'}
                </Button>
                <p className="text-center text-[11px] text-gray-400">
                  A assinatura é registrada com identificador único (GUID), data e hora, e passa a constar no documento.
                </p>
              </div>
            )}
            <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={`Contrato ${contrato.numero}`} wide>
              <ContratoConteudo contrato={contrato} />
            </Modal>
          </>
        ) : null}
      </main>
    </div>
  )
}
