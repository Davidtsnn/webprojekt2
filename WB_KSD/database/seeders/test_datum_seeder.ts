import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Nicht doppelt anlegen, falls schon vorhanden
    if (await User.findBy('email', 'max@test.de')) return

    // Datum relativ zu heute
    const tag = (offset: number) => {
      const d = new Date()
      d.setDate(d.getDate() + offset)
      return d.toISOString().split('T')[0]
    }
    const heute = tag(0)
    const morgen = tag(1)
    const in3Tagen = tag(3)
    const gestern = tag(-1)

    // ── Test-Nutzer (Passwörter werden automatisch gehasht) ──
    const max = await User.create({
      fullName: 'Max Mustermann',
      email: 'max@test.de',
      password: 'passwort123',
    })
    const lena = await User.create({
      fullName: 'Lena Beispiel',
      email: 'lena@test.de',
      password: 'passwort123',
    })

    // ── AUFGABEN für Max (deckt alle Varianten ab) ──
    await db.table('todos').multiInsert([
      // Kategorien · Prioritäten · alle Eisenhower-Quadranten
      { user_id: max.id, title: 'Mathe-Übung abgeben', category: 'Uni', priority: 'Hoch', due_date: heute, is_completed: false, quadrant: 'do' },
      { user_id: max.id, title: 'Hausarbeit schreiben', category: 'Uni', priority: 'Hoch', due_date: in3Tagen, is_completed: false, quadrant: 'plan' },
      { user_id: max.id, title: 'Paket abholen', category: 'Haushalt', priority: 'Mittel', due_date: morgen, is_completed: false, quadrant: 'delegate' },
      { user_id: max.id, title: 'Serie weiterschauen', category: 'Freizeit', priority: 'Niedrig', due_date: null, is_completed: false, quadrant: 'drop' },
      // In der Inbox (kein Quadrant) – eine schon erledigt
      { user_id: max.id, title: 'Wocheneinkauf', category: 'Haushalt', priority: 'Mittel', due_date: null, is_completed: true, quadrant: null },
      { user_id: max.id, title: 'Lerngruppe planen', category: 'Uni', priority: 'Niedrig', due_date: morgen, is_completed: false, quadrant: null },
    ])

    // ── GEWOHNHEITEN für Max (aktiv) + Logs ──
    const [wasserId] = await db.table('habits').insert({ user_id: max.id, name: 'Wasser trinken', category: 'Gesundheit', is_active: true })
    await db.table('habits').insert({ user_id: max.id, name: '20 Min. lesen', category: 'Lernen', is_active: true })
    const [joggenId] = await db.table('habits').insert({ user_id: max.id, name: 'Joggen', category: 'Sport', is_active: true })

    await db.table('habit_logs').multiInsert([
      { habit_id: wasserId, date: heute, done: true },
      { habit_id: wasserId, date: gestern, done: true }, // kleine "Streak"
      { habit_id: joggenId, date: heute, done: true },
    ])

    // ── Daten für Lena (eigener Account – sieht NICHTS von Max) ──
    await db.table('todos').multiInsert([
      { user_id: lena.id, title: 'Präsentation vorbereiten', category: 'Uni', priority: 'Hoch', due_date: heute, is_completed: false, quadrant: 'do' },
      { user_id: lena.id, title: 'Wäsche waschen', category: 'Haushalt', priority: 'Mittel', due_date: null, is_completed: false, quadrant: null },
    ])
    const [lenaHabitId] = await db.table('habits').insert({ user_id: lena.id, name: 'Meditieren', category: 'Mindfulness', is_active: true })
    await db.table('habit_logs').insert({ habit_id: lenaHabitId, date: heute, done: true })

    console.log('✅ Test-Daten angelegt:')
    console.log('   max@test.de  / passwort123')
    console.log('   lena@test.de / passwort123')
  }
}
