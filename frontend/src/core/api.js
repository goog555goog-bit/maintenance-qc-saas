export const GAS_URL = 'YOUR_GAS_URL_HERE';

export async function apiCall(action, payload) {
  const token = localStorage.getItem('auth_token');
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload, token })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.result;
  } catch (err) {
    if (!navigator.onLine) {
      // offline fallback handling logic here
      throw new Error('Offline. Request queued.');
    }
    throw err;
  }
}
