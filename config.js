// config.js — BANCO DE PRODUÇÃO
// ⚠️ NÃO alterar este arquivo
const SB_URL = 'https://nathaeuqbeqlvkftbmes.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdGhhZXVxYmVxbHZrZnRibWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTc4MzYsImV4cCI6MjA5NTQ3MzgzNn0.9t3q5C_h1pRb11gqRtpGGVpOUGey5TBzvMgal8h6wtg';

const CLINICA_CONFIG = {
  nome: 'Dra. Anna Carolina Dias',
  especialidade: 'Harmonização Orofacial',
  logo: 'logo.jpg',
  // senha removida — autenticação agora via Supabase Auth
  pinLength: 4,
  loginEmail: 'clinica@annacarolina.com'
};

/**
 * authLogin — autentica o PIN via Supabase Auth.
 * O PIN digitado é usado como senha no Supabase (email fixo + PIN = senha).
 * Retorna Promise<{ok, error}>
 */
async function authLogin(pin) {
  try {
    const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY
      },
      body: JSON.stringify({
        email: CLINICA_CONFIG.loginEmail,
        password: pin
      })
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return { ok: false, error: data.error_description || data.error || 'PIN incorreto' };
    }

    // Armazena token Supabase + expiração (8 horas)
    const expires = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem('clinica_auth', JSON.stringify({
      ok: true,
      expires,
      access_token: data.access_token,
      refresh_token: data.refresh_token
    }));
    sessionStorage.setItem('clinica_auth', '1');

    return { ok: true };
  } catch (e) {
    return { ok: false, error: 'Erro de conexão. Verifique a internet.' };
  }
}
