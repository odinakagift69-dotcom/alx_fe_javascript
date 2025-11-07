// ===========================
// Dynamic Quote Generator with Server Sync
// ===========================

// ---------- Quotes Array ----------
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "You learn more from failure than from success.", category: "Life" },
  { text: "It's not whether you get knocked down, it's whether you get up.", category: "Motivation" }
];

// ---------- DOM Elements ----------
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// ---------- Display Random Quote ----------
function displayRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>Category: ${quote.category}</small>`;
}

// ---------- Add New Quote ----------
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);

  displayRandomQuote();

  // Clear input fields
  newQuoteText.value = '';
  newQuoteCategory.value = '';
}

// ---------- Event Listener ----------
newQuoteBtn.addEventListener('click', displayRandomQuote);

// ---------- Initial Display ----------
displayRandomQuote();

// ---------- Optional: Server Sync ----------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: `User ${item.userId}`,
      id: item.id,
      timestamp: Date.now()
    }));
    quotes = [...quotes, ...serverQuotes];
    displayRandomQuote();
    alert('Quotes synced with server!');
  } catch (err) {
    console.error("Error fetching quotes:", err);
  }
}

// Optional: fetch server quotes on load
fetchQuotesFromServer();
