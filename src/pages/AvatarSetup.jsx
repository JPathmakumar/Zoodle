import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './AvatarSetup.css'

/**
 * AVATAR SETUP PAGE
 * 
 * Shows AFTER user completes signup/login
 * User picks their avatar before entering the app
 */

const AVATAR_CATEGORIES = {
  people: {
    name: '👥 People',
    emoji: '👥',
    avatars: [
      { id: 1, emoji: '👨', name: 'Boy', desc: 'Cool dude' },
      { id: 2, emoji: '👩', name: 'Girl', desc: 'Smart girl' },
      { id: 3, emoji: '🧑', name: 'Person', desc: 'Friendly' },
      { id: 4, emoji: '👨‍🎓', name: 'Student', desc: 'Bookworm' },
      { id: 5, emoji: '👨‍🏫', name: 'Teacher', desc: 'Wise mentor' },
      { id: 6, emoji: '👨‍💼', name: 'Business', desc: 'Professional' },
      { id: 7, emoji: '👨‍🎨', name: 'Artist', desc: 'Creative' },
      { id: 8, emoji: '👨‍🚀', name: 'Astronaut', desc: 'Explorer' },
      { id: 9, emoji: '👨‍⚕️', name: 'Doctor', desc: 'Healthcare' },
      { id: 10, emoji: '👨‍🍳', name: 'Chef', desc: 'Master cook' },
      { id: 11, emoji: '👨‍🔬', name: 'Scientist', desc: 'Genius' },
      { id: 12, emoji: '👨‍🎸', name: 'Musician', desc: 'Rockstar' },
    ]
  },
  fantasy: {
    name: '✨ Fantasy',
    emoji: '✨',
    avatars: [
      { id: 13, emoji: '🧙', name: 'Wizard', desc: 'Magic master' },
      { id: 14, emoji: '🧝', name: 'Elf', desc: 'Forest elf' },
      { id: 15, emoji: '🧌', name: 'Ogre', desc: 'Gentle giant' },
      { id: 16, emoji: '👹', name: 'Demon', desc: 'Mischievous' },
      { id: 17, emoji: '🧛', name: 'Vampire', desc: 'Night creature' },
      { id: 18, emoji: '🧟', name: 'Zombie', desc: 'Undead buddy' },
      { id: 19, emoji: '⚔️', name: 'Knight', desc: 'Brave warrior' },
      { id: 20, emoji: '🤴', name: 'Prince', desc: 'Royal' },
      { id: 21, emoji: '👸', name: 'Princess', desc: 'Elegant' },
      { id: 22, emoji: '🎩', name: 'Magician', desc: 'Mysterious' },
      { id: 23, emoji: '🏴‍☠️', name: 'Pirate', desc: 'Adventure' },
      { id: 24, emoji: '🦸', name: 'Superhero', desc: 'Powerful' },
    ]
  },
  animals: {
    name: '🐾 Animals',
    emoji: '🐾',
    avatars: [
      { id: 25, emoji: '🐱', name: 'Cat', desc: 'Curious kitty' },
      { id: 26, emoji: '🐶', name: 'Dog', desc: 'Loyal puppy' },
      { id: 27, emoji: '🦊', name: 'Fox', desc: 'Clever fox' },
      { id: 28, emoji: '🐻', name: 'Bear', desc: 'Gentle bear' },
      { id: 29, emoji: '🦁', name: 'Lion', desc: 'Majestic king' },
      { id: 30, emoji: '🐯', name: 'Tiger', desc: 'Fierce tiger' },
      { id: 31, emoji: '🐼', name: 'Panda', desc: 'Cute panda' },
      { id: 32, emoji: '🦝', name: 'Raccoon', desc: 'Sneaky bandit' },
      { id: 33, emoji: '🐸', name: 'Frog', desc: 'Jumpy friend' },
      { id: 34, emoji: '🦆', name: 'Duck', desc: 'Quacky duck' },
      { id: 35, emoji: '🦉', name: 'Owl', desc: 'Wise owl' },
      { id: 36, emoji: '🦄', name: 'Unicorn', desc: 'Magical' },
    ]
  },
  space: {
    name: '🚀 Space',
    emoji: '🚀',
    avatars: [
      { id: 37, emoji: '🚀', name: 'Rocket', desc: 'To the moon' },
      { id: 38, emoji: '🛸', name: 'UFO', desc: 'Alien visitor' },
      { id: 39, emoji: '⭐', name: 'Star', desc: 'Shining bright' },
      { id: 40, emoji: '🌙', name: 'Moon', desc: 'Nighttime glow' },
      { id: 41, emoji: '☄️', name: 'Meteor', desc: 'Space rock' },
      { id: 42, emoji: '🪐', name: 'Saturn', desc: 'Gas giant' },
      { id: 43, emoji: '🌟', name: 'Glowing Star', desc: 'Super bright' },
      { id: 44, emoji: '🌌', name: 'Galaxy', desc: 'Universe' },
      { id: 45, emoji: '👽', name: 'Alien', desc: 'E.T.' },
      { id: 46, emoji: '🛰️', name: 'Satellite', desc: 'Tech' },
      { id: 47, emoji: '🌠', name: 'Shooting Star', desc: 'Wish' },
      { id: 48, emoji: '🔭', name: 'Telescope', desc: 'Discovery' },
    ]
  },
  nature: {
    name: '🌿 Nature',
    emoji: '🌿',
    avatars: [
      { id: 49, emoji: '🌳', name: 'Tree', desc: 'Forest friend' },
      { id: 50, emoji: '🌺', name: 'Flower', desc: 'Pretty bloom' },
      { id: 51, emoji: '🌻', name: 'Sunflower', desc: 'Golden sun' },
      { id: 52, emoji: '🌹', name: 'Rose', desc: 'Love symbol' },
      { id: 53, emoji: '🍄', name: 'Mushroom', desc: 'Magic fungi' },
      { id: 54, emoji: '🌲', name: 'Pine', desc: 'Evergreen' },
      { id: 55, emoji: '🎄', name: 'Christmas', desc: 'Holiday' },
      { id: 56, emoji: '🌴', name: 'Palm', desc: 'Tropical' },
      { id: 57, emoji: '🌵', name: 'Cactus', desc: 'Desert' },
      { id: 58, emoji: '🌾', name: 'Wheat', desc: 'Golden' },
      { id: 59, emoji: '🌿', name: 'Leaf', desc: 'Green' },
      { id: 60, emoji: '☘️', name: 'Clover', desc: 'Lucky' },
    ]
  },
  tech: {
    name: '🤖 Tech',
    emoji: '🤖',
    avatars: [
      { id: 61, emoji: '🤖', name: 'Robot', desc: 'AI friend' },
      { id: 62, emoji: '👾', name: 'Alien', desc: 'Pixel art' },
      { id: 63, emoji: '💻', name: 'Computer', desc: 'Tech' },
      { id: 64, emoji: '🖥️', name: 'Desktop', desc: 'Powerful' },
      { id: 65, emoji: '⌨️', name: 'Keyboard', desc: 'Typing' },
      { id: 66, emoji: '🖱️', name: 'Mouse', desc: 'Click' },
      { id: 67, emoji: '📱', name: 'Phone', desc: 'Mobile' },
      { id: 68, emoji: '📟', name: 'Pager', desc: 'Retro' },
      { id: 69, emoji: '⚡', name: 'Lightning', desc: 'Fast' },
      { id: 70, emoji: '🔋', name: 'Battery', desc: 'Power' },
      { id: 71, emoji: '🔌', name: 'Plug', desc: 'Connected' },
      { id: 72, emoji: '📡', name: 'Satellite', desc: 'Signal' },
    ]
  },
  creative: {
    name: '🎨 Creative',
    emoji: '🎨',
    avatars: [
      { id: 73, emoji: '🎨', name: 'Paint', desc: 'Artistic' },
      { id: 74, emoji: '🎭', name: 'Theatre', desc: 'Dramatic' },
      { id: 75, emoji: '🎪', name: 'Circus', desc: 'Funtime' },
      { id: 76, emoji: '🎸', name: 'Guitar', desc: 'Musician' },
      { id: 77, emoji: '🎹', name: 'Piano', desc: 'Classical' },
      { id: 78, emoji: '🎺', name: 'Trumpet', desc: 'Jazz' },
      { id: 79, emoji: '🎻', name: 'Violin', desc: 'Elegant' },
      { id: 80, emoji: '🥁', name: 'Drums', desc: 'Rhythm' },
      { id: 81, emoji: '🎬', name: 'Camera', desc: 'Filmmaker' },
      { id: 82, emoji: '🎥', name: 'Video', desc: 'Creator' },
      { id: 83, emoji: '📷', name: 'Photo', desc: 'Photographer' },
      { id: 84, emoji: '🎞️', name: 'Film', desc: 'Cinema' },
    ]
  },
  games: {
    name: '🎮 Games',
    emoji: '🎮',
    avatars: [
      { id: 85, emoji: '🎮', name: 'Game', desc: 'Gamer' },
      { id: 86, emoji: '🎯', name: 'Target', desc: 'Focused' },
      { id: 87, emoji: '🎲', name: 'Dice', desc: 'Lucky' },
      { id: 88, emoji: '🃏', name: 'Card', desc: 'Strategic' },
      { id: 89, emoji: '🏆', name: 'Trophy', desc: 'Champion' },
      { id: 90, emoji: '🥇', name: 'Gold Medal', desc: 'Winner' },
      { id: 91, emoji: '⚽', name: 'Soccer', desc: 'Athlete' },
      { id: 92, emoji: '🏀', name: 'Basketball', desc: 'Sporty' },
      { id: 93, emoji: '🎳', name: 'Bowling', desc: 'Strike' },
      { id: 94, emoji: '🏐', name: 'Volleyball', desc: 'Team' },
      { id: 95, emoji: '⛳', name: 'Golf', desc: 'Precision' },
      { id: 96, emoji: '🎿', name: 'Skiing', desc: 'Adventure' },
    ]
  }
}

const ALL_AVATARS = Object.values(AVATAR_CATEGORIES)
  .flatMap(cat => cat.avatars)

export default function AvatarSetup({ onComplete }) {
  const { user, userProfile } = useAuth()
  const [selectedAvatar, setSelectedAvatar] = useState(ALL_AVATARS[0])
  const [selectedCategory, setSelectedCategory] = useState('people')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)

  // If user already has avatar, skip
  if (userProfile?.avatar) {
    if (onComplete) {
      onComplete()
    }
    return null
  }

  const handleSelectAvatar = (avatar) => {
    setSelectedAvatar(avatar)
    playSound()
  }

  const handleToggleFavorite = (avatar) => {
    if (favorites.find(fav => fav.id === avatar.id)) {
      setFavorites(favorites.filter(fav => fav.id !== avatar.id))
    } else {
      setFavorites([...favorites, avatar])
    }
  }

  const playSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()
      osc.connect(gain)
      gain.connect(audioContext.destination)
      osc.frequency.value = 800
      gain.gain.setValueAtTime(0.3, audioContext.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      osc.start(audioContext.currentTime)
      osc.stop(audioContext.currentTime + 0.1)
    } catch (err) {
      // Silent fail
    }
  }

  const triggerConfetti = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1200)
  }

  const handleContinue = async () => {
    if (!user || !selectedAvatar) {
      setError('Please select an avatar')
      return
    }

    setLoading(true)
    setError(null)
    triggerConfetti()

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          avatar: selectedAvatar.emoji,
          avatar_name: selectedAvatar.name
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setTimeout(() => {
        if (onComplete) {
          onComplete()
        } else {
          window.location.href = '/'
        }
      }, 800)
    } catch (err) {
      console.error('Avatar save error:', err)
      setError('Failed to save avatar. Try again.')
      setLoading(false)
    }
  }

  const currentCategoryAvatars = AVATAR_CATEGORIES[selectedCategory].avatars

  return (
    <div className="avatar-ultimate-page">
      {/* CONFETTI */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti-piece"></div>
          ))}
        </div>
      )}

      <div className="avatar-ultimate-container">
        {/* HEADER */}
        <div className="avatar-ultimate-header">
          <div className="header-badge">Welcome!</div>
          <h1>🎮 Zoodle</h1>
          <h2>Choose Your Avatar</h2>
          <p>Pick the perfect character to represent you!</p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="avatar-error-msg">
            <span>❌</span>
            {error}
          </div>
        )}

        {/* CATEGORIES */}
        <div className="avatar-categories-scroll">
          {Object.entries(AVATAR_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              className={`category-tab ${selectedCategory === key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(key)}
            >
              <span className="cat-emoji">{category.emoji}</span>
              <span className="cat-name">{category.name}</span>
            </button>
          ))}
        </div>

        {/* AVATAR GRID */}
        <div className="avatar-grid-ultimate">
          {currentCategoryAvatars.map((avatar) => {
            const isFavorited = favorites.find(fav => fav.id === avatar.id)
            const isSelected = selectedAvatar.id === avatar.id

            return (
              <div
                key={avatar.id}
                className={`avatar-card-premium ${isSelected ? 'selected' : ''}`}
              >
                <button
                  className="avatar-btn-premium"
                  onClick={() => handleSelectAvatar(avatar)}
                  disabled={loading}
                  title={avatar.name}
                >
                  <div className="avatar-emoji-xl">{avatar.emoji}</div>
                  <div className="avatar-info-card">
                    <p className="avatar-name-card">{avatar.name}</p>
                    <p className="avatar-desc-card">{avatar.desc}</p>
                  </div>
                </button>

                <button
                  className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                  onClick={() => handleToggleFavorite(avatar)}
                  title={isFavorited ? 'Remove' : 'Add'}
                >
                  {isFavorited ? '❤️' : '🤍'}
                </button>
              </div>
            )
          })}
        </div>

        {/* PREVIEW */}
        <div className="avatar-preview-premium">
          <div className="preview-circle">
            <div className="preview-emoji-huge">{selectedAvatar.emoji}</div>
          </div>
          <div className="preview-info">
            <h3>{selectedAvatar.name}</h3>
            <p>{selectedAvatar.desc}</p>
            <div className="preview-stats">
              <div className="stat-box">
                <span className="stat-icon">❤️</span>
                <span>{favorites.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="continue-btn-ultimate"
        >
          {loading ? (
            <>
              <span className="spinner-ultimate"></span>
              Entering Zoodle...
            </>
          ) : (
            <>✨ Continue to Zoodle</>
          )}
        </button>

        {/* FOOTER */}
        <p className="avatar-footer">
          💡 Change your avatar anytime in settings
        </p>
      </div>
    </div>
  )
}