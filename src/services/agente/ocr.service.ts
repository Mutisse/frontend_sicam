// src/services/agente/ocr.service.ts
import { createWorker } from 'tesseract.js'

/**
 * Lê a matrícula de uma imagem capturada pela câmara.
 * Aceita `File`, `Blob` ou `HTMLCanvasElement`.
 */
export async function lerMatriculaDeImagem(
  imagem: File | Blob | HTMLCanvasElement,
): Promise<string | null> {
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null

  try {
    // Cria worker com o idioma português + inglês
    worker = await createWorker(['por', 'eng'], 1, {
      logger: () => {
        /* pode ligar a progresso se quiseres */
      },
    })

    // Configurar o OCR para placas
    await worker.setParameters({
      tessedit_char_whitelist:
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
      tessedit_pageseg_mode: '7' as any, // single text line
    })

    const { data } = await worker.recognize(imagem)

    const texto = data.text
      .toUpperCase()
      .replace(/\s+/g, '')
      .replace(/[^A-Z0-9-]/g, '')

    // Procura padrões de matrícula de Moçambique:
    // AAA-111-XX  ou  AAA 111 XX  ou  AAAAAAA
    const match =
      texto.match(/[A-Z]{2,3}-?\d{2,4}-?[A-Z]{2}/) ??
      texto.match(/[A-Z]{3}\d{3}[A-Z]{2}/) ??
      texto.match(/[A-Z0-9]{6,10}/)

    if (!match) return null

    // Normaliza para o formato AAA-111-XX
    let bruto = match[0].replace(/-/g, '')

    if (bruto.length === 7) {
      // AAA 111 XX
      bruto = `${bruto.slice(0, 3)}-${bruto.slice(3, 6)}-${bruto.slice(6)}`
    } else if (bruto.length === 8) {
      // AAA 11 XX (formato 2 linhas) — tenta
      bruto = `${bruto.slice(0, 3)}-${bruto.slice(3, 5)}-${bruto.slice(5)}`
    }

    return bruto
  } catch (e) {
    console.error('Erro no OCR:', e)
    return null
  } finally {
    if (worker) {
      try {
        await worker.terminate()
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * Abre a câmara do dispositivo e devolve o ficheiro capturado.
 * Se o browser não suportar `capture`, abre o gestor de ficheiros.
 */
export async function capturarDaCamera(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    // `capture="environment"` força a câmara traseira em mobile
    input.setAttribute('capture', 'environment')

    input.onchange = () => {
      const file = input.files?.[0] ?? null
      resolve(file)
    }

    // Se o utilizador cancelar (browser sem evento de cancel), resolve após timeout
    input.oncancel = () => resolve(null)

    input.click()
  })
}

/**
 * Redimensiona e pré-processa a imagem para melhorar o OCR.
 */
export async function preProcessarImagem(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = () => {
      img.src = reader.result as string
    }

    img.onload = () => {
      // Limita a largura a 1200px para acelerar o OCR
      const maxW = 1200
      const escala = img.width > maxW ? maxW / img.width : 1
      const w = Math.round(img.width * escala)
      const h = Math.round(img.height * escala)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Sem contexto 2d'))

      // Desenha
      ctx.drawImage(img, 0, 0, w, h)

      // Aumenta o contraste + converte para tons de cinzento
      const imageData = ctx.getImageData(0, 0, w, h)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]!
        const g = data[i + 1]!
        const b = data[i + 2]!

        // Cinzento
        const cinza = 0.299 * r + 0.587 * g + 0.114 * b

        // Contraste forte
        const contraste = cinza < 128 ? 0 : 255

        data[i] = contraste
        data[i + 1] = contraste
        data[i + 2] = contraste
      }

      ctx.putImageData(imageData, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Falha ao gerar blob'))
          resolve(blob)
        },
        'image/jpeg',
        0.85,
      )
    }

    img.onerror = () => reject(new Error('Erro ao carregar imagem'))
    reader.onerror = () => reject(new Error('Erro ao ler ficheiro'))
    reader.readAsDataURL(file)
  })
}