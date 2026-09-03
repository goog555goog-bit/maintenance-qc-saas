/**
 * Telegram Mini App (TMA) Helper Utilities
 */
import { apiCall } from './api';

export function getTelegramWebApp() {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function isTelegramWebApp() {
  const tg = getTelegramWebApp();
  return Boolean(tg && tg.initData);
}

export function getTelegramUser() {
  const tg = getTelegramWebApp();
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    return tg.initDataUnsafe.user;
  }
  return null;
}

export function initTelegramApp() {
  const tg = getTelegramWebApp();
  if (!tg) return;

  try {
    tg.ready();
    tg.expand();
    
    // Set header color to match app slate theme
    if (tg.setHeaderColor) {
      tg.setHeaderColor('#0f172a');
    }
    if (tg.setBackgroundColor) {
      tg.setBackgroundColor('#f8fafc');
    }

    // Enable closing confirmation to prevent accidental swipes
    if (tg.enableClosingConfirmation) {
      tg.enableClosingConfirmation();
    }
  } catch (err) {
    console.warn('Telegram WebApp init error:', err);
  }
}

/**
 * Automatically binds the Telegram User ID to the current authenticated user session if in TMA
 */
export async function autoBindTelegramIfInMiniApp() {
  if (!isTelegramWebApp()) return;

  const tgUser = getTelegramUser();
  if (!tgUser || !tgUser.id) return;

  try {
    const boundKey = 'tg_bound_' + tgUser.id;
    if (sessionStorage.getItem(boundKey)) return;

    await apiCall('telegram.bind', {
      telegram_chat_id: String(tgUser.id),
      username: tgUser.username || '',
      first_name: tgUser.first_name || '',
      last_name: tgUser.last_name || ''
    });

    sessionStorage.setItem(boundKey, 'true');
  } catch (e) {
    console.warn('Auto-bind telegram skipped or error:', e.message);
  }
}
