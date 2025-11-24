# 🏛️ MSFL History Club — Official Website

Welcome to the **official web platform** of the *Mustafa Saffet Science High School History Club (MSFL Tarih Kulübü)*.  
This website is designed to share historical content, club activities, and student-written articles with a modern, dynamic, and fully responsive interface.

🚀 **Live Website:** https://msfltarihkulubu.vercel.app/

---

## 📌 Features

### 🏠 Homepage
- Atatürk-themed hero section with signature and tughra artwork  
- Fully responsive layout (desktop/tablet/mobile)  
- Clean typography and modern UI components  

### 📝 Blog System
- Create, edit, and delete blog posts  
- Blog listing + detail pages  
- Author-only permissions  
- Cloudinary image upload support  
- Automatic date formatting  
- Handlebars-based dynamic rendering  

### 👤 User Accounts & Profiles
- JWT-based authentication (secure cookies)  
- User registration and login  
- Profiles with:
  - Avatar upload  
  - Cover upload  
  - Editable biography  
  - Social media links (Instagram, X, GitHub)  
- Public profile pages with user posts  

### 🔐 Security
- CSRF protection  
- Password hashing  
- Helmet security middleware  
- Auth-based route protection  
- Input normalization for social links  

### 📅 “Today in History” Module
- Custom historical event section  
- Editable events  
- Clean date → events display  

### ⚙️ Backend Architecture
- Node.js + Express  
- MongoDB + Mongoose  
- Handlebars templating engine  
- Modular routing structure  
- Helper functions:
  - `eq`
  - `generateDate`
  - `toString`
  - Custom logger  

---

## 🗂️ Project Structure

```
/public
  /css
  /js
  /img

/routes
  main.js
  blogs.js
  kullanici.js
  hesap.js
  legal.js
  profile.js

/views
  /layouts
  /partials
  *.handlebars

/models
  User.js
  Post.js
  Comment.js

/helpers
/middlewares
```

---

## 🛠️ Tech Stack

**Frontend:**  
- HTML5  
- CSS3  
- JavaScript  
- Handlebars (HBS)

**Backend:**  
- Node.js (Express)  
- MongoDB (Mongoose)  
- JWT authentication  

**Other:**  
- Cloudinary image hosting  
- Helmet security  
- CSRF protection  

---

## 🚀 Getting Started (Development)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your/repo-name.git
cd msfl-tarih-kulubu-v2
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables  
Create a `.env` file:

```
MONGO_URI=your-mongo-db-connection
JWT_SECRET=your-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-preset
PORT=3000
```

### 4️⃣ Start the Server
```bash
npm run dev
```

Server runs on:  
👉 `http://localhost:3000`

---

## 📦 Deployment

This project is fully compatible with **Vercel**.  
Make sure to:
- Use `"type": "module"` in package.json  
- Add environment variables in Vercel dashboard  
- Set the build command to:  
```
npm install
```
- And the output directory to:  
```
/
```

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome!  
Create an issue or open a pull request.

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🌐 Visit the Website

👉 **https://msfltarihkulubu.vercel.app/**  
Explore the platform, read articles, and follow new updates from MSFL History Club.
