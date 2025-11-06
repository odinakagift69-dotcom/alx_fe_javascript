// --------------------
// Load & Save Quotes from LocalStorage
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
    { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { id: 2, text: "Life is what happens when you’re busy making other plans.", category: "Life" },
    { id: 3, text: "Do not let what you cannot do interfere with what you can do.", category: "Inspiration" }
  ];
}

// --------------------
// Initialize Data
// --------------------
let quotes = loadQuotes();
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');

// --------------------
// Notification Banner
// --------------------
function showNotification(message, type = "info") {
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.style.position = "fixed";
    notification.style.top = "10px";
    notification.style.right = "10px";
    notification.style.padding = "10px";
    notification.style.borderRadius = "5px";
    notification.style.color = "#fff";
    notification.style.zIndex = "9999";
    document.body.appendChild(notification);
  }
  notification.style.backgroundColor = type === "error" ? "red" : "green";
  notification.textContent = message;
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

// --------------------
// Show a Random Quote (filtered)
// --------------------
function showRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
  if (selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// --------------------
// Create Add Quote Form Dynamically
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
      const newQuote = {
        id: Date.now(),
        text,
        category
      };
      quotes.push(newQuote);
      saveQuotes();
      populateCategories();
      inputText.value = '';
      inputCategory.value = '';
      showNotification("Quote added locally! Will sync with server shortly.");
      showRandomQuote();
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
// Populate Categories Dropdown Dynamically
// --------------------
function populateCategories() {
  const categories = ['all', ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem('selectedCategory') || 'all';
  categoryFilter.value = savedCategory;
}

// --------------------
// Filter Quotes by Category
// --------------------
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);
  showRandomQuote();
}

// --------------------
// JSON Export / Import
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

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showNotification('Quotes imported successfully!');
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
// Simulated Server Sync
// --------------------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const serverData = await response.json();

    // Simulate quotes on server
    const serverQuotes = serverData.map(post => ({
      id: post.id,
      text: post.title,
      category: 'Server'
    }));

    // Conflict resolution: server wins
    const mergedQuotes = [...quotes];
    let conflictsResolved = 0;

    serverQuotes.forEach(serverQuote => {
      const localIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
      if (localIndex > -1) {
        mergedQuotes[localIndex] = serverQuote;
        conflictsResolved++;
      } else {
        mergedQuotes.push(serverQuote);
      }
    });

    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();

    if (conflictsResolved > 0) {
      showNotification(`${conflictsResolved} conflicts resolved with server data.`);
    } else {
      showNotification("Quotes synced with server successfully!");
    }

  } catch (error) {
    showNotification("Failed to sync with server.", "error");
  }
}

// Sync every 60 seconds
setInterval(fetchQuotesFromServer, 60000);

// --------------------
// Event Listeners
// --------------------
newQuoteButton.addEventListener('click', showRandomQuote);

// --------------------
// Initialize Page
// --------------------
populateCategories();
createAddQuoteForm();
const lastQuote = sessionStorage.getItem('lastViewedQuote');
if (lastQuote) {
  const q = JSON.parse(lastQuote);
  quoteDisplay.textContent = `"${q.text}" — ${q.category}`;
} else {
  showRandomQuote();
}

// Trigger first sync on load
fetchQuotesFromServer();

