import { useState } from "react";

import Button from "@/components/UI/Button";
import Checkbox from "@/components/UI/Checkbox";
import TextInput from "@/components/UI/TextInput";
import { useUser } from "@/context/userContext";
import LoginImage from "@/assets/login.svg";

const Login = () => {
  const { setUserInfo } = useUser();
  const [email, setEmail] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required!");
      return;
    }

    setUserInfo({ email, sendEmail: isChecked });
  };

  return (
    <section className="container flex min-h-[calc(100vh-120px)] items-center justify-center gap-10 lg:gap-20">
      <div className="w-full max-w-md">
        <h2 className="mb-6 text-center text-4xl font-semibold text-white">
          Login
        </h2>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div>
            <TextInput
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
            />
            {error && <p className="mt-1 ml-1 text-xs text-red-500">{error}</p>}
          </div>
          <Checkbox
            name="email-motion-detection"
            label="Send Email after Detecting Motion"
            checked={isChecked}
            onChange={setIsChecked}
          />
          <Button type="submit">Login</Button>
        </form>
      </div>
      <img
        src={LoginImage}
        alt="Login image"
        className="hidden w-[300px] md:block"
      />
    </section>
  );
};

export default Login;
