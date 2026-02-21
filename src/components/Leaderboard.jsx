import './Leaderboard.css'

/**
 * LEADERBOARD COMPONENT
 * 
 * Shows live rankings with:
 * - Player rank (1st, 2nd, 3rd, etc)
 * - Player name
 * - Score
 * - Medals for top 3
 * - Animations
 */

export default function Leaderboard({ sessions, title = "Live Leaderboard" }) {
  // Sort by score descending
  const sorted = [...(sessions || [])].sort((a, b) => (b.score || 0) - (a.score || 0))

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}️⃣`
  }

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">{title}</h2>

      {sorted.length === 0 ? (
        <div className="leaderboard-empty">
          <p>No players yet</p>
        </div>
      ) : (
        <div className="leaderboard-list">
          {sorted.map((session, index) => (
            <div 
              key={session.id} 
              className={`leaderboard-item rank-${index + 1}`}
            >
              <div className="leaderboard-rank">
                {getMedalEmoji(index + 1)}
              </div>

              <div className="leaderboard-player">
                <p className="player-name">{session.player_name}</p>
                <p className="player-rank">#{index + 1}</p>
              </div>

              <div className="leaderboard-score">
                <span className="score-label">Score</span>
                <span className="score-value">{session.score || 0}</span>
              </div>

              <div className="leaderboard-bar">
                <div 
                  className="score-bar"
                  style={{
                    width: `${Math.min((session.score || 0) / 10, 100)}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}