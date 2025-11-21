
// Если версия Node.js < 18, сначала установите node-fetch:
// npm install node-fetch
// import fetch from 'node-fetch'; // для Node <18



export async function sendRequest(url : string, data : any, method : 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST') {
  console.log('Url: ', method, ' ', url)

  console.log('Data: ', data)

  try {
    const response = await fetch(url, {
      method: method,
      headers: data ? {
        'Content-Type': 'application/json'
      } : {},
      body: data ? JSON.stringify(data) : undefined
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

    // console.log(response)

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

