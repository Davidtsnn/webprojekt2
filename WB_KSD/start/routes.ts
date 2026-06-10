import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'




// HAUPTSEITE ANZEIGEN 
router.get('/', async ({ view }) => {
  // 1. FESTE GEWOHNHEITEN HOLEN & CHECKEN
  const habits = await db.from('habits').select('*')
  const heute = new Date().toISOString().split('T')[0]
  const logsHeute = await db.from('habit_logs').where('date', heute)

  const habitsMitStatus = habits.map(habit => {
    const istErledigt = logsHeute.find(log => log.habit_id === habit.id)
    return { ...habit, isDoneToday: istErledigt ? true : false }
  })

  // 2. FLEXIBLE TO-DOS HOLEN
  const todos = await db.from('todos').select('*')

  // 3. BEIDES AN DAS HTML ÜBERGEBEN
  return view.render('pages/home', { 
    habits: habitsMitStatus, 
    todos: todos 
  })
})







// FESTE GEWOHNHEITEN
router.post('/habits/log/:id', async ({ params, response }) => {
  const heute = new Date().toISOString().split('T')[0]
  await db.table('habit_logs').insert({
    habit_id: params.id,
    date: heute,        
    done: true          
  })
  return response.redirect('/')
})








// NEUE GEWOHNHEIT SPEICHERN
router.post('/habits/create', async ({ request, response }) => {
  const name = request.input('name')
  const category = request.input('category')

  await db.table('habits').insert({
    name: name,
    category: category,
  })

  return response.redirect('/')
})


// DO'S 


router.post('/todos/create', async ({ request, response }) => {
  const title = request.input('title')
  const category = request.input('category')
  const priority = request.input('priority')
  const dueDate = request.input('due_date')

  const image = request.file('image', {
    size: '2mb',
    extnames: ['jpg', 'png', 'jpeg']
  })

  let filePath = null

  if (image) {
    const fileName = `${new Date().getTime()}.${image.extname}`
  
    await image.move(app.makePath('public/uploads'), {
      name: fileName
    })
    
    filePath = `/uploads/${fileName}`
  }

  await db.table('todos').insert({
    title: title,
    category: category,
    priority: priority,
    due_date: dueDate,
    file_path: filePath 
    
  })

  return response.redirect('/')
})

// To-Do löschen
router.post('/todos/delete/:id', async ({ params, response }) => {
  await db.from('todos').where('id', params.id).delete()
  return response.redirect('/')
})

// To-Do als erledigt markieren 
router.post('/todos/complete/:id', async ({ params, response }) => {
  const todo = await db.from('todos').where('id', params.id).first()

  await db.from('todos').where('id', params.id).update({
    is_completed: !todo.is_completed
  })
  return response.redirect('/')
})

router.get('/todos/edit/:id', async ({ params, view }) => {
  // Wir suchen genau das To-Do aus der Datenbank, das wir angeklickt haben
  const todo = await db.from('todos').where('id', params.id).first()
  return view.render('pages/edit_todo', { todo: todo })
})

// 2. Die Änderungen speichern
router.post('/todos/update/:id', async ({ params, request, response }) => {
  // Wir überschreiben die alten Daten mit den neuen Eingaben aus dem Formular
  await db.from('todos').where('id', params.id).update({
    title: request.input('title'),
    category: request.input('category'),
    priority: request.input('priority'),
    due_date: request.input('due_date')
  })
  
  // Danach geht's automatisch zurück zum Dashboard
  return response.redirect('/')
})








// Einmalige Route, um die 3 festen Gewohnheiten anzulegen
router.get('/setup-habits', async () => {
  await db.table('habits').multiInsert([
    { name: 'Wasser trinken', category: 'Gesundheit' },
    { name: '20 Min. Lesen', category: 'Lernen' },
    { name: 'Dehnen', category: 'Sport' }
  ])
  return 'Die 3 festen Gewohnheiten wurden erfolgreich in die Datenbank geschrieben! Du kannst diese Route jetzt wieder aus dem Code löschen.'
})


























// =========================================================
// NEUE SEITE: FOKUS TIMER
// =========================================================
router.get('/focus', async ({ view }) => {
  return view.render('pages/focus') // Wir laden eine neue HTML-Datei
})




// =========================================================
// NEUE SEITE: KALENDER
// =========================================================

router.get('/calendar', async ({ view }) => {
  const todos = await db.from('todos').whereNotNull('due_date').select('*')
  return view.render('pages/calendar', { todos: todos })
})