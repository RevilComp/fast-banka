import axios from "axios";
import Cookies from "js-cookie";

const apiUrl = process.env.REACT_APP_API_URL +"/";
const isControlling = () => {
  return localStorage.getItem("remoteToken") != null;
};

const getToken = () => {
  if (isControlling()) {
    return localStorage.getItem("remoteToken");
  } else {
    return Cookies.get("token");
  }
};

const connectRemote = async (userId) => {
  const req = await axios.get(apiUrl + "users/connectremote", {
    params: {
      userId,
      token: Cookies.get("token"),
    },
  });

  const token = req.data.token;
  const profile = req.data.profile;
  localStorage.setItem("remoteToken", token);
  localStorage.setItem("remoteProfile", JSON.stringify(profile));
  window.location = "/success-deposit";
  return true;
};

const isLogin = () => {
  const token = Cookies.get("token");
  const currentUrl = window.location.href;
  if (!token && !currentUrl.includes("/login") && !currentUrl.includes("/docs")) {
    window.location = "/login";
  }
};

const logOutRemote = (isSuperAdmin) => {
  localStorage.removeItem("remoteToken");
  localStorage.removeItem("remoteProfile");

  window.location = "/";
  return true;
};
const isType = (userType) => {
  if (userType === "super_admin" || userType === "god") {
    window.location = "/";
  } else {
    window.location = "/success-deposit";
  }
};
export {
  isControlling,
  getToken,
  connectRemote,
  logOutRemote,
  isType,
  isLogin,
};
