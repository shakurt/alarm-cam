import Camera from "@/components/camera/Camera";
import Login from "@/components/Login";
import { useUser } from "@/context/userContext";

const HomePage = () => {
  const { userInfo } = useUser();

  return userInfo ? <Camera /> : <Login />;
};

export default HomePage;
