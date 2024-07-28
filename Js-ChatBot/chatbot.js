// Initialize speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';

// Initialize speech synthesis
const synth = window.speechSynthesis;

// Get elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const voiceSelect = document.getElementById('voice-select');
const volumeControl = document.getElementById('volume');
const rateControl = document.getElementById('rate');
const pitchControl = document.getElementById('pitch');

// Predefined responses
const responses = {
    "hello": "Hi there! How can I help you today?",
    "how are you": "I'm just a bunch of code, but I'm here to help you!",
    "what is your name": "I am Ai Model 1.9V.",
    "bye": "Goodbye! Have a great day!"
};

// Populate voice options
function populateVoiceList() {
  const voices = synth.getVoices();
  voiceSelect.innerHTML = '';
  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
  console.log('Voices loaded:', voices);
}

// Add a message to the chat
function addMessage(content, className) {
  const message = document.createElement('div');
  message.className = `message ${className}`;
  message.textContent = content;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Bot response
function botResponse(text) {
  addMessage(text, 'bot');
  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = synth.getVoices()[voiceSelect.value];
  utterance.voice = selectedVoice;
  utterance.volume = volumeControl.value;
  utterance.rate = rateControl.value;
  utterance.pitch = pitchControl.value;
  synth.speak(utterance);
  console.log('Bot response:', text);
  console.log('Utterance details:', utterance);
}

// Fetch educational information from Wikipedia
async function fetchEducationInfo(query) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  console.log('Fetching information from:', url); // Log the URL for debugging
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Wikipedia API response:', data);
    if (data.extract) {
      return data.extract;
    } else {
      console.warn('No extract found in the Wikipedia API response:', data);
      return 'Sorry, I could not fetch the information.';
    }
  } catch (error) {
    console.error('Error fetching education information:', error);
    return `Sorry, I could not fetch the information. Error: ${error.message}`;
  }
}

// Process user message
async function processMessage(message) {
  addMessage(message, 'user');
  userInput.value = '';
  let response;
  if (message.toLowerCase().startsWith('what is') || message.toLowerCase().startsWith('who is') || message.toLowerCase().startsWith('define')) {
    response = await fetchEducationInfo(message);
  } else {
    response = responses[message.toLowerCase()] || "I am here to help. Please ask me anything.";
  }
  botResponse(response);
}

// Send message
function sendMessage() {
  const message = userInput.value.trim();
  if (message) {
    processMessage(message);
  }
}

// Speech recognition event handlers
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  processMessage(transcript);
};

// Start speech recognition when the page loads
recognition.start();

// Restart speech recognition when it ends
recognition.onend = () => {
  recognition.start();
};

// Apply settings button
document.getElementById('apply-settings').addEventListener('click', () => {
  recognition.stop();
  recognition.start();
});

// Populate voice list when voices are loaded
synth.onvoiceschanged = populateVoiceList;

// Add an event listener for the enter key
userInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

// Populate voice list immediately if voices are already loaded
if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = populateVoiceList;
} else {
  populateVoiceList();
}
