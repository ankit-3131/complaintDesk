# ComplaintDesk 🏢

ComplaintDesk is a full-stack complaint management platform that allows users to register complaints, track their progress, and receive real-time updates. It also provides an admin dashboard for managing complaints efficiently. The application uses a BERT similarity search based microservice to automatically categorize complaints based on their titles, reducing manual effort and improving consistency.

---

## Features

- User authentication using JWT
- Register and track complaints
- Automatic complaint categorization using NLP embeddings
- Admin dashboard for complaint management
- Real-time notifications using Socket.IO
- Cloudinary integration for evidence uploads
- Email notifications for important ticket updates
- PDF report generation
- Interactive maps and heatmaps for complaint visualization

---

## Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS
- Material UI
- React Router
- Axios
- JS-Cookie
- Socket.IO Client
- React Leaflet
- Leaflet Heatmap

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Socket.IO
- Cloudinary
- Nodemailer
- PDFKit

### AI / NLP Microservice

- FastAPI
- spaCy
- Sentence Transformers
- NumPy
- Pydantic

---

## Project Structure

```text
complaintDesk/
├── client/                     # React frontend
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express backend
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── package.json
│
└── fastAPI/                    # Complaint categorization service
    ├── main.py
    ├── title.py
    └── requirements.txt
```

---

## Environment Variables

### Client (`client/.env`)

```env
VITE_BACKEND_URL=http://localhost:3000
```

### Server (`server/.env`)

```env
MONGO_STRING=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>

CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
API_KEY=<your-cloudinary-api-key>
API_SECRET=<your-cloudinary-api-secret>
CLOUD_NAME=<your-cloudinary-cloud-name>

SENDGRID_API_KEY=<your-sendgrid-api-key>
GEMINI_API_KEY=<your-gemini-api-key>

FASTAPI_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

---

# Running the Project Locally

### Prerequisites

Make sure you have the following installed:

- Node.js
- Python 3.8+
- MongoDB (local or Atlas)

---

## 1. Start the FastAPI Service

Navigate to the FastAPI folder:

```bash
cd fastAPI
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the service:

```bash
uvicorn main:app --reload
```

The NLP service will be available at:

```
http://127.0.0.1:8000
```

---

## 2. Start the Backend

Navigate to the backend folder:

```bash
cd ../server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using the environment variables shown above.

Run the server:

```bash
npm start
```

or during development:

```bash
npx nodemon app.js
```

The backend will run at:

```
http://localhost:3000
```

---

## 3. Start the Frontend

Navigate to the frontend folder:

```bash
cd ../client
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the application at:

```
http://localhost:5173
```

---