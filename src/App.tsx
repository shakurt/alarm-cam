import { Routes, Route } from "react-router";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { UserProvider } from "@/context/userContext";
import AboutPage from "@/pages/about";
import HomePage from "@/pages/home";
import NotFoundPage from "@/pages/not-found";

const App = () => {
  return (
    <UserProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
};

export default App;
