// config.js — BANCO DE PRODUÇÃO
// ⚠️ NÃO alterar este arquivo
const SB_URL = 'https://nathaeuqbeqlvkftbmes.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdGhhZXVxYmVxbHZrZnRibWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTc4MzYsImV4cCI6MjA5NTQ3MzgzNn0.9t3q5C_h1pRb11gqRtpGGVpOUGey5TBzvMgal8h6wtg';

const CLINICA_CONFIG = {
  nome: 'Dra. Anna Carolina Dias',
  especialidade: 'Harmonização Orofacial',
  logo: 'logo.jpg',
  senha: '2411'
};

function authLogin(pin){
  if(pin === CLINICA_CONFIG.senha){
    const expires = Date.now() + 8 * 60 * 60 * 1000; // 8 horas
    localStorage.setItem('clinica_auth', JSON.stringify({ok:true, expires}));
    sessionStorage.setItem('clinica_auth','1');
    return true;
  }
  return false;
}
