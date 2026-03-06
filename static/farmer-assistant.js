/**
 * Kisaan Saathi - Farmer AI Assistant
 * Full-featured chat with voice input/output, web search, markdown rendering,
 * follow-up suggestions, and multi-language support.
 */
document.addEventListener('DOMContentLoaded', function () {
    // ── DOM Elements ──────────────────────────────────────────────
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const languageSelect = document.getElementById('language-select');
    const webSearchToggle = document.getElementById('web-search-toggle');

    // ── State ─────────────────────────────────────────────────────
    let chatHistory = [];
    let webSearchEnabled = false;
    let isRecording = false;
    let recognition = null;
    let currentUtterance = null;
    let isSpeaking = false;

    // ── Language mapping ──────────────────────────────────────────
    const LANG_MAP = {
        'en': { name: 'English', sttCode: 'en-IN', ttsLang: 'en-IN' },
        'hi': { name: 'हिन्दी', sttCode: 'hi-IN', ttsLang: 'hi-IN' },
        'pa': { name: 'ਪੰਜਾਬੀ', sttCode: 'pa-IN', ttsLang: 'pa-IN' },
        'kn': { name: 'ಕನ್ನಡ', sttCode: 'kn-IN', ttsLang: 'kn-IN' },
        'ta': { name: 'தமிழ்', sttCode: 'ta-IN', ttsLang: 'ta-IN' },
        'te': { name: 'తెలుగు', sttCode: 'te-IN', ttsLang: 'te-IN' },
        'ml': { name: 'മലയാളം', sttCode: 'ml-IN', ttsLang: 'ml-IN' },
        'mr': { name: 'मराठी', sttCode: 'mr-IN', ttsLang: 'mr-IN' },
        'gu': { name: 'ગુજરાતી', sttCode: 'gu-IN', ttsLang: 'gu-IN' },
    };

    // ── Inject voice & TTS buttons into the UI ───────────────────
    _injectVoiceButtons();

    // ── Web Search Toggle ─────────────────────────────────────────
    if (webSearchToggle) {
        webSearchToggle.addEventListener('click', function () {
            webSearchEnabled = !webSearchEnabled;
            this.classList.toggle('search-active', webSearchEnabled);
            this.title = webSearchEnabled ? 'Web search ON (click to disable)' : 'Toggle web search';
        });
    }

    // ── Quick Question Buttons ────────────────────────────────────
    document.querySelectorAll('.quick-question').forEach(function(btn) {
        btn.addEventListener('click', function () {
            messageInput.value = this.textContent.trim();
            messageInput.focus();
        });
    });

    // ── Send Message ──────────────────────────────────────────────
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        addMessageToChat(message, true);
        messageInput.value = '';

        const loadingEl = showLoadingIndicator();

        try {
            var data;
            if (webSearchEnabled) {
                data = await callWebSearch(message);
            } else {
                data = await callFarmerChat(message);
            }

            chatMessages.removeChild(loadingEl);

            var responseText = data.response ||
                (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
                'No response received.';

            addMessageToChat(responseText, false, true);

            // Update chat history
            if (Array.isArray(data.chat_history)) {
                chatHistory = data.chat_history;
            } else {
                chatHistory.push(message);
                chatHistory.push(responseText);
            }

            // Extract follow-up suggestions
            var suggestions = extractFollowUps(responseText);
            if (suggestions.length > 0) {
                showFollowUpButtons(suggestions);
            }

        } catch (error) {
            console.error('Error:', error);
            chatMessages.removeChild(loadingEl);
            addMessageToChat('Sorry, I encountered an error: ' + error.message, false, false);
            chatHistory.push(message);
            chatHistory.push('Sorry, I encountered an error. Please try again.');
        }
    }

    // ── API Calls ─────────────────────────────────────────────────
    async function callFarmerChat(question) {
        var response = await fetch('/api/farmer-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: question, chat_history: chatHistory }),
        });
        var data = await response.json();
        if (!response.ok) throw new Error(data.error || data.detail || 'Server error');
        return data;
    }

    async function callWebSearch(question) {
        var response = await fetch('/api/web-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: question }),
        });
        var data = await response.json();
        if (!response.ok) throw new Error(data.error || data.detail || 'Web search error');
        // Normalize Perplexity response
        var content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || 'No results found.';
        return { response: content, chat_history: chatHistory };
    }

    // ── Chat UI ───────────────────────────────────────────────────
    function addMessageToChat(message, isUser, renderMarkdown) {
        if (typeof isUser === 'undefined') isUser = false;
        if (typeof renderMarkdown === 'undefined') renderMarkdown = false;

        var wrapper = document.createElement('div');
        wrapper.className = 'flex items-start gap-3 ' + (isUser ? 'justify-end' : '');

        var avatar = document.createElement('div');
        avatar.className = 'w-10 h-10 rounded-full flex items-center justify-center shrink-0 ' +
            (isUser ? 'bg-blue-500/20 text-blue-400 order-2' : 'bg-[#4caf50]/20 text-[#4caf50]');
        avatar.innerHTML = '<i class="fas ' + (isUser ? 'fa-user' : 'fa-robot') + '"></i>';

        var bubble = document.createElement('div');
        bubble.className = (isUser ? 'bg-[#4caf50]/20 rounded-2xl rounded-tr-none' : 'bg-[#1a2e1d] rounded-2xl rounded-tl-none') +
            ' p-4 max-w-[80%] shadow-lg';

        if (renderMarkdown && !isUser && typeof marked !== 'undefined') {
            var mdDiv = document.createElement('div');
            mdDiv.className = 'markdown-content text-white text-sm leading-relaxed';
            mdDiv.innerHTML = marked.parse(message);
            bubble.appendChild(mdDiv);

            // Add TTS button for bot messages
            var ttsBtn = document.createElement('button');
            ttsBtn.className = 'tts-btn mt-2 text-gray-400 text-xs hover:text-[#4caf50] transition-colors';
            ttsBtn.innerHTML = '<i class="fas fa-volume-up mr-1"></i> Listen';
            (function(msg, btn) {
                btn.addEventListener('click', function() { speakText(msg, btn); });
            })(message, ttsBtn);
            bubble.appendChild(ttsBtn);
        } else {
            var p = document.createElement('p');
            p.className = 'text-white text-sm leading-relaxed';
            p.textContent = message;
            bubble.appendChild(p);
        }

        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);
        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showLoadingIndicator() {
        var wrapper = document.createElement('div');
        wrapper.className = 'flex items-start gap-3';
        wrapper.innerHTML =
            '<div class="w-10 h-10 rounded-full bg-[#4caf50]/20 flex items-center justify-center text-[#4caf50] shrink-0">' +
            '<i class="fas fa-robot"></i></div>' +
            '<div class="bg-[#1a2e1d] rounded-2xl rounded-tl-none p-4 max-w-[80%] shadow-lg">' +
            '<div class="flex items-center space-x-2">' +
            '<div class="w-2 h-2 bg-[#4caf50] rounded-full animate-bounce"></div>' +
            '<div class="w-2 h-2 bg-[#4caf50] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>' +
            '<div class="w-2 h-2 bg-[#4caf50] rounded-full animate-bounce" style="animation-delay: 0.4s"></div>' +
            '</div></div>';
        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return wrapper;
    }

    // ── Follow-Up Suggestions ─────────────────────────────────────
    function extractFollowUps(text) {
        var suggestions = [];
        // Extract lines starting with >> (like reference project)
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var trimmed = lines[i].trim();
            if (trimmed.indexOf('>>') === 0) {
                suggestions.push(trimmed.replace(/^>>\s*/, ''));
            }
        }
        // If no >> markers, generate contextual suggestions
        if (suggestions.length === 0) {
            var lower = text.toLowerCase();
            if (lower.indexOf('disease') >= 0 || lower.indexOf('pest') >= 0) {
                suggestions.push('What are organic treatment options?');
                suggestions.push('How to prevent this disease?');
            } else if (lower.indexOf('weather') >= 0 || lower.indexOf('rain') >= 0) {
                suggestions.push('What crops are best for this season?');
                suggestions.push('How to protect crops from heavy rain?');
            } else if (lower.indexOf('scheme') >= 0 || lower.indexOf('government') >= 0) {
                suggestions.push('How to apply for this scheme?');
                suggestions.push('What documents are needed?');
            } else if (lower.indexOf('price') >= 0 || lower.indexOf('market') >= 0) {
                suggestions.push('Which market offers the best price?');
                suggestions.push('When is the best time to sell?');
            }
        }
        return suggestions.slice(0, 3);
    }

    function showFollowUpButtons(suggestions) {
        var container = document.createElement('div');
        container.className = 'flex flex-wrap gap-2 ml-13 mt-1';

        for (var i = 0; i < suggestions.length; i++) {
            (function(suggestion) {
                var btn = document.createElement('button');
                btn.className = 'follow-up-btn text-xs px-3 py-1.5 rounded-full border border-[#4caf50]/30 text-gray-300 bg-[#1a2e1d] hover:bg-[#223423] hover:text-[#4caf50] transition-all';
                btn.textContent = suggestion;
                btn.addEventListener('click', function() {
                    messageInput.value = suggestion;
                    container.remove();
                    sendMessage();
                });
                container.appendChild(btn);
            })(suggestions[i]);
        }

        chatMessages.appendChild(container);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ── Voice Input (Web Speech API) ──────────────────────────────
    function _injectVoiceButtons() {
        var inputContainer = messageInput ? messageInput.parentElement.parentElement : null;
        if (!inputContainer) return;

        // Create mic button
        var micBtn = document.createElement('button');
        micBtn.id = 'mic-button';
        micBtn.className = 'w-12 h-12 rounded-xl border border-[#2d3d2f] bg-[#1a2e1d] text-gray-400 flex items-center justify-center transition-all hover:text-white hover:bg-[#223423]';
        micBtn.title = 'Voice input';
        micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        micBtn.addEventListener('click', toggleVoiceInput);

        // Insert mic button before send button
        var sendBtnRef = document.getElementById('send-button');
        if (sendBtnRef && sendBtnRef.parentElement) {
            sendBtnRef.parentElement.insertBefore(micBtn, sendBtnRef);
        }
    }

    function toggleVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            addMessageToChat('Voice input is not supported in your browser. Please use Chrome or Edge.', false, false);
            return;
        }

        var micBtn = document.getElementById('mic-button');
        if (!micBtn) return;

        if (isRecording) {
            stopRecording(micBtn);
        } else {
            startRecording(micBtn);
        }
    }

    function startRecording(micBtn) {
        var SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognitionAPI();

        var langCode = languageSelect ? languageSelect.value : 'en';
        var langInfo = LANG_MAP[langCode] || LANG_MAP['en'];

        recognition.lang = langInfo.sttCode;
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function() {
            isRecording = true;
            micBtn.classList.add('mic-active');
            micBtn.innerHTML = '<i class="fas fa-stop"></i>';
            messageInput.placeholder = 'Listening...';
        };

        recognition.onresult = function(event) {
            var transcript = '';
            for (var i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            messageInput.value = transcript;
        };

        recognition.onend = function() {
            stopRecording(micBtn);
            // Auto-send if we got text
            if (messageInput.value.trim()) {
                sendMessage();
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            stopRecording(micBtn);
            if (event.error === 'not-allowed') {
                addMessageToChat('Microphone access denied. Please allow microphone permission.', false, false);
            }
        };

        recognition.start();
    }

    function stopRecording(micBtn) {
        isRecording = false;
        if (recognition) {
            try { recognition.stop(); } catch (e) { /* ignore */ }
        }
        if (micBtn) {
            micBtn.classList.remove('mic-active');
            micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
        messageInput.placeholder = 'Type your question here...';
    }

    // ── Text-to-Speech (Web Speech API) ───────────────────────────
    function speakText(text, button) {
        if (!('speechSynthesis' in window)) {
            console.warn('Text-to-speech not supported');
            return;
        }

        // If already speaking, stop
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
            if (button) {
                button.classList.remove('speaking');
                button.innerHTML = '<i class="fas fa-volume-up mr-1"></i> Listen';
            }
            return;
        }

        // Clean markdown for TTS
        var cleanText = text
            .replace(/#{1,6}\s/g, '')
            .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1')
            .replace(/`{1,3}[^`]*`{1,3}/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/^[-*+]\s/gm, '')
            .replace(/^>\s/gm, '')
            .replace(/^>>\s/gm, '')
            .replace(/\n{2,}/g, '. ')
            .replace(/\n/g, '. ')
            .trim();

        var langCode = languageSelect ? languageSelect.value : 'en';
        var langInfo = LANG_MAP[langCode] || LANG_MAP['en'];

        currentUtterance = new SpeechSynthesisUtterance(cleanText);
        currentUtterance.lang = langInfo.ttsLang;
        currentUtterance.rate = 0.9;
        currentUtterance.pitch = 1;

        currentUtterance.onstart = function() {
            isSpeaking = true;
            if (button) {
                button.classList.add('speaking');
                button.innerHTML = '<i class="fas fa-stop mr-1"></i> Stop';
            }
        };

        currentUtterance.onend = function() {
            isSpeaking = false;
            if (button) {
                button.classList.remove('speaking');
                button.innerHTML = '<i class="fas fa-volume-up mr-1"></i> Listen';
            }
        };

        currentUtterance.onerror = function() {
            isSpeaking = false;
            if (button) {
                button.classList.remove('speaking');
                button.innerHTML = '<i class="fas fa-volume-up mr-1"></i> Listen';
            }
        };

        window.speechSynthesis.speak(currentUtterance);
    }
});