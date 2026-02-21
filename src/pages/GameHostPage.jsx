import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './GameHostPage.css'

/**
 * GAME HOST PAGE
 * 
 * Teacher/Host controls:
 * 1. Add questions to the game
 * 2. See game code for students
 * 3. Start/manage the game
 * 4. View live leaderboard as students answer
 * 
 * Real-time updates: Subscribes to game_sessions table
 * to show live score updates as students answer
 */

export default function GameHostPage({ gameId, onBack }) {
  const [game, setGame] = useState(null)
  const [questions, setQuestions] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Form state for adding questions
  const [questionText, setQuestionText] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [wrongAnswers, setWrongAnswers] = useState(['', '', ''])
  const [points, setPoints] = useState(100)

  /**
   * FETCH GAME & QUESTIONS
   * 
   * When component mounts:
   * 1. Load game info
   * 2. Load all questions for this game
   * 3. Load all player sessions
   */
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Get game info
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single()

        if (gameError) throw gameError
        setGame(gameData)

        // Get questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('game_id', gameId)

        if (questionsError) throw questionsError
        setQuestions(questionsData || [])

        // Get player sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('game_id', gameId)
          .order('score', { ascending: false })

        if (sessionsError) throw sessionsError
        setSessions(sessionsData || [])
      } catch (err) {
        console.error('Error fetching game data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()

    /**
     * REAL-TIME SUBSCRIPTION
     * 
     * Subscribe to changes in game_sessions table
     * When a player answers a question, their score updates
     * This subscription automatically updates the leaderboard
     */
    const subscription = supabase
      .channel(`game_sessions:game_id=eq.${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          // When a session score changes, update the leaderboard
          setSessions((prev) =>
            prev
              .map((s) => (s.id === payload.new.id ? payload.new : s))
              .sort((a, b) => b.score - a.score)
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_sessions',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          // When a new player joins
          setSessions((prev) =>
            [...prev, payload.new].sort((a, b) => b.score - a.score)
          )
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [gameId])

  /**
   * ADD QUESTION HANDLER
   * 
   * When host adds a question:
   * 1. Validate inputs
   * 2. Insert into questions table
   * 3. Reset form
   */
  const handleAddQuestion = async (e) => {
    e.preventDefault()

    if (!questionText || !correctAnswer || wrongAnswers.some((a) => !a)) {
      alert('Please fill in all fields')
      return
    }

    try {
      const { error } = await supabase.from('questions').insert([
        {
          game_id: gameId,
          question: questionText,
          correct_answer: correctAnswer,
          incorrect_answers: wrongAnswers,
          points: points,
        },
      ])

      if (error) throw error

      // Reset form
      setQuestionText('')
      setCorrectAnswer('')
      setWrongAnswers(['', '', ''])
      setPoints(100)

      // Refresh questions list
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('game_id', gameId)

      setQuestions(questionsData || [])
    } catch (err) {
      alert('Error adding question: ' + err.message)
    }
  }

  /**
   * START GAME HANDLER
   * 
   * When host clicks "Start Game"
   * Display current question to all players
   */
  const handleStartGame = () => {
    if (questions.length === 0) {
      alert('Please add at least one question!')
      return
    }
    setGameStarted(true)
  }

  /**
   * NEXT QUESTION HANDLER
   */
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      alert('Quiz complete!')
      setGameStarted(false)
    }
  }

  if (loading) {
    return <div className="host-page loading">Loading game...</div>
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="host-page">
      <div className="host-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>{game?.title || 'Game'}</h1>
        <div className="game-code">
          <div className="code-label">Share Code:</div>
          <div className="code-value">{gameId}</div>
          <button 
            className="copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(gameId)
              alert('✅ Code copied to clipboard!')
            }}
          >
            📋 Copy
          </button>
        </div>
      </div>

      <div className="host-content">
        {/* LEFT SIDE: ADD QUESTIONS OR DISPLAY CURRENT QUESTION */}
        <div className="left-panel">
          {!gameStarted ? (
            <>
              <h2>Add Questions</h2>
              <form onSubmit={handleAddQuestion} className="question-form">
                <textarea
                  placeholder="Question text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="form-input"
                  rows="2"
                />

                <input
                  type="text"
                  placeholder="Correct Answer"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="form-input"
                />

                {wrongAnswers.map((answer, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Wrong Answer ${idx + 1}`}
                    value={answer}
                    onChange={(e) => {
                      const newAnswers = [...wrongAnswers]
                      newAnswers[idx] = e.target.value
                      setWrongAnswers(newAnswers)
                    }}
                    className="form-input"
                  />
                ))}

                <div className="points-input">
                  <label>Points:</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value))}
                    min="10"
                    step="10"
                  />
                </div>

                <button type="submit" className="add-btn">
                  Add Question
                </button>
              </form>

              <div className="questions-list">
                <h3>Questions Added: {questions.length}</h3>
                {questions.map((q, idx) => (
                  <div key={q.id} className="question-item">
                    {idx + 1}. {q.question}
                  </div>
                ))}
              </div>

              {questions.length > 0 && (
                <button className="start-btn" onClick={handleStartGame}>
                  🎮 Start Game
                </button>
              )}
            </>
          ) : (
            <>
              <div className="current-question">
                <div className="q-counter">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <h2>{currentQuestion?.question}</h2>
                <div className="answers-list">
                  <div className="answer-item correct">
                    ✓ {currentQuestion?.correct_answer}
                  </div>
                  {currentQuestion?.incorrect_answers.map((ans, idx) => (
                    <div key={idx} className="answer-item wrong">
                      ✗ {ans}
                    </div>
                  ))}
                </div>
                <button className="next-btn" onClick={handleNextQuestion}>
                  {currentQuestionIndex < questions.length - 1
                    ? 'Next Question →'
                    : 'End Quiz'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDE: LIVE LEADERBOARD */}
        <div className="right-panel">
          <h2>🏆 Leaderboard</h2>
          <div className="leaderboard">
            {sessions.length === 0 ? (
              <p className="no-players">Waiting for players...</p>
            ) : (
              sessions.map((session, idx) => (
                <div key={session.id} className="leaderboard-row">
                  <span className="rank">#{idx + 1}</span>
                  <span className="name">{session.player_name}</span>
                  <span className="score">{session.score} pts</span>
                </div>
              ))
            )}
          </div>

          <div className="game-stats">
            <p>Total Players: {sessions.length}</p>
            <p>Total Questions: {questions.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}