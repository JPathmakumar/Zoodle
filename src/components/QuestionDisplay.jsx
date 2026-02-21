import { useState } from 'react'
import './QuestionDisplay.css'

/**
 * QUESTION DISPLAY COMPONENT
 * 
 * Shows:
 * - Question text
 * - Progress bar
 * - 4 answer options
 * - Selection feedback
 * - Timer (optional)
 */

export default function QuestionDisplay({ 
  question, 
  questionNumber, 
  totalQuestions,
  onSelectAnswer,
  selectedAnswer,
  showResult,
  isCorrect
}) {
  const [hoveredOption, setHoveredOption] = useState(null)

  if (!question) {
    return (
      <div className="question-display loading">
        <p>Loading question...</p>
      </div>
    )
  }

  // Shuffle answers but keep correct one in place
  const allAnswers = [
    question.correct_answer,
    ...(question.incorrect_answers || [])
  ]

  const shuffled = allAnswers.sort(() => Math.random() - 0.5)

  const progressPercent = (questionNumber / totalQuestions) * 100

  return (
    <div className="question-display">
      {/* PROGRESS BAR */}
      <div className="question-progress">
        <div className="progress-info">
          <span>Question {questionNumber} of {totalQuestions}</span>
          <span>{progressPercent.toFixed(0)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* QUESTION TEXT */}
      <div className="question-text">
        <h2>{question.question}</h2>
      </div>

      {/* ANSWER OPTIONS */}
      <div className="answer-options">
        {shuffled.map((answer, index) => {
          const isSelected = selectedAnswer === answer
          const isCorrectAnswer = answer === question.correct_answer
          
          let buttonClass = 'answer-btn'
          
          if (showResult) {
            if (isCorrectAnswer) {
              buttonClass += ' correct'
            } else if (isSelected && !isCorrect) {
              buttonClass += ' incorrect'
            }
          }
          
          if (isSelected) {
            buttonClass += ' selected'
          }
          
          if (hoveredOption === index && !showResult) {
            buttonClass += ' hovered'
          }

          return (
            <button
              key={index}
              className={buttonClass}
              onClick={() => onSelectAnswer(answer)}
              onMouseEnter={() => setHoveredOption(index)}
              onMouseLeave={() => setHoveredOption(null)}
              disabled={showResult}
            >
              <span className="answer-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="answer-text">{answer}</span>
              {showResult && isCorrectAnswer && (
                <span className="answer-icon">✓</span>
              )}
              {showResult && isSelected && !isCorrect && (
                <span className="answer-icon">✗</span>
              )}
            </button>
          )
        })}
      </div>

      {/* FEEDBACK */}
      {showResult && (
        <div className={`question-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? (
            <>
              <span className="feedback-icon">🎉</span>
              <span className="feedback-text">Correct!</span>
            </>
          ) : (
            <>
              <span className="feedback-icon">❌</span>
              <span className="feedback-text">Wrong answer</span>
            </>
          )}
        </div>
      )}

      {/* ANSWER HINT */}
      {!showResult && (
        <p className="question-hint">Choose an answer to continue</p>
      )}
    </div>
  )
}