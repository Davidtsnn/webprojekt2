import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    adonisjs({
      /**
       * Entrypoints of your application. Each entrypoint will
       * result in a separate bundle.
       */
      entrypoints: [
        'resources/css/app.css', // Login/Registrierung (über das Layout)
        'resources/css/home.css',
        'resources/css/calendar.css',
        'resources/css/todos.css',
        'resources/css/habits.css',
        'resources/css/focus.css',
        'resources/css/edit_todo.css',
        'resources/js/app.js',
      ],

      /**
       * Paths to watch and reload the browser on file change
       */
      reload: ['resources/views/**/*.edge'],
    }),
  ],

  server: {
    watch: {
      ignored: ['**/storage/**', '**/tmp/**'],
    },
  },
})
