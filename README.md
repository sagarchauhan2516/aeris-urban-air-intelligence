# AERIS — Urban Air Quality, Exposure Intelligence & Clinical Health Platform

AERIS is a full-screen, domain-grade urban air quality and household exposure intelligence portal powered by live **Open-Meteo** atmospheric telemetry, **7-Day Historical Atmospheric Records**, **India CPCB NAQI** mathematical sub-indices, **Gemini Flash AI** personalized health advisories, an interactive **Personal Exposure & Mitigation Simulator**, and a dedicated **Clinical Health & Nutritional Prescription Engine**.

## Key Capabilities

1. **7-Day Historical Records & Exposure Log**:
   - Aggregates the past 168 hours of atmospheric data into daily records: Date, Peak NAQI, Average NAQI, Daily Average PM2.5, CPCB category badges, and estimated daily inhalation load.
   - Computes Weekly Average NAQI, tracks count of Severe smog days (>300 NAQI), and summarizes weekly multi-day atmospheric trends.

2. **Clinical Health & Nutritional Prescription ("What to Consume & Implement")**:
   - **Hydration Protocol**: Daily water intake targets (e.g. 2.8L–3.2L) to support mucociliary clearance, warm water steam inhalation, and saline nasal rinses.
   - **Antioxidant & Anti-Inflammatory Nutrition**: Scientific dietary defenses (Jaggery with crushed ginger, Amla/Citrus for ROS scavenging, Golden Turmeric milk with piperine, Omega-3 flaxseeds/walnuts) + explicit dietary aggravators to avoid (deep-fried re-heated oils, chilled dairy, high sodium).
   - **Member-Specific Medical Protocols**: Targeted precautions based on actual family health conditions (Asthma rescue inhaler alerts, COPD SpO2 monitoring, Cardiovascular blood pressure checks, pregnancy placental protection, infant airflow care).
   - **Long-Term Smog Resilience Roadmap**: Actionable implementations across Immediate (1-7 Days: envelope weather-stripping), Medium-Term (1-3 Months: botanical VOC scrubbers & carbon sheets), and Annual timeframes (commute decarbonization & spirometry screening).

3. **Universal Location Search (Open-Meteo Geocoding API)**:
   - Search any city, town, or district in India or globally (e.g., *Noida, Jaipur, Lucknow, Chandigarh, Ahmedabad, London, Tokyo*).
   - Fast debounced autocomplete with State & Country metadata, plus 8 quick regional metro presets and one-click GPS geolocation.

4. **Live India CPCB NAQI Telemetry**:
   - Real-time and 24-hour hourly pollutant monitoring (`PM2.5`, `PM10`, `NO₂`, `O₃`, `CO`).
   - Official Indian Central Pollution Control Board (CPCB) piecewise linear sub-index calculations with dominant pollutant attribution and 0–500 scale bar.

5. **Interactive "What-If" Mitigation Simulator**:
   - Toggles for True HEPA filtration, certified N95 masks, diurnal peak avoidance, and Metro transit.
   - Computes daily inhaled biological particulate dose ($\mu g\text{ PM}_{2.5}/\text{day}$), percentage reduction, and Berkeley Earth cigarette equivalence avoided.
   - Integrated **Air Purifier CADR Sizing Tool** calculating required CFM and $m^3/h$ for 4.8 Air Changes per Hour (ACH) based on room dimensions.

6. **Atmospheric Pollutant Clinical Guide**:
   - Interactive medical and environmental reference dossiers for PM2.5, PM10, NO2, O3, and CO detailing particle size, CPCB vs. WHO standards, urban emission sources, and vulnerable demographic risks.

7. **Household Exposure Matrix & AI Air Routine Brief**:
   - Per-member risk assessment based on age bracket (`infant`, `child`, `adult`, `elderly`) and specific respiratory/cardiac flags (`asthma`, `copd`, `heart`, `pregnant`, `outdoor_worker`).
   - Generates personalized daily action cards and safe outdoor activity windows.

8. **Lung-Safe Ventilation Window**:
   - Scans the 24-hour forecast curve to identify the optimal 2-hour window with lowest ambient particulate load for indoor cross-ventilation.

9. **Commute Exposure Comparison Table**:
   - Compares Metro / AC Rail, Closed AC Car, EV Cab, and Walk/Cycle across inhaled exposure levels, practical guidelines, and $CO_2$ saved per 10 km.

10. **High-Resolution 2x Retina Dossier Export**:
    - One-click export to a clean 1920×1080 PNG report card optimized for sharing on WhatsApp and professional portfolios.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Configure Gemini Flash in `.env.local`:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
   *Note: If no key is set or the API is under heavy traffic, AERIS automatically runs its deterministic heuristic health engine.*
3. Run automated tests:
   ```bash
   npm test
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).
