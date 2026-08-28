/**
 * Master Spare Parts & Ticket Spare Parts Management
 */
const SparePartService = {
  getDefaultParts: function() {
    return [
      { part_id: 'PRT-1001', part_code: 'BRG-6204', part_name: 'ชุดลูกปืนตลับ High Speed (6204-2RS)', category: 'ระบบมอเตอร์/เครื่องกล', unit: 'ชุด', unit_price: 450.00, status: 'ACTIVE' },
      { part_id: 'PRT-1002', part_code: 'CAP-45UF', part_name: 'คาปาซิเตอร์รัน 45uF 450V (AC Run Capacitor)', category: 'ระบบปรับอากาศ', unit: 'ตัว', unit_price: 380.00, status: 'ACTIVE' },
      { part_id: 'PRT-1003', part_code: 'SEAL-SYN-01', part_name: 'น้ำยาหล่อลื่นและซีลกันซึมสังเคราะห์ (High Temp Sealant)', category: 'งานบำรุงรักษาทั่วไป', unit: 'หลอด', unit_price: 320.00, status: 'ACTIVE' },
      { part_id: 'PRT-1004', part_code: 'BLT-A38', part_name: 'สายพานมอเตอร์ส่งกำลัง V-Belt A-38', category: 'ระบบมอเตอร์/เครื่องกล', unit: 'เส้น', unit_price: 260.00, status: 'ACTIVE' },
      { part_id: 'PRT-1005', part_code: 'VLV-BALL-01', part_name: 'บอลวาล์วทองเหลือง 1/2 นิ้ว (Brass Ball Valve)', category: 'ระบบประปา/สุขาภิบาล', unit: 'ตัว', unit_price: 290.00, status: 'ACTIVE' },
      { part_id: 'PRT-1006', part_code: 'MCB-20A', part_name: 'เบรกเกอร์ลูกย่อย 1P 20A (Miniature Circuit Breaker)', category: 'ระบบไฟฟ้า', unit: 'ตัว', unit_price: 180.00, status: 'ACTIVE' },
      { part_id: 'PRT-1007', part_code: 'FILT-AC-02', part_name: 'แผ่นกรองอากาศดักฝุ่นความละเอียดสูง (Air Filter)', category: 'ระบบปรับอากาศ', unit: 'ชุด', unit_price: 350.00, status: 'ACTIVE' },
      { part_id: 'PRT-1008', part_code: 'LED-T8-18W', part_name: 'หลอดไฟ LED T8 18W แสงขาว Daylight', category: 'ระบบไฟฟ้า/แสงสว่าง', unit: 'หลอด', unit_price: 120.00, status: 'ACTIVE' }
    ];
  },

  listSpareParts: function(payload, userContext) {
    const db = Database.getInstance();
    let parts = db.query('Spare_Parts');
    
    // Seed default parts if table is empty
    if (parts.length === 0) {
      const defaults = this.getDefaultParts();
      defaults.forEach(function(p) {
        p.created_at = new Date().toISOString();
        db.insert('Spare_Parts', p);
      });
      parts = db.query('Spare_Parts');
    }
    
    return parts.filter(function(p) {
      return !payload.active_only || String(p.status).toUpperCase() === 'ACTIVE';
    });
  },

  createSparePart: function(payload, userContext) {
    if (userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Only Admin can add spare parts");
    }
    Validation.requireFields(payload, ['part_name', 'unit_price']);
    
    const db = Database.getInstance();
    const partId = 'PRT-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    const row = {
      part_id: partId,
      part_code: Security.sanitizeString(payload.part_code || partId),
      part_name: Security.sanitizeString(payload.part_name),
      category: Security.sanitizeString(payload.category || 'อะไหล่ทั่วไป'),
      unit: Security.sanitizeString(payload.unit || 'ชิ้น'),
      unit_price: Number(payload.unit_price) || 0,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      created_by: userContext.user_id
    };
    
    db.insert('Spare_Parts', row);
    AuditService.logActivity(userContext.user_id, 'ADMIN', 'CREATE_SPARE_PART', 'Spare_Parts', partId, null, row, 'เพิ่มอะไหล่ใหม่: ' + row.part_name);
    return row;
  },

  updateSparePart: function(payload, userContext) {
    if (userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Only Admin can update spare parts");
    }
    Validation.requireFields(payload, ['part_id']);
    const db = Database.getInstance();
    const updates = {};
    if (payload.part_name) updates.part_name = Security.sanitizeString(payload.part_name);
    if (payload.part_code) updates.part_code = Security.sanitizeString(payload.part_code);
    if (payload.category) updates.category = Security.sanitizeString(payload.category);
    if (payload.unit) updates.unit = Security.sanitizeString(payload.unit);
    if (payload.unit_price !== undefined) updates.unit_price = Number(payload.unit_price) || 0;
    if (payload.status) updates.status = payload.status;
    
    db.update('Spare_Parts', 'part_id', payload.part_id, updates);
    AuditService.logActivity(userContext.user_id, 'ADMIN', 'UPDATE_SPARE_PART', 'Spare_Parts', payload.part_id, null, updates, 'แก้ไขข้อมูลอะไหล่');
    return { success: true };
  },

  deleteSparePart: function(payload, userContext) {
    if (userContext.role !== 'CENTRAL_ADMIN') {
      throw new Error("Only Admin can delete spare parts");
    }
    Validation.requireFields(payload, ['part_id']);
    const db = Database.getInstance();
    db.update('Spare_Parts', 'part_id', payload.part_id, { status: 'INACTIVE' });
    AuditService.logActivity(userContext.user_id, 'ADMIN', 'DELETE_SPARE_PART', 'Spare_Parts', payload.part_id, 'ACTIVE', 'INACTIVE', 'ปิดการใช้งานอะไหล่');
    return { success: true };
  },

  saveTicketSpareParts: function(payload, userContext) {
    Validation.requireFields(payload, ['ticket_id', 'items']);
    const db = Database.getInstance();
    
    // Clear old items for this ticket
    try {
      const sheet = db.getSheet('Ticket_Spare_Parts');
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        if (data.length > 1) {
          const headers = data[0];
          const ticketCol = headers.indexOf('ticket_id');
          if (ticketCol !== -1) {
            for (let i = data.length - 1; i >= 1; i--) {
              if (String(data[i][ticketCol]).trim() === String(payload.ticket_id).trim()) {
                sheet.deleteRow(i + 1);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not clear old spare parts: " + e.message);
    }
    
    // Insert new items
    if (Array.isArray(payload.items)) {
      payload.items.forEach(function(item) {
        if (item.part_name || item.name) {
          const qty = Number(item.qty || item.quantity) || 1;
          const unitPrice = Number(item.unit_price || item.unitPrice) || 0;
          const total = Number(item.total) || (qty * unitPrice);
          
          db.insert('Ticket_Spare_Parts', {
            usage_id: 'USG-' + Utilities.getUuid().slice(0, 8).toUpperCase(),
            ticket_id: payload.ticket_id,
            part_id: item.part_id || '',
            part_code: Security.sanitizeString(item.part_code || item.code || ''),
            part_name: Security.sanitizeString(item.part_name || item.name || ''),
            category: Security.sanitizeString(item.category || ''),
            qty: qty,
            unit: Security.sanitizeString(item.unit || 'ชิ้น'),
            unit_price: unitPrice,
            total: total,
            created_at: new Date().toISOString(),
            created_by: userContext.user_id
          });
        }
      });
    }
    
    AuditService.logActivity(userContext.user_id, userContext.role, 'SAVE_TICKET_PARTS', 'Ticket', payload.ticket_id, null, payload.items.length, 'บันทึกรายการอะไหล่ที่ใช้ในใบงาน');
    return { success: true };
  }
};
