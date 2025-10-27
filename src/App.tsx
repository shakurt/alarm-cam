import { Routes, Route } from "react-router";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { UserProvider } from "@/context/userContext";
import AboutPage from "@/pages/about";
import HomePage from "@/pages/home";
import NotFoundPage from "@/pages/not-found";
import "react-simple-toasts/dist/style.css";
import "react-simple-toasts/dist/theme/dark.css";
import "react-simple-toasts/dist/theme/success.css";

import { toastConfig } from "react-simple-toasts";

toastConfig({
  maxVisibleToasts: 3,
  position: "bottom-center",
  theme: "dark",
});

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
