# 📚 Inkbound – Modern Book Selling Web App

**Inkbound** is a modern, elegant, and fully responsive single-page application (SPA) built using **React + Vite**, styled with **Tailwind CSS (v3.4)**, and designed for scalability and dynamic book listings. The site allows users to browse featured books, explore by category, view detailed product pages, and more.

---

## 🚀 Tech Stack

| Technology       | Purpose                                                        |
|------------------|----------------------------------------------------------------|
| [React](https://reactjs.org)        | Frontend library for building interactive UIs                |
| [Vite](https://vitejs.dev)          | Lightning-fast bundler & development server                  |
| [Tailwind CSS 3.4](https://tailwindcss.com/docs/installation) | Utility-first CSS framework for design speed                 |
| [React Router](https://reactrouter.com)   | Client-side routing for product navigation                   |
| [Node.js & npm](https://nodejs.org/)      | Runtime and package manager for dependency installation      |
| [JavaScript (ES6+)]                  | Application logic and component composition                 |

---

## 🧰 Installation & Setup Instructions

Make sure you have **Node.js v18+** and **npm** installed.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/inkbound.git
cd inkbound
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Project Structure

```
src/
│
├── assets/                 # Book images and static media
├── components/             # Reusable UI components (Navbar, Footer, BookCard, etc.)
├── data/
│   └── books.js            # Centralized book dataset with metadata (id, title, category, etc.)
├── pages/
│   ├── Home.jsx            # Main homepage layout with all book sections
│   ├── ProductPage.jsx     # Dynamic individual book details
│   └── ShoppingPage.jsx    # Full product listing page
├── App.jsx                 # Routes & app shell
├── main.jsx                # App entry with BrowserRouter
└── index.css               # Tailwind base styles
```

---

## 📦 Book Data Model

All book data is stored centrally in `src/data/books.js`. Here's the structure used:

```js
{
  id: '4',
  title: 'His Saving Grace',
  author: 'Misty Figueroa',
  price: '$201.00',
  original: '$288.74',
  rating: 5,
  img: '/assets/book2.jpg',
  isFavorite: true,
  isFeatured: true,
  category: 'Romance',
}
```

This structure ensures **no repetition**: You only define books in `books.js`, and every section (Featured, Favourites, etc.) filters and displays from there.

---

## 🎯 Project Goals

### ✅ Phase 1: Core Features (Completed)
- [x] Home page with multiple dynamic sections
- [x] “Our Favourite Reads” showing handpicked books
- [x] “Featured Books” carousel
- [x] “Shop by Category” tiles
- [x] Product details page with dynamic routing (`/product/:id`)
- [x] Shopping page with all books listed
- [x] Central `books.js` for dynamic filtering and rendering
- [x] Clean, scalable component structure using Tailwind

### 🚧 Phase 2: Upcoming Enhancements
- [ ] Admin dashboard to upload/edit/delete books
- [ ] Filter & search system (by category, rating, price)
- [ ] User authentication and cart functionality
- [ ] Payment integration (Stripe or Razorpay)

### 🤖 Phase 3: AI Integration – *Auto-Add Books From Image*
> **Goal**: Scan an image of a book and auto-populate the title, author, and metadata using AI (OCR + GPT/LLM).

This will involve:
- Using an OCR library like **Tesseract.js** to extract text from book covers
- Using OpenAI GPT or a fine-tuned model to:
  - Recognize the book
  - Fetch metadata (title, author, price)
  - Add it directly into the catalog for selling

---

## 🌍 Deployment Options

You can deploy this project to:
- **Vercel** (recommended for Vite projects)
- **Netlify**
- **GitHub Pages**

For Vercel:
```bash
npm run build
vercel deploy
```

---

## 👩‍💻 Contributions

This project is in active development. Contributions, ideas, and improvements are welcome!

---

## 📝 License

MIT License – Feel free to use and modify.