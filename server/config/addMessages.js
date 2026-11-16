const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

// 1. Download your service account key from the Firebase Console
// (Project Settings > Service Accounts) and place it in your project folder.
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL:
    'https://xchat-9abaf-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const db = getDatabase();
const roomId = '6afafc5f726114b61278b75d';

async function addDummyMessages() {
  const messagesRef = db.ref(`messages/${roomId}`);

  // Follows your rule validation requiring content, senderId, and timestamp
  const dummyMessages = [
    {
      content: 'Hey! Welcome to the new workspace.',
      senderId: '6af75922f0984d12d7535140',
      timestamp: Date.now(),
    },
    {
      content: 'Thanks! Excited to be here.',
      senderId: '6af75abef0984d12d7535143',
      timestamp: Date.now() + 1000,
    },
    {
      content: 'Is our database connected yet?',
      senderId: '6af75922f0984d12d7535140',
      timestamp: Date.now() + 2000,
    },
    {
      content: 'Yes, I just set up Firebase Realtime Database!',
      senderId: '6af75abef0984d12d7535143',
      timestamp: Date.now() + 3000,
    },
    {
      content: 'Nice! Does it support offline mode?',
      senderId: '6af75922f0984d12d7535140',
      timestamp: Date.now() + 4000,
    },
    {
      content: 'Yes, it caches data locally automatically.',
      senderId: '6af75abef0984d12d7535143',
      timestamp: Date.now() + 5000,
    },
    {
      content: 'That is perfect for mobile and web apps.',
      senderId: '6af75922f0984d12d7535140',
      timestamp: Date.now() + 6000,
    },
    {
      content: "Absolutely. Let's test sending multiple messages.",
      senderId: '6af75abef0984d12d7535143',
      timestamp: Date.now() + 7000,
    },
    {
      content: 'This is a great test for real-time synchronization.',
      senderId: '6af75922f0984d12d7535140',
      timestamp: Date.now() + 8000,
    },
    {
      content: 'Can we validate database rules with this?',
      senderId: '6af75abef0984d12d7535143',
      timestamp: Date.now() + 9000,
    },
    {
      content: 'Yes, I set up validation for content length.',
      senderId: '6af75922f0984d12d7535140',
      timestamp: Date.now() + 10000,
    },
    {
      content: 'Awesome. Max length is 5000 characters, right?',
      senderId: '6af75abef0984d12d7535143',
      timestamp: Date.now() + 11000,
    },
    {
      content: 'Exactly! And senderId must match auth.uid.',
      senderId: '6af75922f0984d12d7535140',
      timestamp: Date.now() + 12000,
    },
    {
      content: 'That keeps our chat highly secure.',
      senderId: '6af75abef0984d12d7535143',
      timestamp: Date.now() + 13000,
    },
    {
      content: "Let's check if the onValue listener works.",
      senderId: '6af75922f0984d12d7535140',
      timestamp: Date.now() + 14000,
    },
    {
      content: 'It triggers on any database changes immediately.',
      senderId: '6af75abef0984d12d7535143',
      timestamp: Date.now() + 15000,
    },
    {
      content: 'Working like a charm over here.',
      senderId: '6af75922f0984d12d7535140',
      timestamp: Date.now() + 16000,
    },
    {
      content: "Great. I'm going to start building the frontend UI.",
      senderId: '6af75abef0984d12d7535143',
      timestamp: Date.now() + 17000,
    },
    {
      content: 'Let me know if you need help with CSS styling.',
      senderId: '6af75922f0984d12d7535140',
      timestamp: Date.now() + 18000,
    },
    {
      content: "Thanks! Let's get to work.",
      senderId: '6af75abef0984d12d7535143',
      timestamp: Date.now() + 19000,
    },
  ];

  for (const msg of dummyMessages) {
    await messagesRef.push(msg);
  }

  console.log('Dummy messages added successfully!');
}

addDummyMessages().catch(console.error);
