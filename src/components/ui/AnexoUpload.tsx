import { useState } from 'react'
import { Paperclip, Loader2, X, FileText } from 'lucide-react'
import { uploadImagem } from '../../api/uploads'
import { recuperarUrlQuebrada } from '../../offline/fotos'
import type { Anexo } from '../../types'

interface Props {
  anexos: Anexo[]
  onChange: (anexos: Anexo[]) => void
  max?: number
}

const EXT_IMAGEM = /\.(jpe?g|png|gif|webp)$/i

export default function AnexoUpload({ anexos, onChange, max = 5 }: Props) {
  const [carregando, setCarregando] = useState(false)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const disponiveis = max - anexos.length
    const selecionados = files.slice(0, disponiveis)
    setCarregando(true)
    try {
      const novos = await Promise.all(
        selecionados.map(async f => ({ nome: f.name, url: await uploadImagem(f) }))
      )
      onChange([...anexos, ...novos])
    } finally {
      setCarregando(false)
      e.target.value = ''
    }
  }

  function remover(i: number) {
    onChange(anexos.filter((_, idx) => idx !== i))
  }

  // O Android às vezes invalida a URL "blob:" de um anexo salvo offline
  // (ex: ao voltar da câmera). Se isso acontecer, tenta gerar uma blob:
  // nova a partir do arquivo que já está salvo no IndexedDB.
  async function tentarRecuperar(i: number, urlQuebrada: string) {
    const novaUrl = await recuperarUrlQuebrada(urlQuebrada)
    if (novaUrl) onChange(anexos.map((a, idx) => (idx === i ? { ...a, url: novaUrl } : a)))
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      {anexos.map((anexo, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          {EXT_IMAGEM.test(anexo.nome) ? (
            <img
              src={anexo.url}
              alt={anexo.nome}
              className="h-8 w-8 shrink-0 rounded object-cover"
              onError={() => tentarRecuperar(i, anexo.url)}
            />
          ) : (
            <FileText size={18} className="shrink-0 text-gray-400" />
          )}
          <a href={anexo.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-[#1e3050] hover:underline">
            {anexo.nome}
          </a>
          <button onClick={() => remover(i)} className="shrink-0 text-gray-400 hover:text-red-500">
            <X size={16} />
          </button>
        </div>
      ))}

      {anexos.length < max && (
        <label
          className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-3 py-2.5 text-sm text-gray-400 hover:border-[#f0a500] hover:text-[#f0a500] transition cursor-pointer ${carregando ? 'pointer-events-none opacity-50' : ''}`}
        >
          {carregando ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
          {carregando ? 'Enviando...' : `Anexar arquivo (${anexos.length}/${max})`}
          <input
            type="file"
            multiple={max - anexos.length > 1}
            disabled={carregando}
            onChange={handleFiles}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}
