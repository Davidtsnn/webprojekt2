import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // Nur befüllen, wenn noch keine Kategorien da sind (verhindert Duplikate)
    const vorhandene = await db.from('habit_categories').count('* as total')
    if (Number(vorhandene[0].total) > 0) return

    await db.table('habit_categories').multiInsert([
      { name: 'Gesundheit', emoji: '💪' },
      { name: 'Lernen', emoji: '📚' },
      { name: 'Sport', emoji: '🏃' },
      { name: 'Ernährung', emoji: '🍎' },
      { name: 'Mindfulness', emoji: '🧘' },
    ])
  }
}