import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;
  async function handleLogout() {
    const { data } = await axios.get("http://localhost:3000/auth/logout");
    if (data.status) {
      navigate("/login");
    }
  }
  return (
    <div>
      Home
      <button>
        <Link to="/dashboard">Dashboard</Link>
      </button>
      <button onClick={handleLogout}>logout</button>
    </div>
  );
};

export default Home;
