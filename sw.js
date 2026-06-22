// ═══════════════════════════════════════════════════════════════
// Service Worker — Sistema de Gestão Clínica
// Responsável por: exibir notificações push locais e permitir
// instalação do app como PWA (Progressive Web App).
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'clinica-cache-v1';

// ── Instalação ──
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// ── Ativação ──
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Recebe mensagens do app (index.html) pedindo para mostrar notificação ──
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, url } = data;
    self.registration.showNotification(title || 'Clínica', {
      body: body || '',
      tag: tag || 'clinica-notif',
      icon: 'logo.jpg',
      badge: 'logo.jpg',
      data: { url: url || './index.html' },
      requireInteraction: false,
    });
  }
});

// ── Clique na notificação: abre/foca a aba do sistema ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './index.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ── Fetch: passthrough simples (sem cache agressivo, para sempre pegar dados atualizados) ──
self.addEventListener('fetch', (event) => {
  // Não interceptamos requisições — deixamos passar direto à rede.
  // Isso evita servir dados desatualizados de pacientes/agenda.
});
