import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../views/AppLayout.vue'
import HomeView from '../views/HomeView.vue'
import InvoicesView from '../views/InvoicesView.vue'
import ChatsView from '../views/ChatsView.vue'
import SettingsView from '../views/SettingsView.vue'
import MessagePanel from '../components/body/MessagePanel.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'invoice',
          name: 'invoices',
          component: InvoicesView,
        },
        {
          path: 'chats',
          name: 'chats',
          component: ChatsView,
        },
        {
          path: 'chat/:peerName',
          name: 'chat-peer',
          component: MessagePanel,
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsView,
        },
      ],
    },
  ],
})

export default router
