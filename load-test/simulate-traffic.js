import { io } from 'socket.io-client';

const TARGET_URL = process.env.VITE_SOCKET_URL || 'http://localhost:5000';
const CONCURRENT_CLIENTS = parseInt(process.env.USERS || '50', 10);
const TEST_DURATION_SECONDS = parseInt(process.env.DURATION || '15', 10);

console.log(`=============================================================`);
console.log(`  🚀 VibePulse Matchmaking Load Test Initialized`);
console.log(`  Target Server: ${TARGET_URL}`);
console.log(`  Concurrent Clients: ${CONCURRENT_CLIENTS}`);
console.log(`  Duration: ${TEST_DURATION_SECONDS} seconds`);
console.log(`=============================================================\n`);

const metrics = {
  connected: 0,
  queued: 0,
  matchesFound: 0,
  messagesSent: 0,
  messagesReceived: 0,
  skips: 0,
  errors: 0
};

const clients = [];

const spawnClient = (index) => {
  const sessionId = `sim_user_${index}_${Math.random().toString(36).substring(2, 7)}`;
  const socket = io(TARGET_URL, {
    auth: { sessionId },
    transports: ['websocket'],
    reconnection: false
  });

  let currentRoom = null;

  socket.on('connect', () => {
    metrics.connected++;
    // Join matchmaking queue after small jitter
    setTimeout(() => {
      socket.emit('join_queue');
      metrics.queued++;
    }, Math.random() * 500);
  });

  socket.on('match_found', (data) => {
    metrics.matchesFound++;
    currentRoom = data;

    // Simulate sending a test message in room
    setTimeout(() => {
      if (currentRoom) {
        socket.emit('send_message', {
          roomId: data.roomId,
          text: `Hello from ${sessionId}!`
        });
        metrics.messagesSent++;
      }
    }, 400);

    // Simulate next / skip action after 2 seconds
    setTimeout(() => {
      if (currentRoom) {
        socket.emit('next_user');
        metrics.skips++;
        currentRoom = null;
      }
    }, 2000 + Math.random() * 1500);
  });

  socket.on('receive_message', () => {
    metrics.messagesReceived++;
  });

  socket.on('error', (err) => {
    metrics.errors++;
  });

  socket.on('connect_error', () => {
    metrics.errors++;
  });

  clients.push(socket);
};

// Spawn all concurrent test clients
for (let i = 0; i < CONCURRENT_CLIENTS; i++) {
  spawnClient(i);
}

// Print live telemetry interval
const liveInterval = setInterval(() => {
  console.log(
    `[Live Status] Online: ${metrics.connected}/${CONCURRENT_CLIENTS} | Matches: ${metrics.matchesFound} | Messages: ${metrics.messagesReceived} | Skips: ${metrics.skips} | Errors: ${metrics.errors}`
  );
}, 2000);

// Conclude test after duration
setTimeout(() => {
  clearInterval(liveInterval);
  console.log(`\n=============================================================`);
  console.log(`  📊 VibePulse Load Test Completed`);
  console.log(`=============================================================`);
  console.log(`  Total Virtual Users   : ${CONCURRENT_CLIENTS}`);
  console.log(`  Connected Sockets     : ${metrics.connected}`);
  console.log(`  Queued Actions        : ${metrics.queued}`);
  console.log(`  Matches Formed        : ${metrics.matchesFound}`);
  console.log(`  Messages Delivered    : ${metrics.messagesReceived}`);
  console.log(`  Partner Skips         : ${metrics.skips}`);
  console.log(`  Errors / Drops        : ${metrics.errors}`);
  console.log(`=============================================================\n`);

  clients.forEach((s) => s.disconnect());
  process.exit(0);
}, TEST_DURATION_SECONDS * 1000);
