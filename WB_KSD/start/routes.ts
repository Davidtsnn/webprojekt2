import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { middleware } from '#start/kernel'

const SessionController = () => import('#controllers/session_controller')
const NewAccountController = () => import('#controllers/new_account_controller')

/* ── ÖFFENTLICH: Login / Registrierung / Logout ── */
router.get('/login', [SessionController, 'create']).as('session.create')
router.post('/login', [SessionController, 'store']).as('session.store')
router.get('/register', [NewAccountController, 'create']).as('new_account.create')
router.post('/register', [NewAccountController, 'store']).as('new_account.store')
router.get('/logout', [SessionController, 'destroy']).as('session.destroy')


/* ── GESCHÜTZT: alles ab hier nur mit Login, gefiltert nach user_id ── */
router.group(() => {

  // Startseite
  router.get('/', async ({ view, auth }) => {
    const userId = auth.user!.id
    const habits = await db.from('habits').where('user_id', userId).select('*')
    const heute = new Date().toISOString().split('T')[0]
    const logsHeute = await db.from('habit_logs').where('date', heute)
    const habitsMitStatus = habits.map((habit) => {
      const istErledigt = logsHeute.find((log) => log.habit_id === habit.id)
      return { ...habit, isDoneToday: istErledigt ? true : false }
    })
    const todos = await db.from('todos').where('user_id', userId).select('*')
    return view.render('pages/home', { habits: habitsMitStatus, todos })
  }).as('home')

  // ── GEWOHNHEITEN ──
  router.post('/habits/log/:id', async ({ params, response }) => {
    const heute = new Date().toISOString().split('T')[0]
    const log = await db.from('habit_logs').where('habit_id', params.id).where('date', heute).first()
    if (log) {
      await db.from('habit_logs').where('habit_id', params.id).where('date', heute).delete()
    } else {
      await db.table('habit_logs').insert({ habit_id: params.id, date: heute, done: true })
    }
    return response.redirect().back()
  })

  router.post('/habits/create', async ({ request, response, auth }) => {
  await db.table('habits').insert({
    user_id: auth.user!.id,
    name: request.input('name'),
    category: request.input('category'),
    is_active: 1,
  })
  return response.redirect('/habits')
})

  router.get('/habits', async ({ view, auth }) => {
    const userId = auth.user!.id
    const habits = await db.from('habits').where('user_id', userId).select('*')
    const categories = await db.from('habit_categories').select('*')
    const heute = new Date().toISOString().split('T')[0]
    const logsHeute = await db.from('habit_logs').where('date', heute)
    const habitsMitStatus = habits.map((habit) => {
      const istErledigt = logsHeute.find((log) => log.habit_id === habit.id)
      return { ...habit, isDoneToday: istErledigt ? true : false }
    })
    return view.render('pages/habits', { habits: habitsMitStatus, categories, heute })
  })

  router.post('/habits/delete/:id', async ({ params, response, auth }) => {
    await db.from('habits').where('id', params.id).where('user_id', auth.user!.id).delete()
    return response.redirect('/habits')
  })

  // ── KATEGORIEN (für alle gleich) ──
  router.post('/habit-categories/create', async ({ request, response }) => {
    await db.table('habit_categories').insert({
      name: request.input('name'),
      emoji: request.input('emoji') || '✨',
    })
    return response.redirect('/habits')
  })


  // ── AUFGABEN ──
  router.get('/todos', async ({ view, request, auth }) => {
    const category = request.qs().category
    let query = db.from('todos').where('user_id', auth.user!.id).select('*')
    if (category) {
      query = query.where('category', category)
    }
    const todos = await query
    return view.render('pages/todos', { todos, currentCategory: category || null })
  })

  router.post('/todos/create', async ({ request, response, auth }) => {
    const title = request.input('title')
    const category = request.input('category')
    const priority = request.input('priority')
    const dueDate = request.input('due_date')

    const image = request.file('image', { size: '2mb', extnames: ['jpg', 'png', 'jpeg'] })
    let filePath = null
    if (image) {
      const fileName = `${new Date().getTime()}.${image.extname}`
      await image.move(app.makePath('public/uploads'), { name: fileName })
      filePath = `/uploads/${fileName}`
    }

    await db.table('todos').insert({
      user_id: auth.user!.id,
      title, category, priority, due_date: dueDate, file_path: filePath,
    })
    return response.redirect('/todos')
  })

  router.post('/todos/delete/:id', async ({ params, response, auth }) => {
    await db.from('todos').where('id', params.id).where('user_id', auth.user!.id).delete()
    return response.redirect('/todos')
  })

  router.post('/todos/complete/:id', async ({ params, response, auth }) => {
    const todo = await db.from('todos').where('id', params.id).where('user_id', auth.user!.id).first()
    await db.from('todos').where('id', params.id).where('user_id', auth.user!.id)
      .update({ is_completed: !todo.is_completed })
    return response.redirect().back()
  })

  router.get('/todos/edit/:id', async ({ params, view, auth }) => {
    const todo = await db.from('todos').where('id', params.id).where('user_id', auth.user!.id).first()
    return view.render('pages/edit_todo', { todo })
  })

  router.post('/todos/update/:id', async ({ params, request, response, auth }) => {
    await db.from('todos').where('id', params.id).where('user_id', auth.user!.id).update({
      title: request.input('title'),
      category: request.input('category'),
      priority: request.input('priority'),
      due_date: request.input('due_date'),
    })
    return response.redirect('/')
  })

  router.post('/todos/quadrant/:id', async ({ params, request, response, auth }) => {
    await db.from('todos').where('id', params.id).where('user_id', auth.user!.id)
      .update({ quadrant: request.input('quadrant') })
    return response.json({ success: true })
  })

  // ── KALENDER ──
  router.get('/calendar', async ({ view, auth }) => {
    const todos = await db.from('todos').where('user_id', auth.user!.id)
      .whereNotNull('due_date').select('*')
    return view.render('pages/calendar', { todos })
  })

  // ── FOKUS-TIMER ──
  router.get('/focus', async ({ view }) => {
    return view.render('pages/focus')
  })

// KATEGORIE LÖSCHEN
router.post('/habit-categories/delete/:id', async ({ params, response }) => {
  await db.from('habit_categories').where('id', params.id).delete()
  return response.redirect('/habits')
})
}).use(middleware.auth())
