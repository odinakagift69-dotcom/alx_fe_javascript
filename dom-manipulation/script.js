// --------------------
// Utility: Save & Load Quotes from LocalStorage
// --------------------
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    return JSON.parse(storedQuotes);
  }
  return [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
    { text: "Do not let what you cannot do interfere with what you can do.", category: "Inspiration" }
  ];
}

// --------------------
// Initialize
// --------------------
let quotes = loadQuotes();

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const syncStatus = document.getElementById('syncStatus');

// --------------------
// Show Random Quote
// --------------------
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes =
    selectedCategory === 'all'
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;

  // Save last viewed quote
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// --------------------
// Add Quote Form
// --------------------
function createAddQuoteForm() {
  const container = document.getElementById('addQuoteForm');
  container.innerHTML = '';

  const textInput = document.createElement('input');
  textInput.id = 'newQuoteText';
  textInput.placeholder = 'Enter new quote';

  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter category';

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.onclick = addQuote;

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);
}

// --------------------
// Add Quote Function
// --------------------
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    showRandomQuote();
  } else {
    alert("Please fill out both fields!");
  }
}

// --------------------
// Category Handling
// --------------------
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastFilter = localStorage.getItem('lastFilter');
  if (lastFilter && categories.includes(lastFilter)) {
    categoryFilter.value = lastFilter;
  }
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem('lastFilter', selected);
  showRandomQuote();
}

// --------------------
// JSON Import / Export
// --------------------
document.getElementById('exportJson').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
        showRandomQuote();
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Error reading JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// --------------------
// Sync with Server (Mock API + Conflict Resolution)
// --------------------
async function syncQuotes() {
  syncStatus.textContent = "Syncing with server...";
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverData = await response.json();

    // Simulate server quotes (use first 5 posts)
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: server wins
    const localTexts = new Set(quotes.map(q => q.text));
    const newServerQuotes = serverQuotes.filter(q => !localTexts.has(q.text));
    quotes.push(...newServerQuotes);

    saveQuotes();
    populateCategories();
    syncStatus.textContent = "Sync complete!";
    showRandomQuote();
  } catch (error) {
    syncStatus.textContent = "Sync failed. Try again later.";
  }
}

setInterval(syncQuotes, 60000); // Periodically sync every 60s

// --------------------
// Event Listeners
// --------------------
newQuoteButton.addEventListener('click', showRandomQuote);
document.getElementById('syncQuotes').addEventListener('click', syncQuotes);

// --------------------
// Init
// --------------------
createAddQuoteForm();
populateCategories();

const lastQuote = sessionStorage.getItem('lastViewedQuote');
if (lastQuote) {
  const q = JSON.parse(lastQuote);
  quoteDisplay.textContent = `"${q.text}" — ${q.category}`;
} else {
  showRandomQuote();
}
