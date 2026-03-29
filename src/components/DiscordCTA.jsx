import React from 'react'
import { FaDiscord } from 'react-icons/fa'

function DiscordCTA() {
  return (
    <>
      <h3>My Community</h3>
      <p>
        Meet Concord! For over 10 years, we've been playing, 
        working, and talking about life together.
      </p>
      <a 
        href="https://discord.nullcomma.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="button-secondary discord-button"
      >
        <FaDiscord />
        Join Discord
      </a>
    </>
  )
}

export default DiscordCTA