import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import AuthLayout from '../components/AuthLayout'

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', form, { withCredentials: true })
      onLogin(res.data)
      navigate('/menu')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to play">
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}
        <div className="input-group">
          <span className="input-icon">👤</span>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div className="input-group">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '...' : 'Login'}
        </button>
        <p className="auth-link">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
