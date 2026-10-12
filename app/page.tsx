
"use client";

import { useEffect, useState } from "react";
import {
  BookOpen, Search, Library, BookCheck, Clock,
  Plus, Trash2, RotateCcw, X, LayoutDashboard,
  Pencil, History, Filter
} from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  borrowed: boolean;
};

type BorrowRecord = {
  id: string;
  bookId: string;
  bookTitle: string;
  borrower: string;
  borrowedAt: string;
  returnedAt: string | null;
};

const initialBooks: Book[] = [
  { id: "1", title: "Atomic Habits", author: "James Clear", category: "Self Help", borrowed: false },
  { id: "2", title: "Clean Code", author: "Robert C. Martin", category: "Technology", borrowed: true },
  { id: "3", title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", borrowed: false },
  { id: "4", title: "Deep Work", author: "Cal Newport", category: "Productivity", borrowed: false },
];

const categories = [
  "Technology", "Fiction", "Science", "History",
  "Self Help", "Productivity", "Other"
];

export default function Home() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [borrowBook, setBorrowBook] = useState<Book | null>(null);
  const [borrower, setBorrower] = useState("");
  const [activeTab, setActiveTab] = useState<"books" | "history">("books");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Technology");

  useEffect(() => {
    try {
      const savedBooks = localStorage.getItem("mybook-library");
      const savedRecords = localStorage.getItem("mybook-history");

      if (savedBooks) setBooks(JSON.parse(savedBooks));
      if (savedRecords) setRecords(JSON.parse(savedRecords));
    } catch (error) {
      console.error("Could not load library data:", error);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("mybook-library", JSON.stringify(books));
    localStorage.setItem("mybook-history", JSON.stringify(records));
  }, [books, records, loaded]);

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setCategory("Technology");
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (book: Book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category);
    setEditingId(book.id);
    setShowForm(true);
  };

  const saveBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    if (editingId) {
      setBooks(prev => prev.map(book =>
        book.id === editingId
          ? { ...book, title: title.trim(), author: author.trim(), category }
          : book
      ));
    } else {
      setBooks(prev => [...prev, {
        id: crypto.randomUUID(),
        title: title.trim(),
        author: author.trim(),
        category,
        borrowed: false
      }]);
    }
    resetForm();
  };

  const deleteBook = (id: string) => {
    if (window.confirm("Delete this book?")) {
      setBooks(prev => prev.filter(book => book.id !== id));
    }
  };

  const confirmBorrow = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!borrowBook || !borrower.trim()) return;

    const newRecord: BorrowRecord = {
      id: crypto.randomUUID(),
      bookId: borrowBook.id,
      bookTitle: borrowBook.title,
      borrower: borrower.trim(),
      borrowedAt: new Date().toISOString(),
      returnedAt: null
    };

    setRecords(prev => [newRecord, ...prev]);
    setBooks(prev => prev.map(book =>
      book.id === borrowBook.id ? { ...book, borrowed: true } : book
    ));
    setBorrowBook(null);
    setBorrower("");
  };

  const returnBook = (id: string) => {
    const now = new Date().toISOString();

    setBooks(prev => prev.map(book =>
      book.id === id ? { ...book, borrowed: false } : book
    ));

    setRecords(prev => {
      const activeRecord = prev.find(
        record => record.bookId === id && record.returnedAt === null
      );

      return prev.map(record =>
        record.id === activeRecord?.id
          ? { ...record, returnedAt: now }
          : record
      );
    });
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = [book.title, book.author, book.category]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === "All" || book.category === filter);
  });

  const borrowedCount = books.filter(b => b.borrowed).length;

  const stats = [
    { label: "Total Books", value: books.length, icon: Library },
    { label: "Available Books", value: books.length - borrowedCount, icon: BookCheck },
    { label: "Borrowed Books", value: borrowedCount, icon: Clock }
  ];

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center gap-3 text-indigo-700">
          <BookOpen size={30} />
          <h1 className="text-2xl font-bold">MyBook Library</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="text-indigo-600" />
          <h2 className="text-3xl font-bold">Dashboard</h2>
        </div>
        <p className="text-slate-500 mb-8">
          Manage your books and borrowing records.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border">
              <stat.icon className="text-indigo-600 mb-4" size={30} />
              <p className="text-slate-500">{stat.label}</p>
              <h3 className="text-4xl font-bold mt-2">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveTab("books")}
            className={`px-5 py-3 rounded-xl font-medium cursor-pointer ${
              activeTab === "books" ? "bg-indigo-600 text-white" : "bg-white border"
            }`}
          >
            <BookOpen size={17} className="inline mr-2" />Books
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-3 rounded-xl font-medium cursor-pointer ${
              activeTab === "history" ? "bg-indigo-600 text-white" : "bg-white border"
            }`}
          >
            <History size={17} className="inline mr-2" />Borrowing History
          </button>
        </div>

        {activeTab === "books" ? (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <h3 className="text-2xl font-bold">My Books</h3>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl cursor-pointer"
              >
                <Plus size={18} /> Add Book
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 text-slate-400" size={20} />
                <input
                  placeholder="Search books..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full border rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 text-slate-400" size={19} />
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="border rounded-xl py-3 pl-10 pr-5 bg-white w-full"
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredBooks.map(book => (
                <div key={book.id} className="border rounded-xl p-5 flex gap-4">
                  <div className="bg-indigo-100 text-indigo-600 p-4 rounded-xl self-start">
                    <BookOpen size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg break-words">{book.title}</h4>
                    <p className="text-slate-500 text-sm">by {book.author}</p>
                    <p className="text-indigo-600 text-sm mt-2">{book.category}</p>
                    <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full ${
                      book.borrowed
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {book.borrowed ? "Borrowed" : "Available"}
                    </span>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => book.borrowed
                          ? returnBook(book.id)
                          : (setBorrowBook(book), setBorrower(""))}
                        className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg cursor-pointer"
                      >
                        <RotateCcw size={14} className="inline mr-1" />
                        {book.borrowed ? "Return" : "Borrow"}
                      </button>
                      <button
                        onClick={() => openEdit(book)}
                        className="bg-amber-50 text-amber-700 text-sm px-3 py-2 rounded-lg cursor-pointer"
                      >
                        <Pencil size={14} className="inline mr-1" />Edit
                      </button>
                      <button
                        onClick={() => deleteBook(book.id)}
                        className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg cursor-pointer"
                      >
                        <Trash2 size={14} className="inline mr-1" />Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredBooks.length === 0 && (
              <p className="text-center text-slate-500 py-8">No books found.</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-2xl font-bold mb-6">Borrowing History</h3>
            {records.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No borrowing records yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-3">Book</th>
                      <th className="p-3">Borrower</th>
                      <th className="p-3">Borrow Date</th>
                      <th className="p-3">Return Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(record => (
                      <tr key={record.id} className="border-b">
                        <td className="p-3 font-medium">{record.bookTitle}</td>
                        <td className="p-3">{record.borrower}</td>
                        <td className="p-3">{formatDate(record.borrowedAt)}</td>
                        <td className="p-3">
                          {record.returnedAt ? formatDate(record.returnedAt) : "—"}
                        </td>
                        <td className="p-3">
                          <span className={record.returnedAt
                            ? "text-green-700" : "text-orange-600"}>
                            {record.returnedAt ? "Returned" : "Borrowed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-6">
              <h3 className="text-2xl font-bold">
                {editingId ? "Edit Book" : "Add New Book"}
              </h3>
              <button onClick={resetForm} aria-label="Close form" className="cursor-pointer">
                <X />
              </button>
            </div>
            <form onSubmit={saveBook} className="space-y-4">
              <input
                required maxLength={120} placeholder="Book Title"
                value={title} onChange={e => setTitle(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
              />
              <input
                required maxLength={100} placeholder="Author Name"
                value={author} onChange={e => setAuthor(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
              />
              <select
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 bg-white"
              >
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl cursor-pointer">
                {editingId ? "Update Book" : "Save Book"}
              </button>
            </form>
          </div>
        </div>
      )}

      {borrowBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-2">Borrow Book</h3>
            <p className="text-slate-500 mb-5">{borrowBook.title}</p>
            <form onSubmit={confirmBorrow} className="space-y-4">
              <input
                required maxLength={100}
                placeholder="Enter borrower name"
                value={borrower}
                onChange={e => setBorrower(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
              />
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl cursor-pointer">
                Confirm Borrow
              </button>
              <button
                type="button"
                onClick={() => setBorrowBook(null)}
                className="w-full border py-3 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
