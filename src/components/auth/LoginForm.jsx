import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import '../../styles/global.css'
import logo from '../../assets/logo/transitops-logo.svg'

export default function LoginForm(){
	const [email,setEmail] = useState('fleet@example.com')
	const [password,setPassword] = useState('password')
	const [remember,setRemember] = useState(true)
	const navigate = useNavigate()

	function handleSubmit(e){
		e.preventDefault()
		localStorage.setItem('transit_token','demo-token')
		navigate('/')
	}

	return (
		<div style={{padding:28}}>
			<div style={{display:'flex',justifyContent:'center',marginBottom:14}}>
				<img src={logo} alt="TransitOps" style={{height:44}} />
			</div>
			<form onSubmit={handleSubmit} style={{padding:20}}>
				<h2 style={{textAlign:'center',marginBottom:6}}>Sign in to TransitOps</h2>
				<div className="muted text-sm" style={{textAlign:'center',marginBottom:18}}>Enterprise transport operations platform</div>

				<div style={{marginBottom:12}}>
					<label className="text-sm muted">Email</label>
					<input className="search-input" value={email} onChange={e=>setEmail(e.target.value)} />
				</div>

				<div style={{marginBottom:6}}>
					<label className="text-sm muted">Password</label>
					<input className="search-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
				</div>

				<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
					<label style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} /> Remember me</label>
					<a className="muted" href="#">Forgot?</a>
				</div>

				<button className="btn" type="submit" style={{width:'100%',padding:12,fontSize:16}}>Sign in</button>

				<div style={{textAlign:'center',marginTop:12}} className="muted">Demo: fleet@example.com / password</div>
			</form>
		</div>
	)
}

