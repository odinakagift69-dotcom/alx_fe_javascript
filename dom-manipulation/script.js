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
// Initialize Quotes
// --------------------
let quotes = loadQuotes();

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');

// --------------------
// Show Random Quote
// --------------------
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;

  // Save last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// --------------------
// Create Add Quote Form (Dynamic DOM Creation)
// --------------------
function createAddQuoteForm() {
  const formContainer = document.createElement('div');

  const inputText = document.createElement('input');
  inputText.id = 'newQuoteText';
  inputText.type = 'text';
  inputText.placeholder = 'Enter a new quote';

  const inputCategory = document.createElement('input');
  inputCategory.id = 'newQuoteCategory';
  inputCategory.type = 'text';
  inputCategory.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';

  addButton.addEventListener('click', function() {
    const text = inputText.value.trim();
    const category = inputCategory.value.trim();
    if (text && category) {
      quotes.push({ text, category });
      inputText.value = '';
      inputCategory.value = '';
      saveQuotes(); // Save to local storage
      showRandomQuote(); // Update the displayed quote
    } else {
      alert('Please enter both quote and category.');
    }
  });

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);
  document.body.appendChild(formContainer);
}

// --------------------
// JSON Export
// --------------------
document.getElementById('exportJson').addEventListener('click', function() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// --------------------
// JSON Import
// --------------------
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
        showRandomQuote();
      } else {
        alert('Invalid JSON format!');
      }
    } catch (e) {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --------------------
// Event Listeners
// --------------------
newQuoteButton.addEventListener('click', showRandomQuote);

// --------------------
// Initialize Page
// --------------------
createAddQuoteForm();
const lastQuote = sessionStorage.getItem('lastViewedQuote');
if (lastQuote) {
  const q = JSON.parse(lastQuote);
  quoteDisplay.textContent = `"${q.text}" — ${q.category}`;
} else {
  showRandomQuote();
}

