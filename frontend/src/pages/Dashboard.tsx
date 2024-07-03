import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    async function isVerified() {
      const { data } = await axios.get("http://localhost:3000/auth/verify/", {
        withCredentials: true,
      });
      console.log(data);
      if (!data.status) {
        navigate("/login");
      }
    }
    isVerified();
  }, [navigate]);
  return <div>Dashboard</div>;
};

export default Dashboard;
