import { CONFIG } from '../config';

export const getGasUrl = () => {
  const localUrl = localStorage.getItem('gas_api_url');
  if (localUrl && localUrl.trim().startsWith('https://script.google.com/')) {
    return localUrl.trim();
  }
  if (CONFIG && CONFIG.GAS_API_URL && !CONFIG.GAS_API_URL.includes('ใส่_URL')) {
    return CONFIG.GAS_API_URL.trim();
  }
  return import.meta.env.VITE_GAS_URL || '';
};

export const setGasUrl = (url) => {
  if (url && url.trim()) {
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

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new Error("ไม่สามารถเชื่อมต่อ Google Apps Script ได้ (กรุณาตรวจสอบว่าตั้งค่า Web App Deploy: Execute as = Me และ Who has access = Anyone หรือ URL ถูกต้อง)");
      }
      throw new Error("ข้อมูลตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง: " + text.slice(0, 80));
    }

    if (!data.success) {
      if (action !== 'auth.login' && (data.error === 'Unauthorized' || (typeof data.error === 'string' && data.error.includes('Unauthorized')))) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token_expiry');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
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

