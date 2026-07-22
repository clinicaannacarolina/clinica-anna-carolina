// config.js — PRODUÇÃO
// Usar var para permitir que outras páginas referenciem sem conflito de redeclaração
var SB_URL = 'https://nathaeuqbeqlvkftbmes.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdGhhZXVxYmVxbHZrZnRibWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTc4MzYsImV4cCI6MjA5NTQ3MzgzNn0.9t3q5C_h1pRb11gqRtpGGVpOUGey5TBzvMgal8h6wtg';

var CLINICA_CONFIG = {
  nome: 'Dra. Anna Carolina Dias',
  especialidade: 'Harmonização Orofacial',
  logo: 'logo.jpg',
  cor: '#1D9E75',
  pinLength: 4,
  loginEmail: 'clinica@annacarolina.com'
};

// ── Renovação automática do token ──
async function renovarTokenSeNecessario() {
  try {
    const auth = JSON.parse(localStorage.getItem('clinica_auth') || '{}');
    if (!auth.ok || !auth.refresh_token) return false;
    const faltam = auth.expires - Date.now();
    if (faltam < 2 * 60 * 60 * 1000) { // Renova se faltam menos de 2 horas
      const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
        body: JSON.stringify({ refresh_token: auth.refresh_token })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        localStorage.removeItem('clinica_auth');
        sessionStorage.removeItem('clinica_auth');
        window.location.href = 'login.html';
        return false;
      }
      const novaAuth = {
        ok: true,
        expires: Date.now() + 24 * 60 * 60 * 1000,
        access_token: data.access_token,
        refresh_token: data.refresh_token || auth.refresh_token
      };
      localStorage.setItem('clinica_auth', JSON.stringify(novaAuth));
      sessionStorage.setItem('clinica_auth', '1');
      return true;
    }
    return true;
  } catch(e) { return false; }
}

// Renova ao carregar e a cada 20 minutos
(async () => {
  const auth = JSON.parse(localStorage.getItem('clinica_auth') || '{}');
  if (auth.ok) await renovarTokenSeNecessario();
  setInterval(renovarTokenSeNecessario, 20 * 60 * 1000);
})();

// ── Carrega config da clínica do Supabase ──
async function carregarConfigClinica() {
  try {
    const auth = JSON.parse(localStorage.getItem('clinica_auth') || '{}');
    const token = auth.access_token || SB_KEY;
    // Lê da view pública (sem PIN/dados sensíveis) — usada em todas as páginas, inclusive as públicas
    const res = await fetch(`${SB_URL}/rest/v1/config_clinica_publica?select=*&limit=1`, {
      headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      const c = data[0];
      CLINICA_CONFIG.nome          = c.nome          || CLINICA_CONFIG.nome;
      CLINICA_CONFIG.especialidade = c.especialidade || CLINICA_CONFIG.especialidade;
      CLINICA_CONFIG.logo          = c.logo_url      || CLINICA_CONFIG.logo;
      CLINICA_CONFIG.cor           = c.cor_principal || CLINICA_CONFIG.cor;
      CLINICA_CONFIG.telefone      = c.telefone      || '';
      CLINICA_CONFIG.whatsapp      = c.whatsapp      || '';
      CLINICA_CONFIG.endereco      = c.endereco      || '';
      CLINICA_CONFIG.email         = c.email         || '';
      CLINICA_CONFIG.instagram     = c.instagram     || '';
      CLINICA_CONFIG._id           = c.id;
      document.documentElement.style.setProperty('--verde', c.cor_principal || '#1D9E75');
    }
  } catch(e) { /* usa fallback */ }
}

// ── Função auxiliar para criar cliente Supabase autenticado ──
function sbClient() {
  const auth = JSON.parse(localStorage.getItem('clinica_auth') || '{}');
  const token = auth.access_token || SB_KEY;
  const { createClient } = supabase;
  return createClient(SB_URL, SB_KEY, {
    global: { headers: { 'Authorization': `Bearer ${token}`, 'apikey': SB_KEY } }
  });
}

// ── Login via Supabase Auth (PIN como senha) ──
async function authLogin(pin, email) {
  try {
    const loginEmail = email || CLINICA_CONFIG.loginEmail;
    const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
      body: JSON.stringify({ email: loginEmail, password: pin })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      return { ok: false, error: data.error_description || 'PIN incorreto' };
    }
    const expires = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem('clinica_auth', JSON.stringify({
      ok: true, expires,
      access_token: data.access_token,
      refresh_token: data.refresh_token
    }));
    sessionStorage.setItem('clinica_auth', '1');
    return { ok: true };
  } catch(e) {
    return { ok: false, error: 'Erro de conexão.' };
  }
}
