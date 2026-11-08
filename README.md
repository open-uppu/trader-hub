# Trader Central Hub

ระบบรวบรวมข้อมูลและแดชบอร์ดกลาง (Central Multi-Project FinTech Portal) สำหรับโปรเจกต์การลงทุนและการเทรด ออกแบบด้วยสถาปัตยกรรม **Zero-Intrusion Pluggable Gateway** ไม่มีการแก้ไขโค้ดใด ๆ ในโปรเจกต์เดิม

---

## สถาปัตยกรรม (Architecture)

- **Backend:** FastAPI (Python 3.14) รันที่พอร์ต `8000`
  - Pluggable Connectors:
    - `edca_connector`: นำเข้าโมดูลวิเคราะห์พอร์ตและคำแนะนำ AI Advisor จาก `edca`
    - `daytrad_connector`: สแกนภาพกราฟแท่งเทียน, บันทึกการเรียนรู้ (Learned Rules), และ Daily Target จาก `daytrad`
- **Frontend:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS รันที่พอร์ต `3000`
  - ธีม Dark Mode สไตล์ FinTech Terminal
  - หน้า Overview สรุปรวมทุกโปรเจกต์
  - หน้า Daytrad Console ดูภาพกราฟแท่งเทียนและกฎที่บอทเรียนรู้
  - หน้า EDCA Portfolio ดูตารางสัดส่วนหุ้น แผน DCA และบทวิเคราะห์ AI

---

## วิธีการรันระบบ (Quick Start)

รันคำสั่งเดียวเพื่อเริ่มการทำงานทั้ง Backend และ Frontend พร้อมกัน:

```bash
cd hub
./run.sh
```

หรือแยกรันอิสระ:

### 1. รัน Backend (FastAPI)
```bash
cd hub/backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- API Endpoint: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### 2. รัน Frontend (Next.js)
```bash
cd hub/frontend
bun run dev
# หรือ
npm run dev
```
- เปิดเบราว์เซอร์ที่: `http://localhost:3000`

---

## การเพิ่มโปรเจกต์ใหม่ในอนาคต (Extensibility)

1. สร้างไฟล์ใน `hub/backend/connectors/<new_project>_connector.py`
2. สืบทอดคลาสจาก `BaseConnector` และกำหนดฟังก์ชัน:
   - `get_status()`
   - `get_summary()`
   - `get_details()`
3. นำไปลงทะเบียนใน `hub/backend/main.py` ผ่าน `registry.register(...)`
4. โปรเจกต์ใหม่จะปรากฏบน Sidebar และหน้า Overview ของเว็บทันทีโดยอัตโนมัติ!
