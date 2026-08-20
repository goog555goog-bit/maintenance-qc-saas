export const getGasUrl = () => {
  return import.meta.env.VITE_GAS_URL || localStorage.getItem('gas_api_url') || '';
};

export const setGasUrl = (url) => {
  if (url) {
    localStorage.setItem('gas_api_url', url.trim());
  } else {
    localStorage.removeItem('gas_api_url');
  }
};

export async function apiCall(action, payload = {}) {
  const token = localStorage.getItem('auth_token');
  const gasUrl = getGasUrl();

  if (!gasUrl) {
    throw new Error("ยังไม่ได้กำหนด Google Apps Script Web App URL");
  }

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload, token })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }
    return data.data;
  } catch (err) {
    if (!navigator.onLine) {
      throw new Error('ระบบอยู่ในสถานะ Offline คำขอถูกบันทึกลงคิวชั่วคราว');
    }
    throw err;
  }
}

