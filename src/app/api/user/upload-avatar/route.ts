import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    let imageBase64: string | null = null

    if (contentType.includes('application/json')) {
      const { image } = await req.json()
      if (!image) {
        return NextResponse.json({ error: 'Aucune image fournie' }, { status: 400 })
      }
      imageBase64 = image
    } else if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('file')
      if (!file) {
        return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
      }
      const arrayBuffer = await (file as Blob).arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const mime = (file as File).type || 'image/jpeg'
      imageBase64 = `data:${mime};base64,${base64}`
    } else {
      return NextResponse.json({ error: 'Type de contenu non supporté' }, { status: 415 })
    }

    // Fallbacks dev pour éviter l’erreur si non configuré
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dcsojpvpg'
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default'

    // Préparer FormData pour Cloudinary (unsigned upload via preset)
    const formData = new FormData()
    formData.append('file', imageBase64 as string)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'avatars')
    formData.append('public_id', `avatar_${Date.now()}`)

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData as any
    })

    const data = await uploadRes.json()
    if (!uploadRes.ok || !data.secure_url) {
      return NextResponse.json({ error: 'Erreur Cloudinary', details: data }, { status: 500 })
    }

    return NextResponse.json({ url: data.secure_url })
  } catch (e: any) {
    console.error('Cloudinary error:', e)
    return NextResponse.json({ error: e.message || 'Erreur inconnue' }, { status: 500 })
  }
}






