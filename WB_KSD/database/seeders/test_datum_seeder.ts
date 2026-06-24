import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Nicht doppelt anlegen, falls schon vorhanden
    const schonDa = await User.findBy('email', 'max@test.de')
    if (schonDa) return

    const heute = new Date().toISOString().split('T')[0]

    // --- Test-Nutzer (Passwort wird automatisch gehasht) ---
    const max = await User.create({ fullName: 'Max Mustermann', email: 'max@test.de', password: 'passwort123' })
    const lena = await User.create({ fullName: 'Lena Beispiel', email: 'lena@test.de', password: 'passwort123' })

    // --- Aufgaben für Max ---
    await db.table('todos').multiInsert([
      { user_id: max.id, title: 'Mathe-Übung abgeben', category: 'Uni', priority: 'Hoch', due_date: heute, is_completed: false, quadrant: 'do' },
      { user_id: max.id, title: 'Wocheneinkauf', category: 'Haushalt', priority: 'Niedrig', due_date: null, is_completed: true, quadrant: null },
      { user_id: max.id, title: 'Laufrunde planen', category: 'Freizeit', priority: 'Mittel', due_date: null, is_completed: false, quadrant: 'plan' },
    ])

    // --- Gewohnheiten für Max (Wasser direkt als heute erledigt) ---
    const [wasserId] = await db.table('habits').insert({ user_id: max.id, name: 'Wasser trinken', category: 'Gesundheit' })
    await db.table('habits').insert({ user_id: max.id, name: '20 Min. lesen', category: 'Lernen' })
    await db.table('habit_logs').insert({ habit_id: wasserId, date: heute, done: true })

    // --- Aufgaben & Gewohnheiten für Lena ---
    await db.table('todos').multiInsert([
      { user_id: lena.id, title: 'Präsentation vorbereiten', category: 'Uni', priority: 'Hoch', due_date: heute, is_completed: false, quadrant: 'do' },
      { user_id: lena.id, title: 'Wäsche waschen', category: 'Haushalt', priority: 'Mittel', due_date: null, is_completed: false, quadrant: 'delegate' },
    ])
    await db.table('habits').insert({ user_id: lena.id, name: 'Joggen', category: 'Sport' })

    console.log('✅ Test-Daten angelegt: max@test.de / lena@test.de (Passwort: passwort123)')
  }
}