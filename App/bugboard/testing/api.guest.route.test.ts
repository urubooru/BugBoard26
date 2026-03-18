import { expect, test } from 'vitest'
import { GET } from '../api/guest/route'

//TESTING BACKEND GUEST AUTOESPLICATIVO

test('Test guest funzionante', async () => {
  const testing = true;
  let response = await GET(testing);
  try{
    expect(response.status).toBe(200)
  }catch(error){
    console.error('Errore durante il test guest funzionante:', error)
  }
})