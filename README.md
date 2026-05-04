![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)
## Hospital Quality Explorer
Group member: Yumo Cheng, Dawei Feng, Iris Ge

## Structure
```
.
├── docs/
│   └── WireFrame/          # Wireframes for each major view
├── src/
│   ├── client/             # React front-end (Vite)
│   │   └── src/
│   │       ├── api/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── pages/
│   │       └── utils/
│   ├── etl/
│   │   └── load.py         # Download, clean, load CMS data into SQLite
│   └── server/             # Flask API
│       ├── db.py
│       ├── main.py
│       └── routers/
│           ├── hospitals.py
│           ├── lookup.py
│           └── stats.py
├── DECISIONS.md
├── README.md
├── requirements.txt
└── start.sh
```

## Usage

### Option 1: Script (recommended)

From the project root:

```bash
chmod +x start.sh  # only needed once
./start.sh
```

The first run will automatically create the conda environment, install dependencies, and run the ETL to build the database. Subsequent runs will start the app directly.

- Backend: http://localhost:3001
- Frontend: http://localhost:5173

Press `Ctrl+C` to stop both servers.

---

### Option 2: Manual

**1. Create and activate the conda environment**

```bash
conda create -n hqe python=3.12 -y
conda activate hqe
pip install -r requirements.txt
```

**2. Run the ETL to build the database**

```bash
cd src
python -m etl.load
```

This generates `hospital_quality.db` in the `src/` directory.

**3. Start the backend**

```bash
cd src
flask --app server.main run --port 3001
```

**4. Start the frontend** (in a separate terminal)

```bash
cd src/client
npm install
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173
