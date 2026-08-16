import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { db } from './db.js';
import { bot, setBroadcaster } from './bot.js';
import { LiveEvent, YouthProfile } from './types.js';
import { processAiQuery } from './aiEngine.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Connected WebSocket clients
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected. Total active clients: ${clients.size}`);

  // Send initial sync event
  ws.send(JSON.stringify({
    type: 'INIT_SYNC',
    data: {
      stats: db.getStats(),
      events: db.getEvents(10)
    }
  }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected. Active clients: ${clients.size}`);
  });
});

// Broadcast function for Telegram bot and REST API
function broadcast(type: string, messageRu: string, messageUz: string, mahalla: string, author: string, youth?: YouthProfile) {
  const event: LiveEvent = {
    id: `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type: type as any,
    timestamp: new Date().toISOString(),
    mahalla,
    author,
    messageRu,
    messageUz,
    youth
  };

  const payload = JSON.stringify({
    type: 'LIVE_EVENT',
    event,
    stats: db.getStats(),
    youthList: db.getAllYouth()
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Link broadcaster to Telegram bot
setBroadcaster(broadcast);

// REST API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), clientsCount: clients.size });
});

app.get('/api/youth', (req, res) => {
  const mahalla = req.query.mahalla as string;
  if (mahalla) {
    return res.json(db.getYouthByMahalla(mahalla));
  }
  res.json(db.getAllYouth());
});

app.get('/api/youth/:id', (req, res) => {
  const youth = db.getYouthById(req.params.id);
  if (!youth) return res.status(404).json({ error: 'Not found' });
  res.json(youth);
});

app.post('/api/youth', (req, res) => {
  const created = db.createYouth(req.body);
  broadcast(
    'NEW_YOUTH',
    `Зарегистрирован новый гражданин: ${created.full_name_demo} (${created.makhalla})`,
    `Янги фуқаро рўйхатга олинди: ${created.full_name_demo} (${created.makhalla})`,
    created.makhalla,
    'Веб-панель Хокимията',
    created
  );
  res.status(201).json(created);
});

app.patch('/api/youth/:id/status', (req, res) => {
  const { status, officer, comment } = req.body;
  const updated = db.updateYouthStatus(req.params.id, status, officer || 'Инспектор', comment);
  if (!updated) return res.status(404).json({ error: 'Not found' });

  broadcast(
    'STATUS_CHANGED',
    `Статус гражданина ${updated.full_name_demo} (${updated.makhalla}) изменен на: "${status}"`,
    `Фуқаро ${updated.full_name_demo} (${updated.makhalla}) ҳолати ўзгартирилди: "${status}"`,
    updated.makhalla,
    officer || 'Инспектор',
    updated
  );
  res.json(updated);
});

app.post('/api/youth/:id/verify', (req, res) => {
  const { verification, officer, newStatus, comment } = req.body;
  const updated = db.verifyNeetTriage(req.params.id, verification, officer || 'Инспектор', newStatus, comment);
  if (!updated) return res.status(404).json({ error: 'Not found' });

  broadcast(
    'TRIAGE_VERIFIED',
    `Верификация NEET проведена для: ${updated.full_name_demo} (${updated.makhalla}) — ${verification}`,
    `NEET верификацияси ўтказилди: ${updated.full_name_demo} (${updated.makhalla}) — ${verification}`,
    updated.makhalla,
    officer || 'Инспектор',
    updated
  );
  res.json(updated);
});

app.post('/api/youth/:id/assign-program', (req, res) => {
  const { program, officer } = req.body;
  const updated = db.assignProgram(req.params.id, program, officer || 'Инспектор');
  if (!updated) return res.status(404).json({ error: 'Not found' });

  broadcast(
    'PROGRAM_ASSIGNED',
    `${updated.full_name_demo} (${updated.makhalla}) направлен в программу: "${program.title}"`,
    `${updated.full_name_demo} (${updated.makhalla}) дастурга йўналтирилди: "${program.title}"`,
    updated.makhalla,
    officer || 'Инспектор',
    updated
  );
  res.json(updated);
});

app.get('/api/stats', (req, res) => {
  res.json(db.getStats());
});

app.get('/api/events', (req, res) => {
  res.json(db.getEvents(30));
});

// SOVEREIGN AI COPILOT ENDPOINT
app.post('/api/ai/query', (req, res) => {
  const { query, lang = 'ru' } = req.body;
  const result = processAiQuery(query, lang);
  res.json({
    text: result.text,
    action: result.action,
    timestamp: new Date().toISOString()
  });
});

// START SERVER & TELEGRAM BOT
server.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🚀 [BACKEND] Server running on http://localhost:${PORT}`);
  console.log(`⚡ [WEBSOCKET] ws://localhost:${PORT}`);
  console.log(`======================================================\n`);

  try {
    console.log(`🤖 [TELEGRAM] Starting Bot polling...`);
    bot.start({
      onStart(botInfo) {
        console.log(`✅ [TELEGRAM] Bot @${botInfo.username} successfully connected & polling!`);
      }
    });
  } catch (err) {
    console.error('❌ [TELEGRAM] Error starting bot:', err);
  }
});
