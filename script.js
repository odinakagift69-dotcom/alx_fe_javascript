// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Do not let what you cannot do interfere with what you can do.", category: "Inspiration" }
];

// Select DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');

// Function to show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
}

// Function to dynamically create the Add Quote form and handle adding quotes
function createAddQuoteForm() {
  // Create form elements dynamically
  const formContainer = document.createElement('div');

  const inputQuote = document.createElement('input');
  inputQuote.id = 'newQuoteText';
  inputQuote.type = 'text';
  inputQuote.placeholder = 'Enter a new quote';

  const inputCategory = document.createElement('input');
  inputCategory.id = 'newQuoteCategory';
  inputCategory.type = 'text';
  inputCategory.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';

  // Add functionality to add a quote
  addButton.addEventListener('click', function() {
    const text = inputQuote.value.trim();
    const category = inputCategory.value.trim();

    if (text && category) {
      quotes.push({ text, category });

      // Clear inputs
      inputQuote.value = '';
      inputCategory.value = '';

      // Update the displayed quote
      showRandomQuote();

      alert('Quote added successfully!');
    } else {
      alert('Please enter both a quote and a category.');
    }
  });

  // Append all elements to the form container
  formContainer.appendChild(inputQuote);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);

  // Append form to body
  document.body.appendChild(formContainer);
}

// Event listener for the “Show New Quote” button
newQuoteButton.addEventListener('click', showRandomQuote);

// Call functions on load
showRandomQuote();
createAddQuoteForm();
