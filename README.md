# LeetTrack

A simple web application to help you efficiently track, store, and revisit your LeetCode DSA solutions.

---

## 🛠️ Problem Statement

As a software developer preparing for exams and interviews, I found it difficult to review the data structures and algorithms (DSA) problems I had solved on LeetCode. Navigating through submission pages individually was time-consuming and unstructured. I needed a way to organize my solutions for easy review and revision.

---

## 🚀 Features

- **Fetch Problem Details**: Enter a LeetCode problem URL to automatically retrieve the problem title, description, difficulty, tags, and more.
- **Save Submissions**: Paste your submission code and save it along with metadata.
- **Structured Organization**: Categorize solutions by topics (e.g., Arrays, Trees, Dynamic Programming).
- **Revision-Friendly**: Quickly browse and search previously solved problems to revisit solutions and refresh your knowledge.
- **Authentication**: Secure user login with NextAuth.js.
- **Responsive UI**: Built with Tailwind CSS for a clean, responsive design.

---

## 🧰 Tech Stack

- **Framework**: Next.js
- **Authentication**: NextAuth.js
- **ORM**: Prisma
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS

---

## 📝 Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/yourusername/leettrack.git
   cd leettrack
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Setup Environment Variables**  
   Create a `.env.local` file at the root with the following variables:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   DATABASE_URL=your_supabase_database_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

4. **Run Database Migrations**  
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start the Development Server**  
   ```bash
   npm run dev
   ```
   Your app should now be running at `http://localhost:3000`.

---

## 🎬 Usage

1. **Login/Register** using your credentials.
2. **Add New Problem**: Enter the LeetCode problem URL, fetch details, paste your code, and assign categories.
3. **View Dashboard**: Browse all saved problems, filter by category, difficulty, or tags.
4. **Edit/Delete** any entry as needed.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository 💫
2. Create a new branch  
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit your changes  
   ```bash
   git commit -m "feat: add awesome feature"
   ```
4. Push to the branch  
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a Pull Request for review.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Happy coding and efficient learning!*  
