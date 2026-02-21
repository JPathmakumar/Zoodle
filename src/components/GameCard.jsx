import './GameCard.css'

/**
 * GAME CARD COMPONENT
 * 
 * Shows a game with:
 * - Game title
 * - Description
 * - Category
 * - Created date
 * - Question count
 * - Play button
 */

export default function GameCard({ game, onPlay }) {
  const questionsCount = game.questions?.length || 0
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      science: '🔬',
      history: '📚',
      math: '🔢',
      english: '📖',
      language: '🌍',
      other: '💡'
    }
    return emojis[category] || '🎮'
  }

  return (
    <div className="game-card">
      <div className="game-card-header">
        <h3 className="game-card-title">{game.title}</h3>
        <span className="game-category">
          {getCategoryEmoji(game.category)} {game.category || 'Other'}
        </span>
      </div>

      {game.description && (
        <p className="game-card-description">{game.description}</p>
      )}

      <div className="game-card-meta">
        <div className="meta-item">
          <span className="meta-icon">❓</span>
          <span className="meta-text">{questionsCount} questions</span>
        </div>
        <div className="meta-item">
          <span className="meta-icon">📅</span>
          <span className="meta-text">{formatDate(game.created_at)}</span>
        </div>
      </div>

      <button 
        className="game-card-btn"
        onClick={() => onPlay(game.id)}
      >
        🎮 Play Game
      </button>
    </div>
  )
}