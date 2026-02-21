import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './GamePlayerPage.css'

/**
 * GAME PLAYER PAGE
 * 
 * Student experience:
 * 1. Waits for quiz to start
 * 2. See current question
 * 3. Click answer
 * 4. Get instant feedback (correct/incorrect)
 * 5. See score update in real-time
 * 6. View leaderboard
 * 
 * Real-time: Subscribes to questions table
 * to see new questions as host advances
 */

export default function GamePlayerPage({
  gameId,
  sessionId,
  playerName,
  onBack,
}) {
  const [game, setGame] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [feedback, setFeedback] = useState(null) // 'correct' or 'wrong'
  const [sessions, setSessions] = useState([])
  const [gameStatus, setGameStatus] = useState('waiting') // 'waiting' or 'active'

  /**
   * FETCH GAME & QUESTIONS
   * Load initial data when component mounts
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get game info
        const { data: gameData } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single()

        setGame(gameData)

        // Get questions
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('game_id', gameId)
          .order('created_at', { ascending: true })

        setQuestions(questionsData || [])

        // Get all players for leaderboard
        const { data: sessionsData } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('game_id', gameId)
          .order('score', { ascending: false })

        setSessions(sessionsData || [])

        // Get current player's score
        const { data: mySession } = await supabase
          .from('game_sessions')
          .select('score')
          .eq('id', sessionId)
          .single()

        if (mySession) {
          setScore(mySession.score)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    /**
     * REAL-TIME SUBSCRIPTIONS
     * 
     * Subscribe to:
     * 1. New questions added (host moves to next question)
     * 2. Game session updates (when my score changes)
     * 3. Other player sessions (for leaderboard)
     */

    const questionsSubscription = supabase
      .channel(`questions:game_id=eq.${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          setQuestions((prev) => [...prev, payload.new])
          setGameStatus('active')
        }
      )
      .subscribe()

    const sessionSubscription = supabase
      .channel(`game_sessions:id=eq.${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          setScore(payload.new.score)
        }
      )
      .subscribe()

    const leaderboardSubscription = supabase
      .channel(`leaderboard:game_id=eq.${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          setSessions((prev) =>
            prev
              .map((s) => (s.id === payload.new.id ? payload.new : s))
              .sort((a, b) => b.score - a.score)
          )
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(questionsSubscription)
      supabase.removeChannel(sessionSubscription)
      supabase.removeChannel(leaderboardSubscription)
    }
  }, [gameId, sessionId])

  /**
   * HANDLE ANSWER SELECTION
   * 
   * When student clicks an answer:
   * 1. Check if it's correct
   * 2. Show feedback (green for correct, red for wrong)
   * 3. If correct, add points and update database
   * 4. Lock further answers until next question
   */
  const handleSelectAnswer = async (answer) => {
    if (answered || gameStatus !== 'active') return

    setSelectedAnswer(answer)
    const isCorrect = answer === currentQuestion?.correct_answer

    if (isCorrect) {
      setFeedback('correct')
      const newScore = score + (currentQuestion?.points || 100)

      // Update database with new score
      await supabase
        .from('game_sessions')
        .update({ score: newScore })
        .eq('id', sessionId)

      setScore(newScore)
    } else {
      setFeedback('wrong')
    }

    setAnswered(true)
  }

  /**
   * MOVE TO NEXT QUESTION
   */
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setAnswered(false)
      setSelectedAnswer(null)
      setFeedback(null)
    } else {
      alert('Quiz Complete! Well done! 🎉')
    }
  }

  if (loading) {
    return <div className="player-page loading">Loading quiz...</div>
  }

  const currentQuestion = questions[currentQuestionIndex]
  const shuffledAnswers = currentQuestion
    ? [
        currentQuestion.correct_answer,
        ...currentQuestion.incorrect_answers,
      ].sort(() => Math.random() - 0.5)
    : []

  return (
    <div className="player-page">
      {/* HEADER */}
      <div className="player-header">
        <button className="back-btn" onClick={onBack}>
          ← Exit
        </button>
        <h1>{game?.title || 'Quiz'}</h1>
        <div className="player-score">Score: {score}</div>
      </div>

      <div className="player-content">
        {/* MAIN QUIZ AREA */}
        <div className="quiz-area">
          {!currentQuestion ? (
            <div className="waiting-state">
              <div className="waiting-icon">⏳</div>
              <h2>Waiting for Quiz to Start...</h2>
              <p>Your host will start the quiz soon</p>
              <p className="player-name">Playing as: {playerName}</p>
            </div>
          ) : (
            <>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="question-section">
                <div className="question-counter">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <h2 className="question-text">{currentQuestion.question}</h2>
              </div>

              <div className="answers-grid">
                {shuffledAnswers.map((answer, idx) => {
                  const isSelected = selectedAnswer === answer
                  const isCorrect = answer === currentQuestion.correct_answer
                  let answerClass = 'answer-btn'

                  if (answered) {
                    if (isCorrect) {
                      answerClass += ' correct'
                    } else if (isSelected && !isCorrect) {
                      answerClass += ' wrong'
                    }
                  }

                  return (
                    <button
                      key={idx}
                      className={answerClass}
                      onClick={() => handleSelectAnswer(answer)}
                      disabled={answered}
                    >
                      <span className="answer-text">{answer}</span>
                      {answered && isCorrect && <span className="checkmark">✓</span>}
                      {answered && isSelected && !isCorrect && (
                        <span className="xmark">✗</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {answered && (
                <div className={`feedback ${feedback}`}>
                  {feedback === 'correct' ? (
                    <>
                      <span className="emoji">✨</span>
                      <span>Correct! +{currentQuestion.points} points</span>
                    </>
                  ) : (
                    <>
                      <span className="emoji">😅</span>
                      <span>Wrong. The answer was: {currentQuestion.correct_answer}</span>
                    </>
                  )}
                </div>
              )}

              {answered && (
                <button className="continue-btn" onClick={handleNextQuestion}>
                  {currentQuestionIndex < questions.length - 1
                    ? 'Next Question →'
                    : 'See Results'}
                </button>
              )}
            </>
          )}
        </div>

        {/* LEADERBOARD SIDEBAR */}
        <div className="leaderboard-sidebar">
          <h3>🏆 Leaderboard</h3>
          <div className="leaderboard-list">
            {sessions.slice(0, 5).map((session, idx) => {
              const isMe = session.id === sessionId
              return (
                <div
                  key={session.id}
                  className={`leaderboard-item ${isMe ? 'me' : ''}`}
                >
                  <span className="rank">#{idx + 1}</span>
                  <span className="player-name">{session.player_name}</span>
                  <span className="player-score">{session.score}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}