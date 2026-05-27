import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Upload, Plus, TrendingUp, TrendingDown, Wallet, CreditCard, Target,
  FileText, Download, Trash2, Edit2, AlertCircle, CheckCircle2, DollarSign,
  PieChart as PieChartIcon, BarChart3, Settings, X, Search, LogOut, Crown,
  Sparkles, Mail, Lock, User, Eye, EyeOff, Loader2, Calendar, ArrowRight,
  Shield, Zap, Building2, FileBarChart, Bell, ChevronRight, ChevronDown, Moon, Sun
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { supabase } from './supabase'
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
// =====================================================================
// DETECÇÃO DE BANCO
// =====================================================================
function detectarBanco(texto) {
  const t = texto.toLowerCase();
  
  // Bancos com parsers específicos
  if (t.includes('banco xp') || t.includes('conta digital xp') || t.includes('xpi.com.br')) return 'xp';
  if (t.includes('sicredi') || t.includes('cooperativa')) return 'sicredi';
  if (t.includes('bradesco celular') || (t.includes('bradesco') && t.includes('extrato de:'))) return 'bradesco_extrato';
  
  // Outros bancos (fallback usa parser genérico)
  if (t.includes('nu pagamentos') || t.includes('nubank')) return 'nubank';
  if (t.includes('itaú') || t.includes('itau unibanco')) return 'itau';
  if (t.includes('bradesco')) return 'bradesco';
  if (t.includes('banco do brasil')) return 'bb';
  if (t.includes('caixa econômica') || t.includes('caixa economica')) return 'caixa';
  if (t.includes('santander')) return 'santander';
  if (t.includes('banco inter')) return 'inter';
  
  return 'generico';
}

// =====================================================================
// PARSER PRINCIPAL - roteia para parser específico do banco
// =====================================================================
function parsearTextoExtrato(texto) {
  const banco = detectarBanco(texto);
  
  // Parsers específicos validados
  if (banco === 'xp') return parsearXP(texto);
  if (banco === 'sicredi') return parsearSicredi(texto);
  if (banco === 'bradesco_extrato') return parsearBradesco(texto);
  
  // Fallback genérico (para bancos não validados)
  return parsearGenerico(texto, banco);
}

// =====================================================================
// PARSER ESPECÍFICO: XP (Banco XP S.A)
// Formato: DATA hh:mm:ss | DESCRIÇÃO | VALOR (com sinal) | SALDO
// =====================================================================
function parsearXP(texto) {
  const transacoes = [];
  // Regex que captura: data com hora + descrição + valor + saldo
  // Ex: "26/05/26 às 05:24:55 Rendimento automático R$ 0,07 R$ 7.487,40"
  const regexLinha = /(\d{2}\/\d{2}\/\d{2,4})\s+às\s+\d{2}:\d{2}:\d{2}\s+(.+?)\s+(-?R\$\s?[\d.]+,\d{2})\s+R\$\s?[\d.]+,\d{2}/g;
  
  let match;
  while ((match = regexLinha.exec(texto)) !== null) {
    const [, dataStr, descricao, valorStr] = match;
    
    const ehNegativo = valorStr.includes('-');
    const valorLimpo = valorStr.replace(/[R$\s\-]/g, '').replace(/\./g, '').replace(',', '.');
    const valor = parseFloat(valorLimpo);
    
    if (!isNaN(valor) && valor > 0) {
      transacoes.push({
        id: crypto.randomUUID(),
        data: normalizarData(dataStr),
        descricao: descricao.trim().slice(0, 100),
        valor: valor,
        tipo: ehNegativo ? 'saida' : 'entrada',
        categoria: categorizar(descricao),
        conta: 'importado',
        banco_origem: 'xp',
        importado: true
      });
    }
  }
  
  return transacoes;
}

// =====================================================================
// PARSER ESPECÍFICO: SICREDI
// Formato: DATA | DESCRIÇÃO | DOCUMENTO | VALOR(com sinal) | SALDO
// =====================================================================
function parsearSicredi(texto) {
  const transacoes = [];
  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 10);
  
  for (const linha of linhas) {
    // Ignora linha de saldo anterior, cabeçalhos, etc.
    if (/saldo anterior|saldo atual|cooperativa|associado|extrato/i.test(linha)) continue;
    
    // Regex Sicredi: data + descrição + (documento opcional) + valor + saldo
    // O VALOR é o penúltimo número monetário e o SALDO é o último
    const matchData = linha.match(/^(\d{2}\/\d{2}\/\d{4})/);
    if (!matchData) continue;
    
    // Captura TODOS os números monetários da linha (com vírgula decimal)
    const valoresEncontrados = [...linha.matchAll(/(-?[\d.]+,\d{2})/g)];
    if (valoresEncontrados.length < 2) continue;
    
    // Penúltimo = valor da transação, último = saldo
    const valorTransacaoStr = valoresEncontrados[valoresEncontrados.length - 2][0];
    
    const ehNegativo = valorTransacaoStr.startsWith('-');
    const valorLimpo = valorTransacaoStr.replace(/-/g, '').replace(/\./g, '').replace(',', '.');
    const valor = parseFloat(valorLimpo);
    
    if (isNaN(valor) || valor === 0) continue;
    
    // Extrai descrição: tudo entre a data e o primeiro valor monetário
    const inicioValor = linha.indexOf(valorTransacaoStr);
    let descricao = linha.slice(matchData[0].length, inicioValor).trim();
    
    // Remove o tipo de documento do final (PIX_DEB, PIX_CRED, CX910810, MAPFREV, etc.)
    descricao = descricao.replace(/\s+(PIX_DEB|PIX_CRED|CX\d+|CONSORCIO|SEM PARAR|MAPFREV)\s*$/i, '').trim();
    
    // Remove CPFs/CNPJs do meio (números longos isolados)
    descricao = descricao.replace(/\b\d{11,14}\b/g, '').replace(/\s+/g, ' ').trim();
    
    if (descricao.length < 3) continue;
    
    transacoes.push({
      id: crypto.randomUUID(),
      data: normalizarData(matchData[0]),
      descricao: descricao.slice(0, 100),
      valor: valor,
      tipo: ehNegativo ? 'saida' : 'entrada',
      categoria: categorizar(descricao),
      conta: 'importado',
      banco_origem: 'sicredi',
      importado: true
    });
  }
  
  return transacoes;
}

// =====================================================================
// PARSER ESPECÍFICO: BRADESCO (Bradesco Celular)
// Formato: DATA | HISTÓRICO | DOCTO | CRÉDITO | DÉBITO | SALDO
// IMPORTANTE: as colunas Crédito e Débito são SEPARADAS no PDF do Bradesco
// =====================================================================
function parsearBradesco(texto) {
  const transacoes = [];
  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  
  let ultimaData = null;
  
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    
    // Ignora cabeçalhos e linhas de totais
    if (/^(data|histórico|extrato|nome|agência|conta|folha|total|cod\. lanc|extrato inexistente|bradesco)/i.test(linha)) continue;
    
    // Detecta data no início da linha (DD/MM/AAAA)
    const matchData = linha.match(/^(\d{2}\/\d{2}\/\d{4})/);
    if (matchData) {
      ultimaData = normalizarData(matchData[0]);
    }
    
    // Procura valores monetários na linha
    const valores = [...linha.matchAll(/(-?[\d.]+,\d{2})/g)];
    if (valores.length === 0 || !ultimaData) continue;
    
    // No Bradesco: última coluna é SALDO, penúltima é VALOR (débito ou crédito)
    // Se tem só 1 valor: pode ser só saldo (linha sem movimento) ou só valor
    // Se tem 2+ valores: penúltimo = valor da transação, último = saldo
    let valorStr, saldoStr;
    if (valores.length >= 2) {
      valorStr = valores[valores.length - 2][0];
      saldoStr = valores[valores.length - 1][0];
    } else {
      continue; // linha sem valor de transação
    }
    
    const valorLimpo = valorStr.replace(/\./g, '').replace(',', '.');
    const valor = parseFloat(valorLimpo);
    if (isNaN(valor) || valor === 0) continue;
    
    // Para determinar entrada/saída no Bradesco, analisamos o histórico
    const linhaLower = linha.toLowerCase();
    const indicadoresEntrada = ['transferencia pix', 'pix recebido', 'recebimento', 'credito em conta', 'rendimento', 'estorno', 'deposito'];
    const indicadoresSaida = ['parcela credito', 'prestacao', 'pix qr code', 'debito automatico', 'iof', 'encargos', 'gastos cartao', 'emprestimo pessoal', 'tarifa', 'cesta', 'liquidacao boleto', 'pagamento'];
    
    let tipo = null;
    // PIX no Bradesco é ambíguo - "TRANSFERENCIA PIX REM" significa que o REMETENTE foi o usuário (saída)
    // Vamos olhar contexto: se diz "EMPRESTIMO PESSOAL" e tem valor entrando, é entrada
    if (linhaLower.includes('emprestimo pessoal')) {
      tipo = 'entrada'; // empréstimo é dinheiro entrando
    } else if (linhaLower.includes('transferencia pix') && linhaLower.includes('rem:')) {
      // "REM:" indica remetente - se o nome do remetente é o próprio usuário, é entre contas dele (transferência)
      tipo = 'entrada'; // está vindo pra esta conta
    } else if (indicadoresSaida.some(p => linhaLower.includes(p))) {
      tipo = 'saida';
    } else if (indicadoresEntrada.some(p => linhaLower.includes(p))) {
      tipo = 'entrada';
    } else {
      tipo = 'saida'; // default: assume saída se incerto
    }
    
    // Extrai descrição: parte textual da linha (sem data, sem números monetários, sem documento)
    let descricao = linha;
    if (matchData) descricao = descricao.replace(matchData[0], '');
    descricao = descricao.replace(valorStr, '').replace(saldoStr, '');
    descricao = descricao.replace(/\b\d{7,}\b/g, ''); // remove documentos longos
    descricao = descricao.replace(/REM:\s*/i, '').replace(/CONTR\s+\d+\s+PARC\s+[\d/]+/i, '');
    descricao = descricao.replace(/ENCARGO\s+-\s+[\d,]+%/i, 'ENCARGOS');
    descricao = descricao.replace(/\s+/g, ' ').trim();
    
    if (descricao.length < 3) continue;
    
    transacoes.push({
      id: crypto.randomUUID(),
      data: ultimaData,
      descricao: descricao.slice(0, 100),
      valor: valor,
      tipo: tipo,
      categoria: categorizar(descricao),
      conta: 'importado',
      banco_origem: 'bradesco',
      importado: true
    });
  }
  
  return transacoes;
}

// =====================================================================
// PARSER GENÉRICO (para bancos não validados oficialmente)
// =====================================================================
function parsearGenerico(texto, banco) {
  const transacoes = [];
  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  
  const regexData = /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/;
  const regexValor = /(-?\s?R?\$?\s?-?\s?[\d.]+,\d{2})/g;
  const palavrasDebito = ['debito', 'débito', 'pagamento', 'compra', 'saque', 'tarifa', 'pix enviado'];
  const palavrasCredito = ['credito em conta', 'crédito em conta', 'recebido', 'salario', 'salário', 'estorno', 'rendimento', 'tef recebido'];
  
  for (const linha of linhas) {
    const matchData = linha.match(regexData);
    const matchesValor = [...linha.matchAll(regexValor)];
    
    if (matchData && matchesValor.length > 0) {
      // Se há 2+ valores, o penúltimo geralmente é o valor da transação (último é saldo)
      const valorStr = matchesValor.length >= 2 
        ? matchesValor[matchesValor.length - 2][0]
        : matchesValor[matchesValor.length - 1][0];
      
      const ehNegativoNoTexto = valorStr.includes('-');
      const valorLimpo = valorStr.replace(/R\$|\s|-/g, '').replace(/\./g, '').replace(',', '.');
      const valor = parseFloat(valorLimpo);
      
      if (!isNaN(valor) && Math.abs(valor) > 0.009) {
        let descricao = linha.replace(matchData[0], '');
        matchesValor.forEach(m => { descricao = descricao.replace(m[0], ''); });
        descricao = descricao.replace(/\b\d{10,}\b/g, '').replace(/\*+/g, ' ').replace(/\s+/g, ' ').trim();
        
        if (descricao.length > 2) {
          const linhaLower = linha.toLowerCase();
          let tipo;
          if (ehNegativoNoTexto) tipo = 'saida';
          else if (palavrasCredito.some(p => linhaLower.includes(p))) tipo = 'entrada';
          else if (palavrasDebito.some(p => linhaLower.includes(p))) tipo = 'saida';
          else tipo = 'saida';
          
          transacoes.push({
            id: crypto.randomUUID(),
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

// =====================================================================
// CÁLCULO DE COMPETÊNCIA
// Dada uma data de compra e o dia de fechamento do cartão,
// retorna o mês de competência (YYYY-MM) - quando a compra entra na fatura
// =====================================================================
function calcularCompetencia(dataCompra, diaFechamento) {
  if (!diaFechamento) return dataCompra.slice(0, 7); // sem fechamento configurado, usa o próprio mês
  
  const [ano, mes, dia] = dataCompra.split('-').map(Number);
  const diaCompra = dia;
  
  // Se a compra foi feita APÓS o fechamento, vai pra fatura do próximo mês
  // Se foi feita ATÉ o fechamento, vai pra fatura do mês atual
  let mesCompetencia = mes;
  let anoCompetencia = ano;
  
  if (diaCompra > diaFechamento) {
    // Após o fechamento → próxima fatura
    mesCompetencia = mes + 1;
    if (mesCompetencia > 12) {
      mesCompetencia = 1;
      anoCompetencia = ano + 1;
    }
  }
  // Se diaCompra <= diaFechamento, compra entra na fatura atual (que vence no mês seguinte)
  // Mas a "competência" pra controle é o mês em que a fatura SERÁ PAGA
  mesCompetencia = mesCompetencia + 1; // a fatura sempre é paga no mês seguinte ao fechamento
  if (mesCompetencia > 12) {
    mesCompetencia = 1;
    anoCompetencia = anoCompetencia + 1;
  }
  
  return `${anoCompetencia}-${String(mesCompetencia).padStart(2, '0')}`;
}
// =====================================================================
// DETECTOR DE DATAS DE FATURA
// Lê o texto de uma fatura de cartão e tenta identificar
// o dia de fechamento e dia de vencimento
// =====================================================================
function detectarDatasFatura(texto) {
  const t = texto.toLowerCase();
  let diaVencimento = null;
  let diaFechamento = null;
  
  // Tenta detectar VENCIMENTO (padrões mais comuns)
  // Procura "vencimento" seguido de uma data DD/MM ou DD/MM/AAAA
  const padroesVencimento = [
    /vencimento[\s\S]{0,30}?(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?/i,
    /vence(?:r)?\s*em[\s\S]{0,30}?(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?/i,
    /data\s+de\s+vencimento[\s\S]{0,30}?(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?/i,
    /pagamento[\s\S]{0,30}?(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?/i,
  ];
  
  for (const padrao of padroesVencimento) {
    const match = texto.match(padrao);
    if (match) {
      const dia = parseInt(match[1]);
      if (dia >= 1 && dia <= 31) {
        diaVencimento = dia;
        break;
      }
    }
  }
  
  // Tenta detectar FECHAMENTO
  const padroesFechamento = [
    /fechamento[\s\S]{0,30}?(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?/i,
    /fecha(?:mento)?\s+em[\s\S]{0,30}?(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?/i,
    /data\s+de\s+fechamento[\s\S]{0,30}?(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?/i,
  ];
  
  for (const padrao of padroesFechamento) {
    const match = texto.match(padrao);
    if (match) {
      const dia = parseInt(match[1]);
      if (dia >= 1 && dia <= 31) {
        diaFechamento = dia;
        break;
      }
    }
  }
  
  // Se achou vencimento mas não fechamento, deduz (10 dias antes - padrão mais comum)
  if (diaVencimento && !diaFechamento) {
    diaFechamento = diaVencimento - 10;
    if (diaFechamento < 1) diaFechamento += 30; // ajuste se virar negativo
  }
  
  return { diaFechamento, diaVencimento };
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
// CAMADA DE DADOS - Supabase
// =====================================================================
const dataLayer = {
  async carregar(usuarioId) {
    const [transacoesRes, contasRes, metasRes, regrasRes] = await Promise.all([
      supabase.from('transacoes').select('*').eq('user_id', usuarioId).order('data', { ascending: false }),
      supabase.from('contas').select('*').eq('user_id', usuarioId),
      supabase.from('metas').select('*').eq('user_id', usuarioId),
      supabase.from('regras_categorizacao').select('*').eq('user_id', usuarioId)
    ]);
    
    let contas = contasRes.data || [];
    if (contas.length === 0) {
      const contasPadrao = [
        { user_id: usuarioId, nome: 'Conta Corrente', tipo: 'conta', saldo_inicial: 0, cor: '#3b82f6' },
        { user_id: usuarioId, nome: 'Cartão de Crédito', tipo: 'cartao', limite: 5000, cor: '#ef4444' }
      ];
      const { data } = await supabase.from('contas').insert(contasPadrao).select();
      contas = data || [];
    }
    
    const transacoes = (transacoesRes.data || []).map(t => ({
      id: t.id,
      data: t.data,
      descricao: t.descricao,
      valor: parseFloat(t.valor),
      tipo: t.tipo,
      categoria: t.categoria,
      conta: t.conta_id,
      competencia: t.competencia || t.data.slice(0, 7)
    }));
    
    const contasAdaptadas = contas.map(c => ({
      id: c.id,
      nome: c.nome,
      tipo: c.tipo,
      saldoInicial: parseFloat(c.saldo_inicial || 0),
      limite: parseFloat(c.limite || 0),
      cor: c.cor,
      dia_fechamento: c.dia_fechamento,
      dia_vencimento: c.dia_vencimento
    }));
    
    const metas = {};
    (metasRes.data || []).forEach(m => {
      metas[m.categoria] = parseFloat(m.valor);
    });
    
    const regras = {};
    (regrasRes.data || []).forEach(r => {
      regras[r.palavra] = r.categoria;
    });
    
    return { transacoes, contas: contasAdaptadas, metas, regras };
  },
  
  async salvar(usuarioId, tipo, dados) {
    try {
      if (tipo === 'transacoes') {
        await supabase.from('transacoes').delete().eq('user_id', usuarioId);
        if (dados.length > 0) {
          const paraInserir = dados.map(t => ({
            id: t.id,
            user_id: usuarioId,
            data: t.data,
            descricao: t.descricao,
            valor: t.valor,
            tipo: t.tipo,
            categoria: t.categoria,
            conta_id: t.conta && t.conta !== 'importado' ? t.conta : null,
            competencia: t.competencia || t.data.slice(0, 7)
          }));
          await supabase.from('transacoes').insert(paraInserir);
        }
      } else if (tipo === 'contas') {
        await supabase.from('contas').delete().eq('user_id', usuarioId);
        if (dados.length > 0) {
          const paraInserir = dados.map(c => ({
            id: c.id,
            user_id: usuarioId,
            nome: c.nome,
            tipo: c.tipo,
            saldo_inicial: c.saldoInicial || 0,
            limite: c.limite || 0,
            cor: c.cor,
            dia_fechamento: c.dia_fechamento || null,
            dia_vencimento: c.dia_vencimento || null
          }));
          await supabase.from('contas').insert(paraInserir);
        }
      } else if (tipo === 'metas') {
        await supabase.from('metas').delete().eq('user_id', usuarioId);
        const entradas = Object.entries(dados);
        if (entradas.length > 0) {
          const paraInserir = entradas.map(([categoria, valor]) => ({
            user_id: usuarioId,
            categoria,
            valor
          }));
          await supabase.from('metas').insert(paraInserir);
        }
      } else if (tipo === 'regras') {
        await supabase.from('regras_categorizacao').delete().eq('user_id', usuarioId);
        const entradas = Object.entries(dados);
        if (entradas.length > 0) {
          const paraInserir = entradas.map(([palavra, categoria]) => ({
            user_id: usuarioId,
            palavra,
            categoria
          }));
          await supabase.from('regras_categorizacao').insert(paraInserir);
        }
      }
    } catch (e) {
      console.error('Erro ao salvar:', e);
    }
  }
};
// =====================================================================
// CAMADA DE AUTENTICAÇÃO - Supabase
// =====================================================================
const authLayer = {
  async cadastrar(email, senha, nome) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome }
      }
    });
    
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered') || error.message.includes('User already registered')) {
        throw new Error('Este e-mail já está cadastrado. Faça login.');
      }
      throw new Error(error.message);
    }
    
    return {
      id: data.user.id,
      email: data.user.email,
      nome,
      plano: 'free'
    };
  },
  
  async login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('E-mail ou senha incorretos');
      }
      throw new Error(error.message);
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    return {
      id: data.user.id,
      email: data.user.email,
      nome: profile?.nome || data.user.email,
      plano: profile?.plano || 'free'
    };
  },
  
  async sessao() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    return {
      id: session.user.id,
      email: session.user.email,
      nome: profile?.nome || session.user.email,
      plano: profile?.plano || 'free'
    };
  },
  
  async sair() {
    await supabase.auth.signOut();
  },
  
  async atualizarPlano(email, plano) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('profiles')
      .update({ plano })
      .eq('id', user.id);
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
    dados.transacoes.filter(t => {
      // Usa competência se existir (caso típico de cartão), senão usa a data
      const mesReferencia = t.competencia || (t.data ? t.data.slice(0, 7) : '');
      return mesReferencia === filtroMes;
    })
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
    
    // Calcula competência baseada na conta selecionada
    const contaSelecionada = dados.contas.find(c => c.id === t.conta);
    let competencia;
    if (contaSelecionada?.tipo === 'cartao' && contaSelecionada.dia_fechamento) {
      competencia = calcularCompetencia(t.data, contaSelecionada.dia_fechamento);
    } else {
      competencia = t.data.slice(0, 7);
    }
    const transacaoComCompetencia = { ...t, competencia };
    
    let novas;
    if (t.id && dados.transacoes.find(tr => tr.id === t.id)) {
      novas = dados.transacoes.map(tr => tr.id === t.id ? transacaoComCompetencia : tr);
    } else {
      novas = [...dados.transacoes, { ...transacaoComCompetencia, id: crypto.randomUUID() }];
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
  async function excluirVariasTransacoes(ids) {
    const novasTransacoes = dados.transacoes.filter(t => !ids.includes(t.id));
    salvar({ transacoes: novasTransacoes });
    
    // Deleta no Supabase (uma chamada batch)
    try {
      await supabase.from('transacoes').delete().in('id', ids).eq('user_id', usuario.id);
    } catch (e) {
      console.error('Erro ao excluir em massa:', e);
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
      : [...dados.contas, { ...c, id: crypto.randomUUID() }];
    salvar({ contas: novas });
    setModalConta(false);
    setEditandoConta(null);
  }
  // Atualiza apenas as datas de fechamento/vencimento de um cartão
  // Usado quando detectamos automaticamente na importação de fatura
  function atualizarContaDatas(contaId, datas) {
    const novas = dados.contas.map(c => {
      if (c.id !== contaId) return c;
      return {
        ...c,
        dia_fechamento: datas.diaFechamento || c.dia_fechamento,
        dia_vencimento: datas.diaVencimento || c.dia_vencimento
      };
    });
    salvar({ contas: novas });
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
            <AvatarDropdown 
  usuario={usuario} 
  onSair={onSair}
  onAbrirConfig={() => setAbaAtiva('conta')}
/>
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
            onExcluirVarias={excluirVariasTransacoes}
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
        {abaAtiva === 'conta' && (
          <AbaMinhaConta
            usuario={usuario}
            dados={dados}
            onAtualizarUsuario={onAtualizarUsuario}
            onSair={onSair}
            salvar={salvar}
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
          contas={dados.contas}
          onAtualizarContaDatas={atualizarContaDatas}
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
// MINHA CONTA - Tela completa de configurações do usuário
// =====================================================================
function AbaMinhaConta({ usuario, dados, onAtualizarUsuario, onSair, salvar }) {
  const [secao, setSecao] = useState('perfil');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  
  // Estados dos formulários
  const [nome, setNome] = useState(usuario.nome || '');
  const [novoEmail, setNovoEmail] = useState(usuario.email || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tema, setTema] = useState('claro');
  const [modalExcluir, setModalExcluir] = useState(false);

  // Helper para mostrar mensagens temporárias
  function mostrarMensagem(texto, tipo = 'sucesso') {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 4000);
  }

  // Salvar nome
  async function salvarNome() {
    if (!nome.trim()) {
      mostrarMensagem('Nome não pode ficar vazio', 'erro');
      return;
    }
    setSalvando(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nome: nome.trim() })
        .eq('id', usuario.id);
      
      if (error) throw error;
      
      onAtualizarUsuario({ ...usuario, nome: nome.trim() });
      mostrarMensagem('Nome atualizado com sucesso! ✅');
    } catch (e) {
      mostrarMensagem('Erro ao atualizar nome: ' + e.message, 'erro');
    }
    setSalvando(false);
  }

  // Alterar e-mail
  async function alterarEmail() {
    if (!novoEmail.trim() || !novoEmail.includes('@')) {
      mostrarMensagem('E-mail inválido', 'erro');
      return;
    }
    if (novoEmail.toLowerCase().trim() === usuario.email.toLowerCase()) {
      mostrarMensagem('Este já é o seu e-mail atual', 'erro');
      return;
    }
    setSalvando(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: novoEmail.toLowerCase().trim()
      });
      
      if (error) throw error;
      
      mostrarMensagem('📧 Verifique seu novo e-mail para confirmar a alteração');
    } catch (e) {
      mostrarMensagem('Erro: ' + e.message, 'erro');
    }
    setSalvando(false);
  }

  // Alterar senha
  async function alterarSenha() {
    if (novaSenha.length < 6) {
      mostrarMensagem('Nova senha deve ter no mínimo 6 caracteres', 'erro');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      mostrarMensagem('Confirmação de senha não confere', 'erro');
      return;
    }
    setSalvando(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      });
      
      if (error) throw error;
      
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      mostrarMensagem('Senha alterada com sucesso! ✅');
    } catch (e) {
      mostrarMensagem('Erro ao alterar senha: ' + e.message, 'erro');
    }
    setSalvando(false);
  }

  // Salvar tema
  async function salvarTema(novoTema) {
    setTema(novoTema);
    try {
      await supabase
        .from('profiles')
        .update({ tema: novoTema })
        .eq('id', usuario.id);
      mostrarMensagem(`Tema alterado para ${novoTema} 🎨`);
    } catch (e) {
      mostrarMensagem('Erro ao salvar tema', 'erro');
    }
  }

  // Exportar todos os dados (LGPD)
  function exportarDados() {
    const exportacao = {
      data_exportacao: new Date().toISOString(),
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
        plano: usuario.plano
      },
      transacoes: dados.transacoes,
      contas: dados.contas,
      metas: dados.metas,
      regras_categorizacao: dados.regras
    };
    
    const json = JSON.stringify(exportacao, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fincontrol_dados_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarMensagem('Dados exportados com sucesso! 📥');
  }

  // Excluir conta (apaga TUDO)
async function excluirConta() {
    setSalvando(true);
    try {
      // Apaga dados das tabelas (RLS já garante que só apaga os do usuário)
      await supabase.from('transacoes').delete().eq('user_id', usuario.id);
      await supabase.from('contas').delete().eq('user_id', usuario.id);
      await supabase.from('metas').delete().eq('user_id', usuario.id);
      await supabase.from('regras_categorizacao').delete().eq('user_id', usuario.id);
      await supabase.from('profiles').delete().eq('id', usuario.id);
      
      // Apaga a conta de autenticação (auth.users) via função do banco
      const { error: errorDelete } = await supabase.rpc('deletar_minha_conta');
      if (errorDelete) {
        console.error('Erro ao deletar auth:', errorDelete);
        // Continua mesmo com erro - os dados já foram apagados
      }
      
      // Faz logout
      await supabase.auth.signOut();
      
      alert('Sua conta foi excluída com sucesso. Sentiremos sua falta!');
      onSair();
    } catch (e) {
      mostrarMensagem('Erro ao excluir conta: ' + e.message, 'erro');
      setSalvando(false);
    }
  }

  const secoes = [
    { id: 'perfil', label: 'Perfil', icone: User },
    { id: 'seguranca', label: 'Segurança', icone: Lock },
    { id: 'preferencias', label: 'Preferências', icone: Settings },
    { id: 'plano', label: 'Plano e Assinatura', icone: Crown },
    { id: 'dados', label: 'Meus Dados', icone: Shield },
    { id: 'perigo', label: 'Zona de Perigo', icone: AlertCircle }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Minha Conta</h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie suas informações e preferências</p>
      </div>

      {/* Mensagem de feedback */}
      {mensagem && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
          mensagem.tipo === 'erro' 
            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {mensagem.tipo === 'erro' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {mensagem.texto}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Menu lateral */}
        <nav className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-2">
            {secoes.map(s => {
              const Icone = s.icone;
              const ativo = secao === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSecao(s.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                    ativo 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  } ${s.id === 'perigo' && !ativo ? 'text-rose-600 hover:bg-rose-50' : ''}`}
                >
                  <Icone className="w-4 h-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Conteúdo */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            
            {/* SEÇÃO: PERFIL */}
            {secao === 'perfil' && (
              <div className="space-y-5">
                <h2 className="font-semibold text-slate-900">Informações pessoais</h2>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">NOME</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                    <button
                      onClick={salvarNome}
                      disabled={salvando || nome === usuario.nome}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">E-MAIL</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={novoEmail}
                      onChange={e => setNovoEmail(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                    <button
                      onClick={alterarEmail}
                      disabled={salvando || novoEmail === usuario.email}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Alterar'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">Você precisará confirmar o novo e-mail antes da alteração ter efeito.</p>
                </div>
              </div>
            )}

            {/* SEÇÃO: SEGURANÇA */}
            {secao === 'seguranca' && (
              <div className="space-y-5">
                <h2 className="font-semibold text-slate-900">Alterar senha</h2>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">NOVA SENHA</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">CONFIRMAR NOVA SENHA</label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    placeholder="Digite a senha de novo"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>

                <button
                  onClick={alterarSenha}
                  disabled={salvando || !novaSenha || !confirmarSenha}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Alterar senha'}
                </button>
              </div>
            )}

            {/* SEÇÃO: PREFERÊNCIAS */}
            {secao === 'preferencias' && (
              <div className="space-y-5">
                <h2 className="font-semibold text-slate-900">Aparência</h2>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">TEMA</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => salvarTema('claro')}
                      className={`p-4 border-2 rounded-xl transition ${
                        tema === 'claro' 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Sun className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                      <p className="text-sm font-medium text-slate-900">Claro</p>
                    </button>
                    <button
                      onClick={() => salvarTema('escuro')}
                      className={`p-4 border-2 rounded-xl transition ${
                        tema === 'escuro' 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Moon className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                      <p className="text-sm font-medium text-slate-900">Escuro</p>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">⚠️ Tema escuro virá em uma próxima atualização. Sua preferência fica salva.</p>
                </div>
              </div>
            )}

            {/* SEÇÃO: PLANO */}
            {secao === 'plano' && (
              <div className="space-y-5">
                <h2 className="font-semibold text-slate-900">Seu plano atual</h2>
                
                {usuario.plano === 'premium' ? (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-amber-600" />
                      <h3 className="font-bold text-amber-900">Plano Premium</h3>
                    </div>
                    <p className="text-sm text-amber-800 mb-4">Você tem acesso a todas as funcionalidades sem limites.</p>
                    <ul className="space-y-1.5 text-sm text-amber-900">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Transações ilimitadas</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Importações ilimitadas de PDF</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Contas e cartões ilimitados</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Relatórios em PDF</li>
                    </ul>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                      <h3 className="font-bold text-slate-900">Plano Gratuito</h3>
                      <p className="text-sm text-slate-600 mt-1">Bom pra começar, com algumas limitações.</p>
                      <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                        <li>• 50 transações por mês</li>
                        <li>• 1 importação de PDF</li>
                        <li>• 2 contas/cartões</li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="w-5 h-5 text-amber-300" />
                        <h3 className="font-bold">Upgrade para Premium</h3>
                      </div>
                      <p className="text-3xl font-bold mt-2">R$ 19,90<span className="text-sm font-normal opacity-80">/mês</span></p>
                      <p className="text-sm opacity-90 mt-1 mb-4">Tudo ilimitado, sem complicação.</p>
                      <button
                        disabled
                        className="w-full py-2.5 bg-white/20 text-white rounded-lg text-sm font-semibold cursor-not-allowed"
                      >
                        Em breve (pagamento em desenvolvimento)
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SEÇÃO: DADOS */}
            {secao === 'dados' && (
              <div className="space-y-5">
                <h2 className="font-semibold text-slate-900">Seus dados</h2>
                <p className="text-sm text-slate-600">
                  Você tem direito de baixar uma cópia de todos os seus dados a qualquer momento (LGPD).
                </p>
                
                <div className="border border-slate-200 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Download className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Exportar todos os dados</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Baixa um arquivo JSON com todas suas transações, contas, metas e configurações.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={exportarDados}
                    className="w-full py-2.5 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100"
                  >
                    Baixar meus dados (JSON)
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600">
                  <p className="flex items-start gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Seus dados são criptografados e armazenados em servidores seguros. 
                      Não compartilhamos com terceiros. Apenas você tem acesso.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* SEÇÃO: ZONA DE PERIGO */}
            {secao === 'perigo' && (
              <div className="space-y-5">
                <h2 className="font-semibold text-rose-700">Zona de Perigo</h2>
                <p className="text-sm text-slate-600">
                  Ações irreversíveis. Pense bem antes de prosseguir.
                </p>
                
                <div className="border-2 border-rose-200 bg-rose-50 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Trash2 className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-rose-900">Excluir minha conta</h3>
                      <p className="text-sm text-rose-700 mt-1">
                        Apaga permanentemente sua conta, todas as suas transações, contas, metas e configurações. 
                        Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalExcluir(true)}
                    className="w-full py-2.5 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700"
                  >
                    Excluir minha conta permanentemente
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {modalExcluir && (
        <ModalBase titulo="⚠️ Tem certeza absoluta?" onFechar={() => setModalExcluir(false)}>
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm text-rose-800">
              <p className="font-semibold mb-2">Esta ação é IRREVERSÍVEL.</p>
              <p>Você vai perder:</p>
              <ul className="mt-2 ml-4 space-y-1">
                <li>• Todas as suas {dados.transacoes.length} transações</li>
                <li>• Todas as suas {dados.contas.length} contas</li>
                <li>• Todas as suas metas e configurações</li>
                <li>• Acesso à sua conta para sempre</li>
              </ul>
            </div>
            <p className="text-sm text-slate-700">
              Recomendamos <strong>exportar seus dados antes</strong> em "Meus Dados".
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalExcluir(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={excluirConta}
                disabled={salvando}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg font-medium text-sm hover:bg-rose-700 disabled:opacity-50"
              >
                {salvando ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Sim, excluir tudo'}
              </button>
            </div>
          </div>
        </ModalBase>
      )}
    </div>
  );
}
// =====================================================================
// AVATAR COM DROPDOWN (menu de usuário no header)
// =====================================================================
function AvatarDropdown({ usuario, onSair, onAbrirConfig }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef();

  // Fecha ao clicar fora do menu
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Gera iniciais a partir do nome ou e-mail
  const iniciais = (usuario.nome || usuario.email || 'U')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 transition"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {iniciais}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100">
            <p className="font-semibold text-slate-900 truncate">{usuario.nome}</p>
            <p className="text-xs text-slate-500 truncate">{usuario.email}</p>
            {usuario.plano === 'premium' ? (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                <Crown className="w-3 h-3" /> Premium
              </span>
            ) : (
              <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                Plano Gratuito
              </span>
            )}
          </div>
          <button
            onClick={() => { setAberto(false); onAbrirConfig(); }}
            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" /> Minha Conta
          </button>
          <button
            onClick={() => { setAberto(false); onSair(); }}
            className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
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
function ListaTransacoes({ transacoes, contas, busca, setBusca, filtroCategoria, setFiltroCategoria, onEditar, onExcluir, onExcluirVarias }) {
  const [ordenacao, setOrdenacao] = useState('data_desc');
  const [selecionadas, setSelecionadas] = useState(new Set());
  
  const filtradas = useMemo(() => {
    let lista = transacoes
      .filter(t => filtroCategoria === 'todas' || t.categoria === filtroCategoria)
      .filter(t => !busca || t.descricao.toLowerCase().includes(busca.toLowerCase()));
    
    // Aplica ordenação
    switch (ordenacao) {
      case 'data_desc':
        lista.sort((a, b) => b.data.localeCompare(a.data));
        break;
      case 'data_asc':
        lista.sort((a, b) => a.data.localeCompare(b.data));
        break;
      case 'valor_desc':
        lista.sort((a, b) => b.valor - a.valor);
        break;
      case 'valor_asc':
        lista.sort((a, b) => a.valor - b.valor);
        break;
      case 'categoria':
        lista.sort((a, b) => a.categoria.localeCompare(b.categoria));
        break;
      case 'descricao':
        lista.sort((a, b) => a.descricao.localeCompare(b.descricao));
        break;
      default:
        lista.sort((a, b) => b.data.localeCompare(a.data));
    }
    
    return lista;
  }, [transacoes, busca, filtroCategoria, ordenacao]);
  function toggleSelecao(id) {
    const nova = new Set(selecionadas);
    if (nova.has(id)) nova.delete(id);
    else nova.add(id);
    setSelecionadas(nova);
  }

  function selecionarTodas() {
    if (selecionadas.size === filtradas.length) {
      setSelecionadas(new Set());
    } else {
      setSelecionadas(new Set(filtradas.map(t => t.id)));
    }
  }

  function excluirSelecionadas() {
    const qtd = selecionadas.size;
    if (qtd === 0) return;
    if (confirm(`Excluir ${qtd} ${qtd === 1 ? 'transação' : 'transações'} selecionada${qtd === 1 ? '' : 's'}? Esta ação não pode ser desfeita.`)) {
      onExcluirVarias(Array.from(selecionadas));
      setSelecionadas(new Set());
    }
  }

  const todasSelecionadas = filtradas.length > 0 && selecionadas.size === filtradas.length;
  return (
    <div className="space-y-4">
      {/* Barra de ações em massa - aparece só quando tem seleção */}
      {selecionadas.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-medium text-indigo-900">
            {selecionadas.size} {selecionadas.size === 1 ? 'transação selecionada' : 'transações selecionadas'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelecionadas(new Set())}
              className="px-3 py-1.5 text-sm text-slate-700 hover:bg-white rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={excluirSelecionadas}
              className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Excluir selecionadas
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm" />
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
          <option value="todas">Todas as categorias</option>
          {Object.keys(CATEGORIAS).map(cat => <option key={cat} value={cat}>{CATEGORIAS[cat].icone} {cat}</option>)}
        </select>
        <select value={ordenacao} onChange={e => setOrdenacao(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
          <option value="data_desc">📅 Data (mais recente)</option>
          <option value="data_asc">📅 Data (mais antiga)</option>
          <option value="valor_desc">💰 Valor (maior)</option>
          <option value="valor_asc">💰 Valor (menor)</option>
          <option value="categoria">🏷️ Categoria (A-Z)</option>
          <option value="descricao">🔤 Descrição (A-Z)</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtradas.length === 0 ? (
          <EstadoVazio mensagem="Nenhuma transação encontrada" />
        ) : (
          <>
            {/* Checkbox selecionar todas */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
              <input
                type="checkbox"
                checked={todasSelecionadas}
                onChange={selecionarTodas}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600">
                {todasSelecionadas ? 'Desmarcar todas' : `Selecionar todas (${filtradas.length})`}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
            {filtradas.map(t => (
              <div key={t.id} className={`p-4 hover:bg-slate-50 flex items-center gap-3 transition ${selecionadas.has(t.id) ? 'bg-indigo-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={selecionadas.has(t.id)}
                  onChange={() => toggleSelecao(t.id)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                />
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
          </>
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

function ModalImportacao({ onFechar, onResultado, regrasUsuario, contas, onAtualizarContaDatas }) {
  const [arquivo, setArquivo] = useState(null);
  const [textoColar, setTextoColar] = useState('');
  const [modo, setModo] = useState('pdf');
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const inputRef = useRef();
  const [contaDestino, setContaDestino] = useState(contas[0]?.id || '');

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
      
      // Verifica se a conta destino é um cartão e tenta detectar datas da fatura
      const contaSelecionada = contas.find(c => c.id === contaDestino);
      let datasFatura = { diaFechamento: null, diaVencimento: null };
      
      if (contaSelecionada?.tipo === 'cartao') {
        datasFatura = detectarDatasFatura(textoCompleto);
        
        // Se detectou datas E o cartão ainda não tem, atualiza automaticamente
        if (datasFatura.diaFechamento && !contaSelecionada.dia_fechamento) {
          onAtualizarContaDatas(contaDestino, datasFatura);
        }
      }
      
      // Define dia de fechamento a usar pra calcular competência
      // Prioridade: dados detectados na fatura > dados já cadastrados no cartão
      const fechamentoAtivo = datasFatura.diaFechamento || contaSelecionada?.dia_fechamento;
      
      // Reaplica categorização, conta destino, e calcula competência
      transacoes.forEach(t => { 
        t.categoria = categorizar(t.descricao, regrasUsuario);
        t.conta = contaDestino;
        
        // Pra cartão de crédito: calcula competência baseada na data da compra
        if (contaSelecionada?.tipo === 'cartao' && fechamentoAtivo) {
          t.competencia = calcularCompetencia(t.data, fechamentoAtivo);
        } else {
          // Pra conta corrente: competência = mês da própria data
          t.competencia = t.data.slice(0, 7);
        }
      });
      
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
    
    // Verifica se a conta destino é um cartão e detecta datas
    const contaSelecionada = contas.find(c => c.id === contaDestino);
    let datasFatura = { diaFechamento: null, diaVencimento: null };
    
    if (contaSelecionada?.tipo === 'cartao') {
      datasFatura = detectarDatasFatura(textoColar);
      if (datasFatura.diaFechamento && !contaSelecionada.dia_fechamento) {
        onAtualizarContaDatas(contaDestino, datasFatura);
      }
    }
    
    const fechamentoAtivo = datasFatura.diaFechamento || contaSelecionada?.dia_fechamento;
    
    transacoes.forEach(t => { 
      t.categoria = categorizar(t.descricao, regrasUsuario);
      t.conta = contaDestino;
      
      if (contaSelecionada?.tipo === 'cartao' && fechamentoAtivo) {
        t.competencia = calcularCompetencia(t.data, fechamentoAtivo);
      } else {
        t.competencia = t.data.slice(0, 7);
      }
    });
    if (transacoes.length === 0) { setErro('Não consegui identificar transações.'); return; }
    onResultado(transacoes);
  }

  return (
    <ModalBase titulo="Importar Extrato ou Fatura" onFechar={onFechar}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Importar para:
          </label>
          <select 
            value={contaDestino} 
            onChange={e => setContaDestino(e.target.value)} 
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
          >
            {contas.map(c => (
              <option key={c.id} value={c.id}>
                {c.tipo === 'cartao' ? '💳' : '🏦'} {c.nome}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Todas as transações importadas serão vinculadas a esta conta
          </p>
        </div>
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
    // Sistema de aprendizado: usa a descrição ATUAL (que pode ter sido editada)
    // para criar regra de categorização
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
                <div className="flex-1 min-w-0 mr-2">
                  <input
                    type="text"
                    value={t.descricao}
                    onChange={e => atualizar(t.id, 'descricao', e.target.value)}
                    className="w-full font-medium text-sm text-slate-900 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-400 focus:bg-white rounded px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-100"
                    title="Clique para editar a descrição"
                  />
                  <p className="text-xs text-slate-500 px-2">{formatarData(t.data)}</p>
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
  const [form, setForm] = useState(conta || { 
    nome: '', 
    tipo: 'conta', 
    saldoInicial: 0, 
    limite: 0, 
    cor: '#3b82f6',
    dia_fechamento: 25,
    dia_vencimento: 5
  });
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
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Limite</label>
              <input 
                type="number" 
                step="0.01" 
                value={form.limite} 
                onChange={e => setForm({ ...form, limite: parseFloat(e.target.value) || 0 })} 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" 
              />
            </div>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-indigo-900 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Ciclo de fatura
              </p>
              <p className="text-xs text-indigo-700 mb-3">
                Configure as datas do seu cartão. Você consegue ver essas datas no app do banco ou na fatura mais recente.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Dia de fechamento</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31"
                    value={form.dia_fechamento || ''} 
                    onChange={e => setForm({ ...form, dia_fechamento: parseInt(e.target.value) || null })} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" 
                    placeholder="25"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Dia em que a fatura fecha</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Dia de vencimento</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31"
                    value={form.dia_vencimento || ''} 
                    onChange={e => setForm({ ...form, dia_vencimento: parseInt(e.target.value) || null })} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" 
                    placeholder="5"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Dia em que você paga</p>
                </div>
              </div>
            </div>
          </>
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
