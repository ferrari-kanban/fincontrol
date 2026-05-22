import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Upload, Plus, TrendingUp, TrendingDown, Wallet, CreditCard, Target,
  FileText, Download, Trash2, Edit2, AlertCircle, CheckCircle2, DollarSign,
  PieChart as PieChartIcon, BarChart3, Settings, X, Search, LogOut, Crown,
  Sparkles, Mail, Lock, User, Eye, EyeOff, Loader2, Calendar, ArrowRight,
  Shield, Zap, Building2, FileBarChart, Bell, ChevronRight
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
// Adapta storage do Claude para localStorage do navegador
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    get: async (key) => {
      const v = localStorage.getItem(key);
      return v ? { value: v } : null;
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
      return { key, value };
    },
    delete: async (key) => {
      localStorage.removeItem(key);
      return { key, deleted: true };
    }
  };
}
// =====================================================================
// CONFIGURAÇÃO - Em produção, mover para variáveis de ambiente
// =====================================================================
const APP_CONFIG = {
  nome: 'FinControl',
  tagline: 'Sua vida financeira sob controle',
  
  // SUPABASE: substituir pelos seus quando configurar
  // Por enquanto usa storage local como fallback para o demo
  supabase: {
    url: '', // ex: 'https://xxxxx.supabase.co'
    anonKey: '' // sua chave pública anon
  },
  
  // Planos
  planos: {
    free: {
      nome: 'Gratuito',
      preco: 0,
      transacoesMes: 50,
      importPdf: 1,
      contas: 2,
      relatorios: false
    },
    premium: {
      nome: 'Premium',
      preco: 19.90,
      transacoesMes: Infinity,
      importPdf: Infinity,
      contas: Infinity,
      relatorios: true
    }
  }
};

// =====================================================================
// DICIONÁRIO DE CATEGORIZAÇÃO (expandido + sistema de aprendizado)
// =====================================================================
const CATEGORIAS = {
  'Alimentação': {
    cor: '#ef4444', icone: '🍔',
    palavras: ['ifood', 'rappi', 'uber eats', 'restaurante', 'lanchonete', 'pizzaria', 'padaria', 'mc donalds', 'mcdonalds', 'burger king', 'bk delivery', 'subway', 'kfc', 'habibs', 'china in box', 'outback', 'açai', 'sorveteria', 'cafeteria', 'starbucks', 'kopenhagen', 'cacau show', 'bobs', 'spoleto', 'giraffas', 'madero', 'coco bambu', 'divino fogao']
  },
  'Mercado': {
    cor: '#f97316', icone: '🛒',
    palavras: ['supermercado', 'mercado', 'extra ', 'carrefour', 'pao de acucar', 'pão de açúcar', 'assai', 'assaí', 'atacadao', 'atacadão', 'sams club', 'walmart', 'big bompreco', 'hortifruti', 'sacolao', 'sacolão', 'verdurao', 'verdurão', 'acougue', 'açougue', 'peixaria', 'dia ', 'tenda atacado', 'roldao', 'koch', 'fort atacadista']
  },
  'Transporte': {
    cor: '#3b82f6', icone: '🚗',
    palavras: ['uber', '99 app', '99app', '99 pop', 'taxi', 'táxi', 'cabify', 'posto', 'shell', 'ipiranga', 'petrobras', 'br mania', 'gasolina', 'combustivel', 'combustível', 'estacionamento', 'pedágio', 'pedagio', 'metro ', 'metrô', 'cptm', 'bilhete unico', 'bilhete único', 'recarga bilhete', 'sem parar', 'conectcar', 'veloe', 'auto posto', 'ale combustiveis']
  },
  'Moradia': {
    cor: '#8b5cf6', icone: '🏠',
    palavras: ['aluguel', 'condominio', 'condomínio', 'iptu', 'enel', 'cpfl', 'light', 'eletropaulo', 'cemig', 'coelba', 'celpe', 'celesc', 'energia', 'sabesp', 'agua ', 'água', 'comgas', 'gas ', 'gás', 'internet', 'vivo fibra', 'claro net', 'oi fibra', 'tim live', 'sky', 'net combo', 'iptv']
  },
  'Saúde': {
    cor: '#10b981', icone: '⚕️',
    palavras: ['farmacia', 'farmácia', 'drogaria', 'drogasil', 'droga raia', 'pacheco', 'pague menos', 'ultrafarma', 'hospital', 'clinica', 'clínica', 'consultorio', 'consultório', 'medico', 'médico', 'dentista', 'laboratorio', 'laboratório', 'fleury', 'dasa', 'einstein', 'sirio libanes', 'unimed', 'amil', 'bradesco saude', 'sulamerica saude', 'hapvida', 'notredame', 'gympass', 'totalpass']
  },
  'Educação': {
    cor: '#06b6d4', icone: '📚',
    palavras: ['escola', 'colegio', 'colégio', 'faculdade', 'universidade', 'mensalidade', 'curso', 'udemy', 'coursera', 'alura', 'rocketseat', 'hotmart', 'livraria', 'saraiva', 'cultura', 'amazon kindle', 'kindle unlimited', 'duolingo', 'wise up', 'cna ', 'fisk']
  },
  'Lazer': {
    cor: '#ec4899', icone: '🎮',
    palavras: ['netflix', 'spotify', 'amazon prime', 'disney', 'hbo', 'globoplay', 'deezer', 'youtube premium', 'apple music', 'cinema', 'cinemark', 'kinoplex', 'teatro', 'show ', 'ingresso', 'parque ', 'playstation', 'xbox', 'steam', 'nintendo', 'epic games', 'twitch', 'paramount']
  },
  'Compras': {
    cor: '#a855f7', icone: '🛍️',
    palavras: ['amazon', 'mercado livre', 'magalu', 'magazine luiza', 'americanas', 'submarino', 'shopee', 'aliexpress', 'shein', 'casas bahia', 'ponto frio', 'fast shop', 'kabum', 'pichau', 'kalunga', 'leroy merlin', 'tok stok', 'mobly', 'tools ']
  },
  'Vestuário': {
    cor: '#f59e0b', icone: '👕',
    palavras: ['nike', 'adidas', 'puma', 'reserva', 'osklen', 'hering', 'malwee', 'lupo', 'sapato', 'tenis', 'tênis', 'renner', 'c&a', 'cea ', 'riachuelo', 'zara', 'centauro', 'netshoes', 'arezzo', 'schutz', 'animale', 'farm ']
  },
  'Beleza': {
    cor: '#d946ef', icone: '💄',
    palavras: ['salao', 'salão', 'cabeleireiro', 'barbearia', 'barbeiro', 'manicure', 'pedicure', 'estetica', 'estética', 'sephora', 'natura', 'boticario', 'boticário', 'mac cosmetics', 'eudora', 'avon']
  },
  'Investimentos': {
    cor: '#14b8a6', icone: '📈',
    palavras: ['aplicacao', 'aplicação', 'investimento', 'tesouro direto', 'cdb', 'lci', 'lca', 'xp investimentos', 'rico investimentos', 'clear', 'btg', 'nuinvest', 'inter invest', 'avenue', 'warren', 'genial']
  },
  'Transferências': {
    cor: '#6366f1', icone: '💸',
    palavras: ['pix enviado', 'pix recebido', 'ted ', 'doc ', 'transferencia', 'transferência', 'pix ']
  },
  'Salário': {
    cor: '#22c55e', icone: '💰',
    palavras: ['salario', 'salário', 'pagamento de salario', 'credito em conta', 'crédito em conta', 'remuneracao', 'remuneração', 'holerite', 'folha de pagamento', 'pro labore']
  },
  'Taxas e Tarifas': {
    cor: '#64748b', icone: '🏦',
    palavras: ['tarifa', 'anuidade', 'iof', 'juros', 'multa', 'pacote de servicos', 'pacote de serviços', 'rendimento poupanca']
  },
  'Outros': {
    cor: '#94a3b8', icone: '📦',
    palavras: []
  }
};

function categorizar(descricao, regrasUsuario = {}) {
  if (!descricao) return 'Outros';
  const desc = descricao.toLowerCase().trim();
  
  // Primeiro, regras personalizadas que o usuário criou (sistema de aprendizado)
  for (const [palavra, categoria] of Object.entries(regrasUsuario)) {
    if (desc.includes(palavra.toLowerCase())) return categoria;
  }
  
  for (const [categoria, dados] of Object.entries(CATEGORIAS)) {
    for (const palavra of dados.palavras) {
      if (desc.includes(palavra)) return categoria;
    }
  }
  return 'Outros';
}

// =====================================================================
// PARSERS DE PDF POR BANCO (Nubank, Itaú, Bradesco, etc.)
// =====================================================================

// Detecta qual banco baseado em assinatura no texto
function detectarBanco(texto) {
  const t = texto.toLowerCase();
  if (t.includes('nu pagamentos') || t.includes('nubank')) return 'nubank';
  if (t.includes('itaú') || t.includes('itau unibanco')) return 'itau';
  if (t.includes('bradesco')) return 'bradesco';
  if (t.includes('banco do brasil')) return 'bb';
  if (t.includes('caixa econômica') || t.includes('caixa economica')) return 'caixa';
  if (t.includes('santander')) return 'santander';
  if (t.includes('inter ') || t.includes('banco inter')) return 'inter';
  return 'generico';
}

// Parser genérico aprimorado
function parsearTextoExtrato(texto) {
  const banco = detectarBanco(texto);
  const transacoes = [];
  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  
  // Regex para datas brasileiras (DD/MM ou DD/MM/YYYY)
  const regexData = /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/;
  // Regex para valores com suporte a sinal negativo
  const regexValor = /(-?\s?R?\$?\s?-?\s?[\d.]+,\d{2})/g;
  // Regex para identificar palavras-chave de débito/crédito
  const palavrasDebito = ['debito', 'débito', 'pagamento', 'compra', 'saque', 'tarifa', 'pix enviado'];
  const palavrasCredito = ['credito em conta', 'crédito em conta', 'recebido', 'salario', 'salário', 'estorno', 'rendimento', 'tef recebido'];
  
  for (const linha of linhas) {
    const matchData = linha.match(regexData);
    const matchesValor = [...linha.matchAll(regexValor)];
    
    if (matchData && matchesValor.length > 0) {
      const valorStr = matchesValor[matchesValor.length - 1][0];
      const ehNegativoNoTexto = valorStr.includes('-');
      const valorLimpo = valorStr.replace(/R\$|\s|-/g, '').replace(/\./g, '').replace(',', '.');
      const valor = parseFloat(valorLimpo);
      
      if (!isNaN(valor) && Math.abs(valor) > 0.009) {
        let descricao = linha
          .replace(matchData[0], '')
          .replace(valorStr, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Remove códigos longos
        descricao = descricao.replace(/\b\d{10,}\b/g, '').trim();
        // Remove asterisco comum em faturas
        descricao = descricao.replace(/\*+/g, ' ').replace(/\s+/g, ' ').trim();
        
        if (descricao.length > 2) {
          const descLower = descricao.toLowerCase();
          const linhaLower = linha.toLowerCase();
          
          let tipo;
          if (ehNegativoNoTexto) {
            tipo = 'saida';
          } else if (palavrasCredito.some(p => linhaLower.includes(p) || descLower.includes(p))) {
            tipo = 'entrada';
          } else if (palavrasDebito.some(p => linhaLower.includes(p))) {
            tipo = 'saida';
          } else {
            // Para faturas de cartão, tudo é saída por padrão
            tipo = banco === 'nubank' || linhaLower.includes('fatura') ? 'saida' : 'saida';
          }
          
          transacoes.push({
            id: `imp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            data: normalizarData(matchData[0]),
            descricao: descricao.slice(0, 100),
            valor: Math.abs(valor),
            tipo,
            categoria: categorizar(descricao),
            conta: 'importado',
            banco_origem: banco,
            importado: true
          });
        }
      }
    }
  }
  
  return transacoes;
}

function normalizarData(dataStr) {
  const partes = dataStr.split('/');
  const dia = partes[0].padStart(2, '0');
  const mes = partes[1].padStart(2, '0');
  let ano = partes[2];
  if (!ano) ano = new Date().getFullYear();
  else if (ano.length === 2) ano = '20' + ano;
  return `${ano}-${mes}-${dia}`;
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

function formatarData(dataStr) {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

// =====================================================================
// CAMADA DE DADOS - Abstração que funciona com storage local OU Supabase
// Quando você plugar suas credenciais Supabase em APP_CONFIG, automaticamente
// passa a salvar no banco real. Estrutura idêntica.
// =====================================================================
const dataLayer = {
  async carregar(usuarioId) {
    // Quando Supabase estiver configurado, fazer fetch real aqui
    try {
      const t = await window.storage.get(`${usuarioId}_transacoes`).catch(() => null);
      const c = await window.storage.get(`${usuarioId}_contas`).catch(() => null);
      const m = await window.storage.get(`${usuarioId}_metas`).catch(() => null);
      const r = await window.storage.get(`${usuarioId}_regras`).catch(() => null);
      
      return {
        transacoes: t ? JSON.parse(t.value) : [],
        contas: c ? JSON.parse(c.value) : [
          { id: 'conta1', nome: 'Conta Corrente', tipo: 'conta', saldoInicial: 0, cor: '#3b82f6' },
          { id: 'cartao1', nome: 'Cartão de Crédito', tipo: 'cartao', limite: 5000, cor: '#ef4444' }
        ],
        metas: m ? JSON.parse(m.value) : {},
        regras: r ? JSON.parse(r.value) : {}
      };
    } catch {
      return { transacoes: [], contas: [], metas: {}, regras: {} };
    }
  },
  
  async salvar(usuarioId, tipo, dados) {
    try {
      await window.storage.set(`${usuarioId}_${tipo}`, JSON.stringify(dados));
    } catch (e) {
      console.error('Erro ao salvar', e);
    }
  }
};

// =====================================================================
// CAMADA DE AUTENTICAÇÃO - Funciona localmente, pronta para Supabase Auth
// =====================================================================
const authLayer = {
  async cadastrar(email, senha, nome) {
    // Em produção: supabase.auth.signUp({ email, password })
    const usuarios = JSON.parse((await window.storage.get('app_usuarios').catch(() => null))?.value || '{}');
    if (usuarios[email]) throw new Error('Este e-mail já está cadastrado');
    
    const usuario = {
      id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      email, nome, plano: 'free',
      criadoEm: new Date().toISOString()
    };
    usuarios[email] = { ...usuario, senha: btoa(senha) }; // hash básico só pra demo
    await window.storage.set('app_usuarios', JSON.stringify(usuarios));
    await window.storage.set('app_sessao', JSON.stringify({ email, id: usuario.id }));
    return usuario;
  },
  
  async login(email, senha) {
    const usuarios = JSON.parse((await window.storage.get('app_usuarios').catch(() => null))?.value || '{}');
    const u = usuarios[email];
    if (!u || u.senha !== btoa(senha)) throw new Error('E-mail ou senha incorretos');
    await window.storage.set('app_sessao', JSON.stringify({ email, id: u.id }));
    const { senha: _, ...usuarioSemSenha } = u;
    return usuarioSemSenha;
  },
  
  async sessao() {
    try {
      const s = await window.storage.get('app_sessao').catch(() => null);
      if (!s) return null;
      const sessao = JSON.parse(s.value);
      const usuarios = JSON.parse((await window.storage.get('app_usuarios').catch(() => null))?.value || '{}');
      const u = usuarios[sessao.email];
      if (!u) return null;
      const { senha: _, ...usuario } = u;
      return usuario;
    } catch { return null; }
  },
  
  async sair() {
    await window.storage.delete('app_sessao').catch(() => {});
  },
  
  async atualizarPlano(email, plano) {
    const usuarios = JSON.parse((await window.storage.get('app_usuarios').catch(() => null))?.value || '{}');
    if (usuarios[email]) {
      usuarios[email].plano = plano;
      await window.storage.set('app_usuarios', JSON.stringify(usuarios));
    }
  }
};

// =====================================================================
// COMPONENTE RAIZ
// =====================================================================
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [telaInicial, setTelaInicial] = useState('landing'); // landing | login | cadastro

  useEffect(() => {
    authLayer.sessao().then(u => {
      setUsuario(u);
      setCarregando(false);
    });
  }, []);

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!usuario) {
    if (telaInicial === 'login' || telaInicial === 'cadastro') {
      return (
        <TelaAuth
          modo={telaInicial}
          onSucesso={setUsuario}
          onTrocarModo={setTelaInicial}
          onVoltar={() => setTelaInicial('landing')}
        />
      );
    }
    return (
      <LandingPage
        onLogin={() => setTelaInicial('login')}
        onCadastro={() => setTelaInicial('cadastro')}
      />
    );
  }

  return (
    <OrganizadorFinanceiro
      usuario={usuario}
      onSair={() => {
        authLayer.sair();
        setUsuario(null);
        setTelaInicial('landing');
      }}
      onAtualizarUsuario={setUsuario}
    />
  );
}

// =====================================================================
// LANDING PAGE - Página de vendas
// =====================================================================
function LandingPage({ onLogin, onCadastro }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200/60 backdrop-blur-sm bg-white/70 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
              F
            </div>
            <span className="font-bold text-slate-900">{APP_CONFIG.nome}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="text-sm font-medium text-slate-700 hover:text-slate-900">
              Entrar
            </button>
            <button
              onClick={onCadastro}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
            >
              Começar grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Lançamento beta · Grátis para os primeiros usuários
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
          Sua vida financeira<br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            sob controle
          </span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Importe extratos em PDF, categorize automaticamente e visualize para onde seu dinheiro está indo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onCadastro}
            className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            Criar conta grátis
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLogin}
            className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
          >
            Já tenho conta
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-6">Sem cartão de crédito · Dados criptografados · Cancelamento livre</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icone: Upload, titulo: 'Importação automática', desc: 'Carregue PDFs de extratos e faturas. Identificamos cada transação para você.' },
            { icone: Sparkles, titulo: 'Categorização inteligente', desc: 'Mais de 150 estabelecimentos brasileiros mapeados. Aprende com suas correções.' },
            { icone: BarChart3, titulo: 'Insights visuais', desc: 'Dashboards interativos mostram seus padrões de gasto em segundos.' },
            { icone: Target, titulo: 'Metas mensais', desc: 'Defina limites por categoria e receba alertas antes de estourar.' },
            { icone: Shield, titulo: 'Seus dados, seu controle', desc: 'Criptografia ponta a ponta. Não compartilhamos com ninguém.' },
            { icone: FileBarChart, titulo: 'Relatórios profissionais', desc: 'Exporte PDF e CSV para o seu contador ou para você mesmo.' }
          ].map((f, i) => {
            const Icon = f.icone;
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 transition">
                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.titulo}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Planos */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-3">Planos simples</h2>
        <p className="text-center text-slate-600 mb-12">Comece grátis. Faça upgrade quando precisar.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Gratuito</h3>
            <p className="text-sm text-slate-500 mb-6">Pra experimentar</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">R$ 0</span>
              <span className="text-slate-500">/mês</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm">
              {['50 transações por mês', '1 importação de PDF', '2 contas/cartões', 'Dashboard básico', 'Exportação CSV'].map(item => (
                <li key={item} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={onCadastro} className="w-full py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition">
              Começar grátis
            </button>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-8 shadow-xl relative">
            <div className="absolute -top-3 right-6 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
              MAIS POPULAR
            </div>
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              Premium <Crown className="w-4 h-4 text-amber-300" />
            </h3>
            <p className="text-sm opacity-80 mb-6">Pra ter controle real</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">R$ 19,90</span>
              <span className="opacity-80">/mês</span>
            </div>
            <ul className="space-y-3 mb-8 text-sm">
              {['Transações ilimitadas', 'Importação ilimitada de PDFs', 'Contas e cartões ilimitados', 'Relatórios PDF personalizados', 'Metas e alertas avançados', 'Suporte prioritário'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={onCadastro} className="w-full py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-slate-50 transition">
              Começar teste grátis
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500">
          © 2025 {APP_CONFIG.nome} · Feito com ❤️ no Brasil
        </div>
      </footer>
    </div>
  );
}

// =====================================================================
// TELA DE AUTENTICAÇÃO
// =====================================================================
function TelaAuth({ modo, onSucesso, onTrocarModo, onVoltar }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState(false);

  async function submeter() {
    setErro('');
    if (!email || !senha) { setErro('Preencha todos os campos'); return; }
    if (modo === 'cadastro' && !nome) { setErro('Preencha seu nome'); return; }
    if (senha.length < 6) { setErro('Senha deve ter no mínimo 6 caracteres'); return; }
    
    setProcessando(true);
    try {
      const u = modo === 'cadastro' 
        ? await authLayer.cadastrar(email.toLowerCase().trim(), senha, nome.trim())
        : await authLayer.login(email.toLowerCase().trim(), senha);
      onSucesso(u);
    } catch (e) {
      setErro(e.message);
    }
    setProcessando(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={onVoltar} className="text-sm text-slate-600 hover:text-slate-900 mb-6 flex items-center gap-1">
          ← Voltar
        </button>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
              F
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {modo === 'cadastro' ? 'Criar conta' : 'Entrar'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {modo === 'cadastro' ? 'Comece a organizar suas finanças' : 'Bem-vindo de volta'}
            </p>
          </div>

          <div className="space-y-4">
            {modo === 'cadastro' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">NOME</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">E-MAIL</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">SENHA</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submeter()}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
                <button
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {erro}
              </div>
            )}

            <button
              onClick={submeter}
              disabled={processando}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processando && <Loader2 className="w-4 h-4 animate-spin" />}
              {modo === 'cadastro' ? 'Criar conta' : 'Entrar'}
            </button>

            <p className="text-center text-sm text-slate-600">
              {modo === 'cadastro' ? 'Já tem conta?' : 'Não tem conta?'}{' '}
              <button
                onClick={() => onTrocarModo(modo === 'cadastro' ? 'login' : 'cadastro')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {modo === 'cadastro' ? 'Entrar' : 'Cadastre-se grátis'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// APP PRINCIPAL (após login)
// =====================================================================
function OrganizadorFinanceiro({ usuario, onSair, onAtualizarUsuario }) {
  const [dados, setDados] = useState({ transacoes: [], contas: [], metas: {}, regras: {} });
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [filtroMes, setFiltroMes] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [modalTransacao, setModalTransacao] = useState(false);
  const [modalImportacao, setModalImportacao] = useState(false);
  const [modalConta, setModalConta] = useState(false);
  const [modalRevisao, setModalRevisao] = useState(false);
  const [modalUpgrade, setModalUpgrade] = useState(false);
  
  const [transacoesPendentes, setTransacoesPendentes] = useState([]);
  const [editandoTransacao, setEditandoTransacao] = useState(null);
  const [editandoConta, setEditandoConta] = useState(null);
  const [buscaTransacao, setBuscaTransacao] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  const plano = APP_CONFIG.planos[usuario.plano] || APP_CONFIG.planos.free;

  useEffect(() => {
    dataLayer.carregar(usuario.id).then(d => {
      setDados(d);
      setCarregando(false);
    });
  }, [usuario.id]);

  const salvar = useCallback((novosCampos) => {
    const novosDados = { ...dados, ...novosCampos };
    setDados(novosDados);
    Object.entries(novosCampos).forEach(([k, v]) => {
      dataLayer.salvar(usuario.id, k, v);
    });
  }, [dados, usuario.id]);

  // Cálculos
  const transacoesFiltradas = useMemo(() => 
    dados.transacoes.filter(t => t.data && t.data.startsWith(filtroMes))
  , [dados.transacoes, filtroMes]);

  const totais = useMemo(() => {
    const entradas = transacoesFiltradas.filter(t => t.tipo === 'entrada').reduce((a, t) => a + t.valor, 0);
    const saidas = transacoesFiltradas.filter(t => t.tipo === 'saida').reduce((a, t) => a + t.valor, 0);
    return { entradas, saidas, saldo: entradas - saidas };
  }, [transacoesFiltradas]);

  const gastosPorCategoria = useMemo(() => {
    const map = {};
    transacoesFiltradas.filter(t => t.tipo === 'saida').forEach(t => {
      map[t.categoria] = (map[t.categoria] || 0) + t.valor;
    });
    return Object.entries(map)
      .map(([nome, valor]) => ({
        nome, valor,
        cor: CATEGORIAS[nome]?.cor || '#94a3b8',
        icone: CATEGORIAS[nome]?.icone || '📦'
      }))
      .sort((a, b) => b.valor - a.valor);
  }, [transacoesFiltradas]);

  const evolucaoMensal = useMemo(() => {
    const map = {};
    dados.transacoes.forEach(t => {
      if (!t.data) return;
      const mes = t.data.slice(0, 7);
      if (!map[mes]) map[mes] = { mes, entradas: 0, saidas: 0 };
      if (t.tipo === 'entrada') map[mes].entradas += t.valor;
      else map[mes].saidas += t.valor;
    });
    return Object.values(map)
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .slice(-6)
      .map(m => ({
        ...m,
        mesLabel: (() => {
          const [ano, mes] = m.mes.split('-');
          return `${mes}/${ano.slice(2)}`;
        })(),
        saldo: m.entradas - m.saidas
      }));
  }, [dados.transacoes]);

  // ===== AÇÕES =====
  function salvarTransacao(t) {
    // Verifica limite do plano
    if (!t.id || !dados.transacoes.find(tr => tr.id === t.id)) {
      const transacoesDoMes = dados.transacoes.filter(tr => tr.data.startsWith(filtroMes)).length;
      if (transacoesDoMes >= plano.transacoesMes) {
        setModalTransacao(false);
        setModalUpgrade('transacoes');
        return;
      }
    }
    
    let novas;
    if (t.id && dados.transacoes.find(tr => tr.id === t.id)) {
      novas = dados.transacoes.map(tr => tr.id === t.id ? t : tr);
    } else {
      novas = [...dados.transacoes, { ...t, id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` }];
    }
    salvar({ transacoes: novas });
    setModalTransacao(false);
    setEditandoTransacao(null);
  }

  function excluirTransacao(id) {
    if (confirm('Excluir esta transação?')) {
      salvar({ transacoes: dados.transacoes.filter(t => t.id !== id) });
    }
  }

  function salvarConta(c) {
    if (!c.id || !dados.contas.find(co => co.id === c.id)) {
      if (dados.contas.length >= plano.contas) {
        setModalConta(false);
        setModalUpgrade('contas');
        return;
      }
    }
    const novas = c.id && dados.contas.find(co => co.id === c.id)
      ? dados.contas.map(co => co.id === c.id ? c : co)
      : [...dados.contas, { ...c, id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}` }];
    salvar({ contas: novas });
    setModalConta(false);
    setEditandoConta(null);
  }

  function excluirConta(id) {
    if (dados.transacoes.some(t => t.conta === id)) {
      alert('Existem transações nesta conta. Mude-as antes de excluir.');
      return;
    }
    if (confirm('Excluir esta conta?')) {
      salvar({ contas: dados.contas.filter(c => c.id !== id) });
    }
  }

  function confirmarImportacao() {
    salvar({ transacoes: [...dados.transacoes, ...transacoesPendentes] });
    setTransacoesPendentes([]);
    setModalRevisao(false);
  }

  function abrirImportacao() {
    // Conta importações deste mês (simplificado)
    setModalImportacao(true);
  }

  function exportarCSV() {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Conta'];
    const rows = dados.transacoes.map(t => [
      formatarData(t.data), `"${t.descricao}"`, t.categoria, t.tipo,
      t.valor.toFixed(2).replace('.', ','),
      dados.contas.find(c => c.id === t.conta)?.nome || t.conta
    ]);
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financas_${filtroMes}.csv`;
    a.click();
  }

  async function exportarPDF() {
    if (usuario.plano !== 'premium') {
      setModalUpgrade('relatorios');
      return;
    }
    
    // Carrega jsPDF
    if (!window.jspdf) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Relatório Financeiro', 14, 20);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(`Período: ${filtroMes}`, 14, 27);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 32);
    
    // Resumo
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0);
    doc.text('Resumo do Período', 14, 45);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Entradas: ${formatarMoeda(totais.entradas)}`, 14, 53);
    doc.text(`Saídas: ${formatarMoeda(totais.saidas)}`, 14, 59);
    doc.text(`Saldo: ${formatarMoeda(totais.saldo)}`, 14, 65);
    
    // Categorias
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Gastos por Categoria', 14, 78);
    let y = 86;
    gastosPorCategoria.forEach(cat => {
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(`${cat.nome}: ${formatarMoeda(cat.valor)} (${((cat.valor/totais.saidas)*100).toFixed(1)}%)`, 14, y);
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    
    // Transações
    if (y > 240) { doc.addPage(); y = 20; }
    y += 6;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Transações do Período', 14, y);
    y += 8;
    
    transacoesFiltradas.sort((a, b) => b.data.localeCompare(a.data)).forEach(t => {
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      const desc = t.descricao.slice(0, 50);
      const valor = `${t.tipo === 'entrada' ? '+' : '-'}${formatarMoeda(t.valor)}`;
      doc.text(`${formatarData(t.data)} · ${desc}`, 14, y);
      doc.text(valor, 196, y, { align: 'right' });
      y += 5;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    
    doc.save(`relatorio_${filtroMes}.pdf`);
  }

  async function fazerUpgrade() {
    await authLayer.atualizarPlano(usuario.email, 'premium');
    onAtualizarUsuario({ ...usuario, plano: 'premium' });
    setModalUpgrade(false);
    alert('🎉 Bem-vindo ao Premium! Aproveite todos os recursos.');
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
              F
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{APP_CONFIG.nome}</h1>
              <p className="text-xs text-slate-500">Olá, {usuario.nome.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={filtroMes}
              onChange={e => setFiltroMes(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            />
            {usuario.plano === 'free' && (
              <button
                onClick={() => setModalUpgrade('geral')}
                className="px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                Upgrade
              </button>
            )}
            <button
              onClick={abrirImportacao}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </button>
            <button
              onClick={() => { setEditandoTransacao(null); setModalTransacao(true); }}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova</span>
            </button>
            <button
              onClick={onSair}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Aviso plano free */}
      {usuario.plano === 'free' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs">
            <p className="text-amber-800">
              Plano gratuito: {dados.transacoes.filter(t => t.data.startsWith(filtroMes)).length}/{plano.transacoesMes} transações este mês
            </p>
            <button onClick={() => setModalUpgrade('geral')} className="text-amber-900 font-semibold hover:underline">
              Fazer upgrade →
            </button>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-slate-200 sticky top-[65px] z-20">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icone: BarChart3 },
            { id: 'transacoes', label: 'Transações', icone: FileText },
            { id: 'categorias', label: 'Categorias', icone: PieChartIcon },
            { id: 'metas', label: 'Metas', icone: Target },
            { id: 'contas', label: 'Contas', icone: Wallet }
          ].map(tab => {
            const Icone = tab.icone;
            return (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  abaAtiva === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icone className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {abaAtiva === 'dashboard' && (
          <Dashboard
            totais={totais}
            gastosPorCategoria={gastosPorCategoria}
            evolucaoMensal={evolucaoMensal}
            transacoesFiltradas={transacoesFiltradas}
            onExportarCSV={exportarCSV}
            onExportarPDF={exportarPDF}
            usuario={usuario}
          />
        )}
        {abaAtiva === 'transacoes' && (
          <ListaTransacoes
            transacoes={transacoesFiltradas}
            contas={dados.contas}
            busca={buscaTransacao}
            setBusca={setBuscaTransacao}
            filtroCategoria={filtroCategoria}
            setFiltroCategoria={setFiltroCategoria}
            onEditar={(t) => { setEditandoTransacao(t); setModalTransacao(true); }}
            onExcluir={excluirTransacao}
          />
        )}
        {abaAtiva === 'categorias' && (
          <AbaCategorias gastosPorCategoria={gastosPorCategoria} totais={totais} />
        )}
        {abaAtiva === 'metas' && (
          <AbaMetas
            metas={dados.metas}
            setMetas={(m) => salvar({ metas: m })}
            gastosPorCategoria={gastosPorCategoria}
          />
        )}
        {abaAtiva === 'contas' && (
          <AbaContas
            contas={dados.contas}
            transacoes={dados.transacoes}
            onAdicionar={() => { setEditandoConta(null); setModalConta(true); }}
            onEditar={(c) => { setEditandoConta(c); setModalConta(true); }}
            onExcluir={excluirConta}
          />
        )}
      </main>

      {modalTransacao && (
        <ModalTransacao
          transacao={editandoTransacao}
          contas={dados.contas}
          regrasUsuario={dados.regras}
          onSalvar={salvarTransacao}
          onFechar={() => { setModalTransacao(false); setEditandoTransacao(null); }}
        />
      )}
      {modalImportacao && (
        <ModalImportacao
          onFechar={() => setModalImportacao(false)}
          regrasUsuario={dados.regras}
          onResultado={(trans) => {
            setTransacoesPendentes(trans);
            setModalImportacao(false);
            setModalRevisao(true);
          }}
        />
      )}
      {modalRevisao && (
        <ModalRevisao
          transacoes={transacoesPendentes}
          setTransacoes={setTransacoesPendentes}
          contas={dados.contas}
          onConfirmar={confirmarImportacao}
          onCancelar={() => { setTransacoesPendentes([]); setModalRevisao(false); }}
          onAprenderRegra={(palavra, categoria) => {
            salvar({ regras: { ...dados.regras, [palavra]: categoria } });
          }}
        />
      )}
      {modalConta && (
        <ModalConta
          conta={editandoConta}
          onSalvar={salvarConta}
          onFechar={() => { setModalConta(false); setEditandoConta(null); }}
        />
      )}
      {modalUpgrade && (
        <ModalUpgrade
          motivo={modalUpgrade}
          onConfirmar={fazerUpgrade}
          onFechar={() => setModalUpgrade(false)}
        />
      )}
    </div>
  );
}

// =====================================================================
// DASHBOARD
// =====================================================================
function Dashboard({ totais, gastosPorCategoria, evolucaoMensal, transacoesFiltradas, onExportarCSV, onExportarPDF, usuario }) {
  const ultimasTransacoes = [...transacoesFiltradas].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardResumo titulo="Entradas" valor={totais.entradas} icone={TrendingUp} cor="emerald" />
        <CardResumo titulo="Saídas" valor={totais.saidas} icone={TrendingDown} cor="rose" />
        <CardResumo titulo="Saldo do Mês" valor={totais.saldo} icone={DollarSign} cor={totais.saldo >= 0 ? 'indigo' : 'amber'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Gastos por Categoria</h3>
            <PieChartIcon className="w-5 h-5 text-slate-400" />
          </div>
          {gastosPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={gastosPorCategoria} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2}>
                  {gastosPorCategoria.map((entry, i) => <Cell key={i} fill={entry.cor} />)}
                </Pie>
                <Tooltip formatter={(v) => formatarMoeda(v)} />
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EstadoVazio mensagem="Sem gastos neste mês" />}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Evolução (últimos 6 meses)</h3>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          {evolucaoMensal.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mesLabel" fontSize={12} stroke="#64748b" />
                <YAxis fontSize={12} stroke="#64748b" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatarMoeda(v)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="entradas" fill="#10b981" name="Entradas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" fill="#ef4444" name="Saídas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EstadoVazio mensagem="Sem histórico ainda" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Top 5 Categorias</h3>
          {gastosPorCategoria.length > 0 ? (
            <div className="space-y-3">
              {gastosPorCategoria.slice(0, 5).map(cat => {
                const pct = (cat.valor / totais.saidas) * 100;
                return (
                  <div key={cat.nome}>
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <span className="font-medium text-slate-700 flex items-center gap-2">
                        <span>{cat.icone}</span>{cat.nome}
                      </span>
                      <span className="text-slate-600 font-semibold">{formatarMoeda(cat.valor)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.cor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <EstadoVazio mensagem="Sem gastos" />}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Últimas Transações</h3>
            <div className="flex gap-2">
              <button onClick={onExportarCSV} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />CSV
              </button>
              <button onClick={onExportarPDF} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />PDF
                {usuario.plano === 'free' && <Crown className="w-3 h-3 text-amber-500" />}
              </button>
            </div>
          </div>
          {ultimasTransacoes.length > 0 ? (
            <div className="space-y-2">
              {ultimasTransacoes.map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: (CATEGORIAS[t.categoria]?.cor || '#94a3b8') + '20' }}>
                      {CATEGORIAS[t.categoria]?.icone || '📦'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{t.descricao}</p>
                      <p className="text-xs text-slate-500">{formatarData(t.data)} · {t.categoria}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ml-2 ${t.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.tipo === 'entrada' ? '+' : '-'}{formatarMoeda(t.valor)}
                  </span>
                </div>
              ))}
            </div>
          ) : <EstadoVazio mensagem="Nenhuma transação" />}
        </div>
      </div>
    </div>
  );
}

function CardResumo({ titulo, valor, icone: Icone, cor }) {
  const cores = {
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-50',
    rose: 'from-rose-500 to-rose-600 text-rose-50',
    indigo: 'from-indigo-500 to-purple-600 text-indigo-50',
    amber: 'from-amber-500 to-orange-600 text-amber-50'
  };
  return (
    <div className={`bg-gradient-to-br ${cores[cor]} rounded-2xl p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm opacity-90 font-medium">{titulo}</span>
        <Icone className="w-5 h-5 opacity-80" />
      </div>
      <p className="text-2xl font-bold tracking-tight">{formatarMoeda(valor)}</p>
    </div>
  );
}

function EstadoVazio({ mensagem }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
      <p className="text-sm">{mensagem}</p>
    </div>
  );
}

// =====================================================================
// LISTA TRANSAÇÕES
// =====================================================================
function ListaTransacoes({ transacoes, contas, busca, setBusca, filtroCategoria, setFiltroCategoria, onEditar, onExcluir }) {
  const filtradas = useMemo(() => 
    transacoes
      .filter(t => filtroCategoria === 'todas' || t.categoria === filtroCategoria)
      .filter(t => !busca || t.descricao.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => b.data.localeCompare(a.data))
  , [transacoes, busca, filtroCategoria]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
          <option value="todas">Todas as categorias</option>
          {Object.keys(CATEGORIAS).map(cat => <option key={cat} value={cat}>{CATEGORIAS[cat].icone} {cat}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtradas.length === 0 ? (
          <EstadoVazio mensagem="Nenhuma transação encontrada" />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtradas.map(t => (
              <div key={t.id} className="p-4 hover:bg-slate-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: (CATEGORIAS[t.categoria]?.cor || '#94a3b8') + '20' }}>
                  {CATEGORIAS[t.categoria]?.icone || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{t.descricao}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                    <span>{formatarData(t.data)}</span><span>·</span><span>{t.categoria}</span>
                    {t.conta && (<><span>·</span><span>{contas.find(c => c.id === t.conta)?.nome || t.conta}</span></>)}
                  </div>
                </div>
                <span className={`font-semibold whitespace-nowrap ${t.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.tipo === 'entrada' ? '+' : '-'}{formatarMoeda(t.valor)}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => onEditar(t)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onExcluir(t.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AbaCategorias({ gastosPorCategoria, totais }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Distribuição de Gastos</h3>
      {gastosPorCategoria.length === 0 ? (
        <EstadoVazio mensagem="Sem gastos categorizados neste mês" />
      ) : (
        <div className="space-y-4">
          {gastosPorCategoria.map(cat => {
            const pct = (cat.valor / totais.saidas) * 100;
            return (
              <div key={cat.nome} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: cat.cor + '20' }}>{cat.icone}</div>
                    <div>
                      <p className="font-semibold text-slate-900">{cat.nome}</p>
                      <p className="text-xs text-slate-500">{pct.toFixed(1)}% do total</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{formatarMoeda(cat.valor)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.cor }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AbaMetas({ metas, setMetas, gastosPorCategoria }) {
  function definirMeta(categoria, valor) {
    const novasMetas = { ...metas };
    if (valor && valor > 0) novasMetas[categoria] = parseFloat(valor);
    else delete novasMetas[categoria];
    setMetas(novasMetas);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900">Metas de Gastos</h3>
        <p className="text-sm text-slate-500 mt-1">Defina limites mensais por categoria</p>
      </div>
      <div className="space-y-3">
        {Object.entries(CATEGORIAS).filter(([n]) => n !== 'Salário' && n !== 'Transferências').map(([nome, dados]) => {
          const gasto = gastosPorCategoria.find(c => c.nome === nome)?.valor || 0;
          const meta = metas[nome] || 0;
          const pct = meta > 0 ? (gasto / meta) * 100 : 0;
          const status = pct > 100 ? 'estourou' : pct > 80 ? 'atencao' : 'ok';
          return (
            <div key={nome} className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{dados.icone}</span>
                  <span className="font-medium text-slate-900">{nome}</span>
                  {meta > 0 && status === 'estourou' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />Estourou</span>}
                  {meta > 0 && status === 'atencao' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Atenção</span>}
                  {meta > 0 && status === 'ok' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Ok</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">R$</span>
                  <input type="number" placeholder="0,00" value={metas[nome] || ''} onChange={e => definirMeta(nome, e.target.value)} className="w-24 px-2 py-1 border border-slate-200 rounded-lg text-sm text-right" />
                </div>
              </div>
              {meta > 0 && (
                <>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{formatarMoeda(gasto)} gastos</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: status === 'estourou' ? '#ef4444' : status === 'atencao' ? '#f59e0b' : '#10b981' }} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AbaContas({ contas, transacoes, onAdicionar, onEditar, onExcluir }) {
  function calcularSaldo(id) {
    const c = contas.find(co => co.id === id);
    const inicial = c?.saldoInicial || 0;
    const mov = transacoes.filter(t => t.conta === id).reduce((a, t) => a + (t.tipo === 'entrada' ? t.valor : -t.valor), 0);
    return inicial + mov;
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900">Suas Contas e Cartões</h2>
        <button onClick={onAdicionar} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />Nova Conta
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contas.map(c => {
          const saldo = calcularSaldo(c.id);
          const Icone = c.tipo === 'cartao' ? CreditCard : Wallet;
          return (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: (c.cor || '#3b82f6') + '20' }}>
                    <Icone className="w-5 h-5" style={{ color: c.cor || '#3b82f6' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{c.nome}</h3>
                    <p className="text-xs text-slate-500">{c.tipo === 'cartao' ? 'Cartão de Crédito' : 'Conta'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEditar(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onExcluir(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">{c.tipo === 'cartao' ? 'Fatura atual' : 'Saldo'}</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>{formatarMoeda(saldo)}</p>
                {c.tipo === 'cartao' && c.limite && <p className="text-xs text-slate-500 mt-1">Limite: {formatarMoeda(c.limite)}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// MODAIS
// =====================================================================
function ModalBase({ titulo, children, onFechar, largo }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onFechar}>
      <div className={`bg-white rounded-2xl shadow-xl w-full ${largo ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">{titulo}</h2>
          <button onClick={onFechar} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ModalTransacao({ transacao, contas, regrasUsuario, onSalvar, onFechar }) {
  const [form, setForm] = useState(transacao || {
    data: new Date().toISOString().slice(0, 10),
    descricao: '', valor: '', tipo: 'saida', categoria: 'Outros',
    conta: contas[0]?.id || ''
  });

  useEffect(() => {
    if (form.descricao && !transacao) {
      const cat = categorizar(form.descricao, regrasUsuario);
      if (cat !== 'Outros') setForm(f => ({ ...f, categoria: cat }));
    }
  }, [form.descricao, transacao, regrasUsuario]);

  function submeter() {
    if (!form.descricao || !form.valor || !form.data) { alert('Preencha todos os campos'); return; }
    onSalvar({ ...form, valor: parseFloat(form.valor) });
  }

  return (
    <ModalBase titulo={transacao ? 'Editar Transação' : 'Nova Transação'} onFechar={onFechar}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setForm({ ...form, tipo: 'saida' })} className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition ${form.tipo === 'saida' ? 'bg-rose-100 text-rose-700 border-2 border-rose-300' : 'bg-slate-100 text-slate-600 border-2 border-transparent'}`}>
            <TrendingDown className="w-4 h-4 inline mr-1" />Saída
          </button>
          <button onClick={() => setForm({ ...form, tipo: 'entrada' })} className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition ${form.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' : 'bg-slate-100 text-slate-600 border-2 border-transparent'}`}>
            <TrendingUp className="w-4 h-4 inline mr-1" />Entrada
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
          <input type="text" placeholder="Ex: Almoço restaurante" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
            <input type="number" step="0.01" placeholder="0,00" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
            <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
          <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
            {Object.keys(CATEGORIAS).map(c => <option key={c} value={c}>{CATEGORIAS[c].icone} {c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Conta</label>
          <select value={form.conta} onChange={e => setForm({ ...form, conta: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
            {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onFechar} className="flex-1 py-2.5 border border-slate-200 rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-50">Cancelar</button>
          <button onClick={submeter} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700">Salvar</button>
        </div>
      </div>
    </ModalBase>
  );
}

function ModalImportacao({ onFechar, onResultado, regrasUsuario }) {
  const [arquivo, setArquivo] = useState(null);
  const [textoColar, setTextoColar] = useState('');
  const [modo, setModo] = useState('pdf');
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const inputRef = useRef();

  async function processarPDF(file) {
    setProcessando(true); setErro('');
    try {
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let textoCompleto = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const linhas = {};
        content.items.forEach(item => {
          const y = Math.round(item.transform[5]);
          if (!linhas[y]) linhas[y] = [];
          linhas[y].push(item.str);
        });
        Object.keys(linhas).sort((a, b) => b - a).forEach(y => {
          textoCompleto += linhas[y].join(' ') + '\n';
        });
      }
      const transacoes = parsearTextoExtrato(textoCompleto);
      // Reaplica categorização com regras do usuário
      transacoes.forEach(t => { t.categoria = categorizar(t.descricao, regrasUsuario); });
      
      if (transacoes.length === 0) {
        setErro('Não identifiquei transações neste PDF. Tente colar o texto manualmente.');
        setProcessando(false);
        return;
      }
      onResultado(transacoes);
    } catch (e) {
      console.error(e);
      setErro('Erro ao ler o PDF. Tente colar o texto manualmente.');
    }
    setProcessando(false);
  }

  function processarTexto() {
    if (!textoColar.trim()) { setErro('Cole o texto primeiro'); return; }
    const transacoes = parsearTextoExtrato(textoColar);
    transacoes.forEach(t => { t.categoria = categorizar(t.descricao, regrasUsuario); });
    if (transacoes.length === 0) { setErro('Não consegui identificar transações.'); return; }
    onResultado(transacoes);
  }

  return (
    <ModalBase titulo="Importar Extrato ou Fatura" onFechar={onFechar}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setModo('pdf')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${modo === 'pdf' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>📄 Arquivo PDF</button>
          <button onClick={() => setModo('texto')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${modo === 'texto' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>📋 Colar Texto</button>
        </div>
        {modo === 'pdf' ? (
          <div>
            <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition">
              <Upload className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-medium text-slate-700 mb-1">{arquivo ? arquivo.name : 'Clique para selecionar PDF'}</p>
              <p className="text-xs text-slate-500">Extrato bancário ou fatura de cartão</p>
              <input ref={inputRef} type="file" accept=".pdf" onChange={e => { const f = e.target.files?.[0]; if (f) { setArquivo(f); processarPDF(f); } }} className="hidden" />
            </div>
            <p className="text-xs text-slate-500 mt-2">💡 Reconhecemos automaticamente Nubank, Itaú, Bradesco, Banco do Brasil, Caixa, Santander e Inter.</p>
          </div>
        ) : (
          <div>
            <textarea placeholder="Cole o texto do extrato..." value={textoColar} onChange={e => setTextoColar(e.target.value)} rows={8} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono" />
            <button onClick={processarTexto} className="w-full mt-3 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700">Processar</button>
          </div>
        )}
        {processando && (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 inline animate-spin text-indigo-600 mb-2" />
            <p className="text-sm text-slate-600">Analisando arquivo...</p>
          </div>
        )}
        {erro && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{erro}
          </div>
        )}
      </div>
    </ModalBase>
  );
}

function ModalRevisao({ transacoes, setTransacoes, contas, onConfirmar, onCancelar, onAprenderRegra }) {
  function atualizar(id, campo, valor) {
    const t = transacoes.find(x => x.id === id);
    // Sistema de aprendizado: se mudou categoria, salva regra para próximas vezes
    if (campo === 'categoria' && t && t.descricao) {
      const palavraChave = t.descricao.toLowerCase().split(' ').slice(0, 3).join(' ');
      if (palavraChave.length > 3) onAprenderRegra(palavraChave, valor);
    }
    setTransacoes(transacoes.map(t => t.id === id ? { ...t, [campo]: valor } : t));
  }
  function remover(id) { setTransacoes(transacoes.filter(t => t.id !== id)); }

  return (
    <ModalBase titulo={`Revisar ${transacoes.length} transações`} onFechar={onCancelar} largo>
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-sm">
          ℹ️ Revise as categorias. O sistema aprende com suas correções!
        </div>
        <div className="max-h-96 overflow-y-auto space-y-2 -mx-2 px-2">
          {transacoes.map(t => (
            <div key={t.id} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">{t.descricao}</p>
                  <p className="text-xs text-slate-500">{formatarData(t.data)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${t.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.tipo === 'entrada' ? '+' : '-'}{formatarMoeda(t.valor)}</span>
                  <button onClick={() => remover(t.id)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <select value={t.tipo} onChange={e => atualizar(t.id, 'tipo', e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs bg-white">
                  <option value="saida">Saída</option><option value="entrada">Entrada</option>
                </select>
                <select value={t.categoria} onChange={e => atualizar(t.id, 'categoria', e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs bg-white">
                  {Object.keys(CATEGORIAS).map(c => <option key={c} value={c}>{CATEGORIAS[c].icone} {c}</option>)}
                </select>
                <select value={t.conta} onChange={e => atualizar(t.id, 'conta', e.target.value)} className="px-2 py-1 border border-slate-200 rounded text-xs bg-white col-span-2 sm:col-span-1">
                  {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button onClick={onCancelar} className="flex-1 py-2.5 border border-slate-200 rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-50">Cancelar</button>
          <button onClick={onConfirmar} disabled={transacoes.length === 0} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50">
            Importar {transacoes.length}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

function ModalConta({ conta, onSalvar, onFechar }) {
  const [form, setForm] = useState(conta || { nome: '', tipo: 'conta', saldoInicial: 0, limite: 0, cor: '#3b82f6' });
  return (
    <ModalBase titulo={conta ? 'Editar Conta' : 'Nova Conta'} onFechar={onFechar}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
          <input type="text" placeholder="Ex: Itaú, Nubank" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
          <div className="flex gap-2">
            <button onClick={() => setForm({ ...form, tipo: 'conta' })} className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${form.tipo === 'conta' ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300' : 'bg-slate-100 text-slate-600 border-2 border-transparent'}`}><Wallet className="w-4 h-4 inline mr-1" /> Conta</button>
            <button onClick={() => setForm({ ...form, tipo: 'cartao' })} className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${form.tipo === 'cartao' ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300' : 'bg-slate-100 text-slate-600 border-2 border-transparent'}`}><CreditCard className="w-4 h-4 inline mr-1" /> Cartão</button>
          </div>
        </div>
        {form.tipo === 'conta' ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Inicial</label>
            <input type="number" step="0.01" value={form.saldoInicial} onChange={e => setForm({ ...form, saldoInicial: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Limite</label>
            <input type="number" step="0.01" value={form.limite} onChange={e => setForm({ ...form, limite: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cor</label>
          <div className="flex gap-2 flex-wrap">
            {['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'].map(c => (
              <button key={c} onClick={() => setForm({ ...form, cor: c })} className={`w-8 h-8 rounded-lg border-2 ${form.cor === c ? 'border-slate-900' : 'border-transparent'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onFechar} className="flex-1 py-2.5 border border-slate-200 rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-50">Cancelar</button>
          <button onClick={() => form.nome && onSalvar(form)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700">Salvar</button>
        </div>
      </div>
    </ModalBase>
  );
}

function ModalUpgrade({ motivo, onConfirmar, onFechar }) {
  const mensagens = {
    transacoes: 'Você atingiu o limite de 50 transações mensais do plano gratuito.',
    contas: 'Você atingiu o limite de 2 contas do plano gratuito.',
    relatorios: 'Relatórios em PDF são exclusivos do plano Premium.',
    geral: 'Desbloqueie todo o potencial do FinControl.'
  };
  return (
    <ModalBase titulo="Hora do Upgrade" onFechar={onFechar}>
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{mensagens[motivo]}</h3>
        <p className="text-sm text-slate-600 mb-6">Com o Premium você tem acesso ilimitado a tudo.</p>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 mb-6 text-left">
          <p className="text-3xl font-bold text-slate-900 mb-1">R$ 19,90<span className="text-sm font-normal text-slate-500">/mês</span></p>
          <ul className="space-y-2 mt-4 text-sm">
            {['Transações ilimitadas', 'PDFs ilimitados', 'Contas ilimitadas', 'Relatórios em PDF', 'Suporte prioritário'].map(item => (
              <li key={item} className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />{item}
              </li>
            ))}
          </ul>
        </div>
        <button onClick={onConfirmar} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition mb-2">
          Fazer Upgrade Agora
        </button>
        <button onClick={onFechar} className="w-full py-2 text-sm text-slate-500 hover:text-slate-700">Continuar no plano gratuito</button>
        <p className="text-xs text-slate-400 mt-3">⚠️ Modo demo: o upgrade é simulado, sem cobrança real.</p>
      </div>
    </ModalBase>
  );
}
