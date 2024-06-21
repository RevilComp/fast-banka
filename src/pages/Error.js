import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../components/ui/Button";
import logo from "../logo.dark.svg";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import Cookies from "js-cookie";

const ErrorPage = () => {
  const navigate = useNavigate();
  const token = Cookies.get("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  });

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <img src={logo} className="w-64 mb-6" alt="Logo" />
      <section className="text-center">
        <h1 className="text-3xl font-bold mb-4">Sayfa bulunamadı!</h1>
        <Button
          type={"button"}
          variant={"primary"}
          className={"flex items-center justify-center text-center mx-auto"}
          onClick={() => navigate("/")}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
          <span className="ms-2">Anasayfaya git</span>
        </Button>
      </section>
    </div>
  );
};

export default ErrorPage;
