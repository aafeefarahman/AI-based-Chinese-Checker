import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import AuthLayout from '../components/AuthLayout'

export default function RegisterPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await axios.post('/api/auth/register', {
        username: form.username,
        password: form.password
      })
      // Auto-login after register
      const res = await axios.post('/api/auth/login', {
        username: form.username,
        password: form.password
      }, { withCredentials: true })
      onLogin(res.data)
      navigate('/menu')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join the game">
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}
        <div className="input-group">
          <span className="input-icon">👤</span>
          <input
            type="text"
            placeholder="Username (min 3 chars)"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div className="input-group">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder="Password (min 4 chars)"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <div className="input-group">
          <span className="input-icon">✅</span>
          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '...' : 'Register'}
        </button>
        <p className="auth-link">
          Have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
