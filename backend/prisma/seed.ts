import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config({ path: '.env' })

const prisma = new PrismaClient()

const defaultExercises = [
  { id: '550e8400-e29b-41d4-a716-446655440001', muscleGroup: 'CHEST', name: 'Barbell Bench Press' },
  { id: '550e8400-e29b-41d4-a716-446655440002', muscleGroup: 'BACK', name: 'Barbell Row' },
  { id: '550e8400-e29b-41d4-a716-446655440003', muscleGroup: 'SHOULDERS', name: 'Overhead Press' },
  { id: '550e8400-e29b-41d4-a716-446655440004', muscleGroup: 'QUADS', name: 'Back Squat' },
  { id: '550e8400-e29b-41d4-a716-446655440005', muscleGroup: 'HAMSTRINGS', name: 'Romanian Deadlift' },
  { id: '550e8400-e29b-41d4-a716-446655440006', muscleGroup: 'GLUTES', name: 'Hip Thrust' },
  { id: '550e8400-e29b-41d4-a716-446655440007', muscleGroup: 'BICEPS', name: 'EZ Bar Curl' },
  { id: '550e8400-e29b-41d4-a716-446655440008', muscleGroup: 'TRICEPS', name: 'Cable Pushdown' },
] as const

async function main() {
  for (const exercise of defaultExercises) {
    await prisma.exercise.upsert({
      where: {
        id: exercise.id,
      },
      update: {},
      create: {
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        source: 'DEFAULT',
      },
    })
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
