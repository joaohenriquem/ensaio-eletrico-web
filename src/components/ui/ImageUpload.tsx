import { useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { uploadImagem } from '../../api/uploads'
import { recuperarUrlQuebrada } from '../../offline/fotos'

interface Props {
  fotos: string[]
  onChange: (fotos: string[]) => void
  max?: number
}

function redimensionarParaBlob(file: File, maxWidth = 1024): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Falha ao converter imagem'))
        resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.8)
    }
    img.onerror = reject
    img.src = url
  })
}

export default function ImageUpload({ fotos, onChange, max = 2 }: Props) {
  const [carregando, setCarregando] = useState(false)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'))
    if (!files.length) return
    const disponiveis = max - fotos.length
    const selecionados = files.slice(0, disponiveis)
    setCarregando(true)
    try {
      const novas = await Promise.all(
        selecionados.map(async f => {
          const resized = await redimensionarParaBlob(f)
          return uploadImagem(resized)
        })
      )
      onChange([...fotos, ...novas])
    } finally {
      setCarregando(false)
      e.target.value = ''
    }
  }

  function remover(i: number) {
    onChange(fotos.filter((_, idx) => idx !== i))
  }

  // O Android às vezes invalida a URL "blob:" de uma foto tirada offline
  // (ex: ao voltar da câmera). Se isso acontecer, tenta gerar uma blob:
  // nova a partir do arquivo que já está salvo no IndexedDB.
  async function tentarRecuperar(i: number, srcQuebrado: string) {
    const novaUrl = await recuperarUrlQuebrada(srcQuebrado)
    if (novaUrl) onChange(fotos.map((f, idx) => (idx === i ? novaUrl : f)))
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {fotos.map((src, i) => (
        <div key={i} className="relative group">
          <img
            src={src}
            alt={`foto ${i + 1}`}
            className="h-20 w-20 rounded-lg object-cover border border-gray-200 shadow-sm"
            onError={() => tentarRecuperar(i, src)}
          />
          <button
            onClick={() => remover(i)}
            className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
          >
            <X size={11} />
          </button>
        </div>
      ))}

      {fotos.length < max && (
        <label
          className={`relative flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-[#f0a500] hover:text-[#f0a500] transition ${carregando ? 'pointer-events-none opacity-50' : ''}`}
        >
          {carregando
            ? <Loader2 size={20} className="animate-spin" />
            : <ImagePlus size={20} />
          }
          <span className="text-xs">{carregando ? 'Enviando...' : 'Foto'}</span>
          <input
            type="file"
            accept="image/*,text/plain"
            multiple={max - fotos.length > 1}
            disabled={carregando}
            onChange={handleFiles}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      )}
    </div>
  )
}
