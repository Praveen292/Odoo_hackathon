import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'

export default function LoginForm(){
	const [email,setEmail] = useState('fleet@example.com')
	const [password,setPassword] = useState('password')
	const navigate = useNavigate()

	function handleSubmit(e){
		e.preventDefault()
		// demo: accept any credentials, store demo token
		localStorage.setItem('transit_token','demo-token')
		navigate('/')
	}

	return (
		<form onSubmit={handleSubmit} style={{padding:24}}>
			<h2 style={{marginBottom:6}}>Sign in to TransitOps</h2>
			<div className="muted text-sm" style={{marginBottom:12}}>Enterprise transport operations platform</div>
			<div style={{marginBottom:12}}>
				<label className="text-sm muted">Email</label>
				<input className="search-input" value={email} onChange={e=>setEmail(e.target.value)} />
			</div>
			<div style={{marginBottom:12}}>
				<label className="text-sm muted">Password</label>
				<input className="search-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
			</div>
			<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:6}}>
				<button className="btn" type="submit">Sign in</button>
				<div className="muted text-sm">Demo: fleet@example.com</div>
			</div>
		</form>
	)
}

