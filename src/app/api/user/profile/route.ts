import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Récupérer le profil utilisateur
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    })
  } catch (error: any) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json(
      { error: `Erreur lors de la récupération du profil: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé - pas d\'email' }, { status: 401 })
    }

    const { name, avatar } = await request.json()

    // Trouver l'utilisateur par email au lieu de l'ID
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: name || undefined,
        avatar: avatar || undefined,
      },
    })

    // Forcer la mise à jour de la session en retournant les nouvelles données
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
      // Indiquer que la session doit être refetchée
      refreshSession: true
    })
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    return NextResponse.json(
      { error: `Erreur lors de la mise à jour du profil: ${error.message}` },
      { status: 500 }
    )
  }
} 
 
 