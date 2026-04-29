/**
 * Alternative seed script using drizzle-seed for generating random test data
 *
 * This demonstrates how to use drizzle-seed to generate large amounts of test data
 * Run with: npm run db:seed:random
 */

import { seed } from 'drizzle-seed'
import { db } from './index'
import * as schema from './schema'

async function seedRandom() {
  console.log('Generating random test data with drizzle-seed...\n')

  try {
    // Generate random messages using drizzle-seed
    await seed(db, schema, {
      count: 100, // Generate 100 random messages
    })

    console.log('Successfully generated 100 random messages')
    console.log('\nNote: This data is randomly generated.')
    console.log('   For realistic Sonarr/Radarr examples, use: npm run db:seed')

  } catch (error) {
    console.error('Error generating random data:', error)
    process.exit(1)
  }

  process.exit(0)
}

seedRandom()

