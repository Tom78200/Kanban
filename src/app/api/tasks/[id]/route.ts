import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { status, title, description, priority, dueDate, estimatedHours, actualHours } = body

    // Validation pour la mise à jour complète
    if (title !== undefined && (!title || title.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (title && title.length > 200) {
      return NextResponse.json(
        { error: 'Title cannot exceed 200 characters' },
        { status: 400 }
      )
    }

    if (description && description.length > 1000) {
      return NextResponse.json(
        { error: 'Description cannot exceed 1000 characters' },
        { status: 400 }
      )
    }

    if (status && !['todo', 'doing', 'done'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      )
    }

    if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return NextResponse.json(
        { error: 'Valid priority is required' },
        { status: 400 }
      )
    }

    if (estimatedHours && (estimatedHours < 0 || estimatedHours > 1000)) {
      return NextResponse.json(
        { error: 'Estimated hours must be between 0 and 1000' },
        { status: 400 }
      )
    }

    if (actualHours && (actualHours < 0 || actualHours > 1000)) {
      return NextResponse.json(
        { error: 'Actual hours must be between 0 and 1000' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours
    if (actualHours !== undefined) updateData.actualHours = actualHours

    const task = await prisma.task.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
} 