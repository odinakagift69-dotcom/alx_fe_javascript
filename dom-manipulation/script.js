// ===========================
// Dynamic Quote Generator - Server Sync Version
// ===========================

// ---------- Local Storage Helpers ----------
function getLocalQuotes() {
  return JSON.parse(localStorage.getItem('quotes')) || [];
}

function saveLocalQuotes(quotes) {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ---------- Fetch from Mock Server ----------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();

    // Convert mock API data to quote objects
    const quotes = data.slice(0, 5).map(item => ({
      id: item.id,
      text: item.title,
      author: `User ${item.userId}`,
      timestamp: Date.now()
    }));

    console.log('Fetched quotes from server:', quotes);
    return quotes;
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
    return [];
  }
}

// ---------- Post to Mock Server ----------
async function postQuoteToServer(quote) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    });
    const result = await response.json();
    console.log('Posted quote to server:', result);
    return result;
  } catch (error) {
    console.error('Error posting quote:', error);
  }
}

// ---------- Conflict Resolution ----------
function resolveConflicts(localQuotes, serverQuotes) {
  // Simple strategy: server wins
  const merged = [...serverQuotes];

  localQuotes.forEach(local => {
    const exists = serverQuotes.find(s => s.id === local.id);
    if (!exists) merged.push(local);
  });

  console.log('Conflict resolved. Merged quotes:', merged);
  return merged;
}

// ---------- UI Notification ----------
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.background = '#333';
  notification.style.color = '#fff';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

// ---------- Sync Quotes ----------
async function syncQuotes() {
  console.log('Starting sync with server...');
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = getLocalQuotes();

  const mergedQuotes = resolveConflicts(localQuotes, serverQuotes);
  saveLocalQuotes(mergedQuotes);

  updateUI(mergedQuotes);
  showNotification('Quotes synced with server.');
}

// ---------- Update UI ----------
function updateUI(quotes) {
  const container = document.getElementById('quoteContainer');
  if (!container) return;

  container.innerHTML = '';
  quotes.forEach(quote => {
    const quoteDiv = document.createElement('div');
    quoteDiv.className = 'quote';
    quoteDiv.innerHTML = `<p>"${quote.text}"</p><small>- ${quote.author}</small>`;
    container.appendChild(quoteDiv);
  });
}

// ---------- Add New Quote ----------
function addQuote(text, author) {
  const newQuote = {
    id: Date.now(),
    text,
    author,
    timestamp: Date.now()
  };

  const localQuotes = getLocalQuotes();
  localQuotes.push(newQuote);
  saveLocalQuotes(localQuotes);

  postQuoteToServer(newQuote);
  updateUI(localQuotes);
  showNotification('New quote added locally and sent to server.');
}

// ---------- Periodic Sync ----------
setInterval(syncQuotes, 30000); // every 30 seconds

// ---------- Initial Load ----------
document.addEventListener('DOMContentLoaded', async () => {
  const quotes = getLocalQuotes();

  if (quotes.length === 0) {
    const serverQuotes = await fetchQuotesFromServer();
    saveLocalQuotes(serverQuotes);
    updateUI(serverQuotes);
  } else {
    updateUI(quotes);
  }

  showNotification('Quotes loaded successfully.');
});

