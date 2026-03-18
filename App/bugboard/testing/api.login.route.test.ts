import { expect, test } from 'vitest'
import { POST } from '../api/login/route'

//TESTING BACKEND LOGIN AUTOESPLICATIVO

test('Test login funzionante', async () => {
  let request = new Request('http://localhost/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'root@root', password: 'rootpwd' })
  })
  let response = await POST(request)
  try{
  expect(response.status).toBe(200)
  }catch(error){
    console.error('Errore durante il test login funzionante:', error)
  }
})


test('Test login no mail', async () => {
  let request = new Request('http://localhost/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', password: 'ciao' })
  })
  let response = await POST(request)
  try{
  expect(response.status).toBe(400)
  }catch(error){
    console.error('Errore durante il test login no mail:', error)
  }
})

test('Test login no password', async () => {
  let request = new Request('http://localhost/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'root@root', password: '' })
  })
  let response = await POST(request)
  try{
  expect(response.status).toBe(400)
  }catch(error){
    console.error('Errore durante il test login no password:', error)
  }
})

test('Test login credenziali errate', async () => {
  let request = new Request('http://localhost/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'root@root', password: 'wrongpwd' })
  })
  let response = await POST(request)
  try{
  expect(response.status).toBe(401)
  }catch(error){
    console.error('Errore durante il test login credenziali errate:', error)
  }
})

test('Test login no POST method', async () => {
  let request = new Request('http://localhost/api/login', {
    method: 'GET'
  })
  let response = await POST(request)
  try{
    expect(response.status).toBe(405)
  }catch(error){
    console.error('Errore durante il test login no POST method:', error)
  }
})

test('Test fail try catch', async () => {
  let request = new Request('http://localhost/api/login', {
    method: 'POST',

  })
  let response = await POST(request)
  try{
    expect(response.status).toBe(40)
  }catch(error){
    console.error('Errore durante il test fail try catch:', error)
  }
})