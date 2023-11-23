async function getCookies() {
  const response = await fetch(`${URL}:${PORT}/users/protected`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'httpOnly': true
    },
    credentials: "same-origin"

  })

  if (!response.ok) {
    console.error(`Error: ${response.status} - ${response.statusText}`);
    return;
  }
  
  const data = await response.json()

  return data
}

module.exports = { getCookies }