import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import Modal from './Modal'

interface Props {
  /** Coordenadas diretas (login) */
  lat?: number
  lon?: number
  /** Endereço para geocodificar (cliente) */
  address?: string
  titulo?: string
  onClose: () => void
}

export default function MapaModal({ lat: latProp, lon: lonProp, address, titulo = 'Localização', onClose }: Props) {
  const [lat, setLat] = useState<number | null>(latProp ?? null)
  const [lon, setLon] = useState<number | null>(lonProp ?? null)
  const [loading, setLoading] = useState(!latProp && !!address)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (latProp != null || !address) return
    setLoading(true)
    setErro('')
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, {
      headers: { 'Accept-Language': 'pt-BR' },
    })
      .then(r => r.json())
      .then(data => {
        if (data[0]) {
          setLat(Number(data[0].lat))
          setLon(Number(data[0].lon))
        } else {
          setErro('Endereço não encontrado no mapa.')
        }
      })
      .catch(() => setErro('Erro ao buscar localização.'))
      .finally(() => setLoading(false))
  }, [address, latProp])

  const delta = 0.012
  const src = lat != null && lon != null
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta},${lat - delta},${lon + delta},${lat + delta}&layer=mapnik&marker=${lat},${lon}`
    : null

  return (
    <Modal open onClose={onClose} title={titulo}>
      <div className="flex flex-col gap-3">
        {address && (
          <p className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin size={14} className="shrink-0 text-[#f0a500]" />
            {address}
          </p>
        )}

        {loading && (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#f0a500] border-t-transparent mr-2" />
            Buscando localização...
          </div>
        )}

        {erro && <p className="text-sm text-red-500">{erro}</p>}

        {src && (
          <>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <iframe
                src={src}
                width="100%"
                height="320"
                className="block"
                title="Mapa de localização"
                loading="lazy"
              />
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-xs text-blue-500 hover:underline"
            >
              Abrir no OpenStreetMap
            </a>
          </>
        )}
      </div>
    </Modal>
  )
}
