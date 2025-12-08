'use client'

export default function WelcomeHeader() {
  return (
    <div className="welcome-banner" style={{
      background: 'linear-gradient(135deg, #d4a574 0%, #b8956a 100%)',
      padding: '40px 20px',
      marginBottom: '30px',
      textAlign: 'center',
      borderRadius: '20px',
      border: '3px solid #8B6914',
      boxShadow: '0 8px 25px rgba(139, 105, 20, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#4A3728',
        marginBottom: '20px',
        letterSpacing: '2px'
      }}>WELCOME TO LANGUAGE ASSISTANT</h1>
      <p style={{
        fontSize: '1.2rem',
        color: '#5D4037',
        fontStyle: 'italic',
        marginBottom: '25px'
      }}>Privacy-Safe • Instant Translation • Voice Recognition</p>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.3)',
        padding: '10px 20px',
        borderRadius: '25px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#32CD32',
          borderRadius: '50%',
          marginRight: '10px'
        }}></div>
        <span style={{ color: '#4A3728', fontWeight: '500' }}>Ready to Translate</span>
      </div>
    </div>
  )
}