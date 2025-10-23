
// Если версия Node.js < 18, сначала установите node-fetch:
// npm install node-fetch
// import fetch from 'node-fetch'; // для Node <18



export async function sendRequest(url : string, data : any, method : 'GET' | 'POST') {
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    return result

  } catch (error) {
    console.error('Ошибка при запросе:', error);
    return { error }
  }

  
}

