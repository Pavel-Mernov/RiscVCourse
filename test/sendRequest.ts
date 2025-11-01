
// Если версия Node.js < 18, сначала установите node-fetch:
// npm install node-fetch
// import fetch from 'node-fetch'; // для Node <18



export async function sendRequest(url : string, data : any, method : 'GET' | 'POST' = 'POST') {
  console.log('Data: ', data)

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    //.then(resp => resp.json());

    // console.log('response: ', response)

    if (!response.ok) {
      const errorText = await response.json().then(resp => resp.error);
      console.error('Ошибка:', response.status, errorText);
      return {
        error : errorText
       }
    }

    

    const result = 
      // response 
      await response.json();
    

    console.log('Output: ', result)
    
    return result

  } catch (error) {
    console.error('Ошибка при запросе:', error);
    return { error }
  }

  
}

