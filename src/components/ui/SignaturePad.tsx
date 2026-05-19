import { useRef, useEffect, useState } from 'react'
import { Eraser, PenLine } from 'lucide-react'

interface Props {
  value: string
  onChange: (base64: string) => void
  label?: string
}

export default function SignaturePad({ value, onChange, label = 'Assinatura' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [hasContent, setHasContent] = useState(!!value)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = value
      setHasContent(true)
    } else {
      setHasContent(false)
    }
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.strokeStyle = '#1e3050'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasContent(true)
  }

  function end(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!drawing.current) return
    drawing.current = false
    const canvas = canvasRef.current!
    // Cria canvas temporário com fundo branco para o PDF renderizar corretamente
    const tmp = document.createElement('canvas')
    tmp.width = canvas.width
    tmp.height = canvas.height
    const ctx = tmp.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, tmp.width, tmp.height)
    ctx.drawImage(canvas, 0, 0)
    onChange(tmp.toDataURL('image/jpeg', 0.9))
  }

  function limpar() {
    const canvas = canvasRef.current!
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setHasContent(false)
    onChange('')
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <PenLine size={14} className="text-[#f0a500]" />
          {label}
        </label>
        {hasContent && (
          <button
            onClick={limpar}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition"
          >
            <Eraser size={13} /> Limpar
          </button>
        )}
      </div>

      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full cursor-crosshair touch-none"
          style={{ height: '160px' }}
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={end}
        />
      </div>

      {!hasContent && (
        <p className="text-xs text-gray-400 text-center -mt-1">
          Assine acima com o mouse ou dedo
        </p>
      )}
    </div>
  )
}
