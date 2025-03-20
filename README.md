# 🚀 Developer Performance Tracker

**Developer Performance Tracker** is an **AI-powered DevOps tool** that enhances software development efficiency using **Large Language Models (LLMs)**. The system identifies **high-performing developers**, automates **pull request (PR) reviews**, and provides valuable performance insights.

---

## 📌 Features

✅ **LLM-Powered Developer Analysis** – Detects top-performing developers based on coding patterns.  
✅ **Automated PR Reviews** – AI-generated insights for efficient pull request evaluations.  
✅ **Performance Metrics Dashboard** – Tracks team and individual developer productivity.  
🔄 **ML-Based Predictions (Upcoming)** – Forecasts efficiency trends and project bottlenecks.  

---

## 🛠 Tech Stack

| Component     | Technology Stack |
|--------------|----------------|
| **Frontend** | React.js |
| **Backend** | Node.js, Express, MongoDB |
| **Authentication** | GitHub OAuth |
| **AI Processing** | OpenAI GPT / LLM models |
| **Infrastructure** | Docker, Kubernetes (Planned), GitHub Actions |

---

## 🏗 Installation & Setup

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/Harshmriduhash/Devops-LLM-Tool.git
cd Devops-LLM-Tool
```

### **2️⃣ Backend Setup**
Navigate to the backend directory:
```sh
cd backend
npm install
```
Configure **environment variables** in `.env`:
```sh
PORT=4000
MONGO_URI=your_mongodb_connection_string
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback
SESSION_SECRET=someRandomSecret
```
Start the backend server:
```sh
npm run dev
```

### **3️⃣ Frontend Setup**
Navigate to the frontend directory:
```sh
cd ../frontend
npm install
```
Configure **environment variables** in `.env`:
```sh
PORT=3000
REACT_APP_BACKEND_API_URL=http://localhost:4000
REACT_APP_GITHUB_LOGIN_URL=http://localhost:4000/auth/github
REACT_APP_GITHUB_USER_URL=http://localhost:4000/auth/user
```
Start the frontend:
```sh
npm start
```

---

## 🖥 Usage

### **Running Locally**
1. Ensure MongoDB is running locally or use **MongoDB Atlas**.
2. Start the **backend** (`npm run dev` in `backend/`).
3. Start the **frontend** (`npm start` in `frontend/`).
4. Open **http://localhost:3000** in your browser.

### **Automated PR Reviews**
- Configure your **GitHub repository webhook** to point to:
```sh
http://your-server-url/github-webhook
```
- The system will analyze and provide **AI-generated feedback** for new PRs.

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **MongoDB Connection Error** | Check `MONGO_URI` and ensure MongoDB is running. |
| **GitHub OAuth Issues** | Verify **client credentials** and **callback URL** settings. |
| **CORS Issues** | Ensure backend CORS settings allow frontend requests. |

---

## 📅 Roadmap

✔ **LLM-Powered PR Reviews**  
✔ **Developer Performance Insights**  
🔄 **ML-Based Developer Efficiency Predictions**  
🔄 **Team Productivity Heatmaps**  
🔄 **Kubernetes Deployment Support**  

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository.
2. **Create a new branch** (`git checkout -b feature-branch`).
3. **Make your changes** and commit (`git commit -m 'Add feature X'`).
4. **Push to the branch** (`git push origin feature-branch`).
5. **Open a pull request**.

---

## 📜 License

This project is licensed under the **MIT License**.

---

### ⭐ **If you find this project useful, give it a star! 🌟**
