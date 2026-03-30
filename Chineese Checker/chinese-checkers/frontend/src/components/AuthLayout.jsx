import React from 'react'
import './AuthLayout.css'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-container">
      <div className="auth-bg">
        <div className="auth-orb o1" />
        <div className="auth-orb o2" />
        <div className="auth-orb o3" />
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">⭐</div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
