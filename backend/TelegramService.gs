/**
 * Telegram Service: Mini App Integration, Webhook Handling, and Personal Notifications
 */
const TelegramService = {
  getBotToken: function() {
    const db = Database.getInstance();
    const configs = db.query('System_Config', { key: 'TELEGRAM_BOT_TOKEN' });
    if (configs.length > 0 && configs[0].value) {
      return String(configs[0].value).trim();
    }
    const propToken = PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN');
    return propToken ? String(propToken).trim() : '';
  },

  setBotToken: function(token, userContext) {
    if (userContext && userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Only Admin can set Telegram Bot Token");
    }
    const db = Database.getInstance();
    const cleanToken = String(token || '').trim();
    const existing = db.query('System_Config', { key: 'TELEGRAM_BOT_TOKEN' });
    if (existing.length > 0) {
      db.update('System_Config', 'key', 'TELEGRAM_BOT_TOKEN', {
        value: cleanToken,
        updated_at: new Date().toISOString(),
        updated_by: userContext ? userContext.user_id : 'ADMIN'
      });
    } else {
      db.insert('System_Config', {
        key: 'TELEGRAM_BOT_TOKEN',
        value: cleanToken,
        updated_at: new Date().toISOString(),
        updated_by: userContext ? userContext.user_id : 'ADMIN'
      });
    }
    PropertiesService.getScriptProperties().setProperty('TELEGRAM_BOT_TOKEN', cleanToken);
    return { success: true };
  },

  getMiniAppUrl: function() {
    const db = Database.getInstance();
    const configs = db.query('System_Config', { key: 'MINI_APP_URL' });
    if (configs.length > 0 && configs[0].value) {
      return String(configs[0].value).trim();
    }
    return 'https://maintenance-qc-saas.goog555goog.workers.dev';
  },

  callApi: function(method, payload) {
    const token = this.getBotToken();
    if (!token) {
      return { ok: false, description: 'Telegram Bot Token not configured' };
    }
    const url = 'https://api.telegram.org/bot' + token + '/' + method;
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload || {}),
      muteHttpExceptions: true
    };
    try {
      const response = UrlFetchApp.fetch(url, options);
      const code = response.getResponseCode();
      const content = response.getContentText();
      const json = JSON.parse(content);
      return json;
    } catch (err) {
      console.warn('Telegram API fetch error for ' + method + ': ' + err.message);
      return { ok: false, description: err.message };
    }
  },

  getMe: function() {
    return this.callApi('getMe', {});
  },

  setWebhook: function(webhookUrl) {
    const cleanUrl = String(webhookUrl || '').trim();
    return this.callApi('setWebhook', { url: cleanUrl });
  },

  setChatMenuButton: function(chatId, webAppUrl, buttonText) {
    const targetUrl = webAppUrl || this.getMiniAppUrl();
    const label = buttonText || 'เปิดระบบซ่อมบำรุง';
    const payload = {
      menu_button: {
        type: 'web_app',
        text: label,
        web_app: { url: targetUrl }
      }
    };
    if (chatId) {
      payload.chat_id = chatId;
    }
    return this.callApi('setChatMenuButton', payload);
  },

  sendMessage: function(chatId, text, replyMarkup) {
    if (!chatId) return { ok: false, description: 'No chatId provided' };
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    return this.callApi('sendMessage', payload);
  },

  handleWebhook: function(update) {
    if (!update) return { status: 'NO_UPDATE' };
    const message = update.message;
    if (!message) return { status: 'NO_MESSAGE' };

    const chatId = message.chat ? message.chat.id : null;
    const fromUser = message.from || {};
    const text = String(message.text || '').trim();

    if (!chatId) return { status: 'NO_CHAT_ID' };

    const db = Database.getInstance();
    const now = new Date().toISOString();

    // Check if user exists in Telegram_Users sheet
    const existing = db.query('Telegram_Users', { telegram_chat_id: String(chatId) });
    let linkedUserId = '';

    // Check if start command has deep link parameter: e.g. /start bind_EMP-0001
    if (text.indexOf('/start') === 0) {
      const parts = text.split(' ');
      if (parts.length > 1 && parts[1].indexOf('bind_') === 0) {
        linkedUserId = parts[1].replace('bind_', '').trim();
      }
    }

    if (existing.length === 0) {
      db.insert('Telegram_Users', {
        telegram_chat_id: String(chatId),
        username: fromUser.username || '',
        first_name: fromUser.first_name || '',
        last_name: fromUser.last_name || '',
        user_id: linkedUserId,
        created_at: now,
        updated_at: now
      });
    } else {
      const updates = {
        username: fromUser.username || existing[0].username || '',
        first_name: fromUser.first_name || existing[0].first_name || '',
        last_name: fromUser.last_name || existing[0].last_name || '',
        updated_at: now
      };
      if (linkedUserId) {
        updates.user_id = linkedUserId;
      }
      db.update('Telegram_Users', 'telegram_chat_id', String(chatId), updates);
    }

    // If bound to a user_id, also update Users table
    if (linkedUserId) {
      try {
        db.update('Users', 'user_id', linkedUserId, { telegram_chat_id: String(chatId) });
      } catch (e) {
        console.warn('Could not update user telegram_chat_id: ' + e.message);
      }
    }

    // Automatically set the persistent Chat Menu Button to Open Web App
    const miniAppUrl = this.getMiniAppUrl();
    this.setChatMenuButton(chatId, miniAppUrl, 'เปิดระบบซ่อมบำรุง');

    // Build welcome response message
    if (text.indexOf('/start') === 0) {
      let welcomeMsg = '<b>ยินดีต้อนรับสู่ระบบบริหารงานซ่อมบำรุง (Maintenance QC SaaS)</b>\n\n';
      welcomeMsg += 'ท่านได้เชื่อมต่อกับระบบเรียบร้อยแล้ว\n';
      if (linkedUserId) {
        welcomeMsg += 'ผูกบัญชีผู้ใช้รหัส: <code>' + linkedUserId + '</code> สำเร็จ\n';
      }
      welcomeMsg += '\nระบบได้เปลี่ยนปุ่มแถบล่างเป็น <b>"เปิดระบบซ่อมบำรุง"</b> ให้เรียบร้อยแล้ว หรือสามารถแตะปุ่มด้านล่างนี้เพื่อเปิดใช้งานได้ทันที';

      const replyMarkup = {
        inline_keyboard: [
          [
            {
              text: 'เปิดระบบซ่อมบำรุง (Open App)',
              web_app: { url: miniAppUrl }
            }
          ]
        ]
      };

      this.sendMessage(chatId, welcomeMsg, replyMarkup);
    }

    return { status: 'SUCCESS', chat_id: chatId };
  },

  bindUserTelegram: function(payload, userContext) {
    if (!userContext || !userContext.user_id) {
      throw new Error("Authentication required");
    }
    Validation.requireFields(payload, ['telegram_chat_id']);
    const chatId = String(payload.telegram_chat_id).trim();
    const userId = String(userContext.user_id).trim();
    const db = Database.getInstance();
    const now = new Date().toISOString();

    // Update Users table
    db.update('Users', 'user_id', userId, { telegram_chat_id: chatId });

    // Update or insert in Telegram_Users table
    const existing = db.query('Telegram_Users', { telegram_chat_id: chatId });
    if (existing.length > 0) {
      db.update('Telegram_Users', 'telegram_chat_id', chatId, {
        user_id: userId,
        username: payload.username || existing[0].username || '',
        first_name: payload.first_name || existing[0].first_name || '',
        updated_at: now
      });
    } else {
      db.insert('Telegram_Users', {
        telegram_chat_id: chatId,
        username: payload.username || '',
        first_name: payload.first_name || '',
        last_name: payload.last_name || '',
        user_id: userId,
        created_at: now,
        updated_at: now
      });
    }

    // Set menu button for this user
    this.setChatMenuButton(chatId, this.getMiniAppUrl(), 'เปิดระบบซ่อมบำรุง');

    // Send confirmation message to user's Telegram
    const confirmText = '<b>เชื่อมต่อบัญชีสำเร็จ</b>\n\nบัญชีผู้ใช้ <code>' + userId + '</code> ได้รับการผูกเข้ากับ Telegram นี้เรียบร้อยแล้ว ท่านจะได้รับการแจ้งเตือนงานซ่อมและสถานะใบงานผ่านช่องทางนี้โดยตรง';
    this.sendMessage(chatId, confirmText, {
      inline_keyboard: [
        [{ text: 'เข้าสู่ระบบ (Open App)', web_app: { url: this.getMiniAppUrl() } }]
      ]
    });

    return { success: true, telegram_chat_id: chatId };
  },

  unbindUserTelegram: function(payload, userContext) {
    if (!userContext || !userContext.user_id) {
      throw new Error("Authentication required");
    }
    const userId = String(userContext.user_id).trim();
    const db = Database.getInstance();
    db.update('Users', 'user_id', userId, { telegram_chat_id: '' });
    return { success: true };
  },

  getUserTelegramStatus: function(payload, userContext) {
    if (!userContext || !userContext.user_id) {
      throw new Error("Authentication required");
    }
    const userId = String(userContext.user_id).trim();
    const db = Database.getInstance();
    const users = db.query('Users', { user_id: userId });
    const user = users[0] || {};
    const chatId = user.telegram_chat_id ? String(user.telegram_chat_id).trim() : '';

    let tgUser = null;
    if (chatId) {
      const tgList = db.query('Telegram_Users', { telegram_chat_id: chatId });
      if (tgList.length > 0) {
        tgUser = tgList[0];
      }
    }

    return {
      is_bound: Boolean(chatId),
      telegram_chat_id: chatId,
      telegram_username: tgUser ? tgUser.username : '',
      telegram_first_name: tgUser ? tgUser.first_name : ''
    };
  }
};
