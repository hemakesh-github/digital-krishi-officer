# 🌾 Farmer Assist - Demo Pitch

---

## **One-Liner**

An AI-powered mobile app that provides instant crop disease diagnosis and expert agricultural advice to farmers, with human expert escalation when needed.

---

## **Problem We Solve**

Farmers face crop diseases but lack:
- 24/7 Access to agricultural experts
- Real-time disease diagnosis
- Timely intervention advice
- Cost-effective solutions

**Our Solution:** AI chatbot + expert network at fingertips

## **How It Works (3 Steps)**

### **Step 1: Farmer Queries**
- Farmer sends crop issue via mobile
- Example: *"My rice has white leaf marks, what do I do?"*

### **Step 2: AI Diagnosis**
- We perform semantic search on farmer query with historical Kisan Call Center dataset
- LLM uses retrieved context to make diagnosis if accurate diagnosis possible
- If insufficient context, query escalated to human expert
- Provides actionable recommendations
- Shows treatment options

### **Step 3: Expert Escalation (If Needed)**
- Complex cases → Auto-escalate to expert
- Experts are assigned based on availability
- Farmer gets personalized expert response

---

## **Key Features**

| Feature | Benefit |
|---------|---------|
| **OTP-based Login** | Secure, no password hassle |
| **AI Crop Advisor** | 24/7 instant diagnosis |
| **Expert Network** | Human backup for complex cases |
| **Chat History** | Track all conversations |
| **Multi-language** | Telugu support |

---

## **Tech Highlights**

- **AI:** LLM
- **Backend:** FastAPI (production-grade)
- **Database:** PostgreSQL (reliable, scalable), Qdrant for sematic search
- **Auth:** JWT tokens + OTP verification


---

## **Impact / Numbers**

- ⚡ **Instant diagnosis** (< 5 seconds)
- 👥 **Expert network** (scalable to 1000s)
- 🌾 **Multi-crop support** (Rice, Wheat, Cotton, etc.)
- 💰 **Cost-effective** (vs hiring agronomist)

---

## **Demo Flow (Live)**

**Scenario: Farmer finds disease on rice crop**

1. **Login:** Send OTP → Receive JWT token
2. **Query:** *"Rice crop with brown spots, yellow edges"*
3. **AI Response:** 
   - Disease identified: "Blast Disease"
   - Treatment: "Spray Tricyclazole @ 1g/L"
4. **If needed:** Click "Talk to Expert" → Queue for expert
5. **Expert Chat:** Expert responds with advice



## **What Makes Us Different**

✅ **Local experts** (not just global AI)  
✅ **Multilingual support** (regional languages)  

---

## **Next Steps / Roadmap**

- [ ] Video diagnosis (upload crop photo)
- [ ] Weather integration (disease prediction)
- [ ] Regional pricing recommendations
- [ ] Farmer community marketplace
- [ ] Govt subsidy eligibility checker

---
