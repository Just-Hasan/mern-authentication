import axios, { Axios } from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [data, setData] = useState();
  const navigate = useNavigate();
  useEffect(() => {
    async function getUser() {
      const { data } = await axios.get("http://localhost:3000/");
      setData(data);
    }
    getUser();
  }, []);

  axios.defaults.withCredentials = true;
  async function handleLogout() {
    const { data } = await axios.get("http://localhost:3000/auth/logout");
    if (data.status) {
      navigate("/login");
    }
  }
  console.log(data);
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
