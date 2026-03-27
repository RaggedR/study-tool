import { useState } from 'react';
import type { FlashcardData, QuizQuestionData } from './note-store';
import { getApiKey, setApiKey, generateCards } from './ai-generate';

interface CardCreatorProps {
  flashcards: FlashcardData[];
  quizQuestions: QuizQuestionData[];
  noteContent: string;
  onUpdateFlashcards: (cards: FlashcardData[]) => void;
  onUpdateQuiz: (questions: QuizQuestionData[]) => void;
}

export default function CardCreator({
  flashcards,
  quizQuestions,
  noteContent,
  onUpdateFlashcards,
  onUpdateQuiz,
}: CardCreatorProps) {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState(getApiKey());

  async function handleGenerate() {
    const key = getApiKey();
    if (!key) {
      setShowKeyInput(true);
      return;
    }

    setGenerating(true);
    setGenError('');

    try {
      const result = await generateCards(noteContent, 'both');

      if (result.flashcards.length > 0) {
        onUpdateFlashcards([...flashcards, ...result.flashcards]);
      }
      if (result.quizQuestions.length > 0) {
        onUpdateQuiz([...quizQuestions, ...result.quizQuestions]);
      }

      if (result.flashcards.length === 0 && result.quizQuestions.length === 0) {
        setGenError('AI returned empty results. Try notes with more content.');
      }
    } catch (err: any) {
      setGenError(err.message || 'Generation failed');
      if (err.message === 'Invalid API key') {
        setShowKeyInput(true);
      }
    } finally {
      setGenerating(false);
    }
  }

  function saveKey() {
    setApiKey(keyInput.trim());
    setShowKeyInput(false);
    setGenError('');
  }

  return (
    <div className="creator-section" style={{ marginTop: '1.5rem' }}>
      {showKeyInput && (
        <div className="creator-form" style={{ marginBottom: '0.75rem' }}>
          <label>Anthropic API Key</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary btn-sm" onClick={saveKey} disabled={!keyInput.trim()}>
              Save Key
            </button>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--app-text-muted)' }}>
            Stored locally in your browser. Never sent anywhere except Anthropic's API.
            {' '}<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--app-accent)' }}>Get an API key</a>
          </span>
        </div>
      )}

      {genError && (
        <div style={{ color: 'var(--app-danger)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          {genError}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate Flashcards & Quiz'}
        </button>

        {!showKeyInput && (
          <button
            className="btn btn-sm"
            onClick={() => setShowKeyInput(true)}
            style={{ background: 'none', color: 'var(--app-text-muted)', fontSize: '0.8rem' }}
          >
            {getApiKey() ? 'Change API Key' : 'Set API Key'}
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--app-text-muted)', marginTop: '0.5rem' }}>
        This could take ~30 seconds
      </p>
    </div>
  );
}
