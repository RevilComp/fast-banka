import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../components/ui/Button";
import logo from "../logo.png";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";

const AuthorizationErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <img src={logo} className="w-64 mb-6" alt="Logo" />
      <section className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Bu Sayfa için yetkiniz yoktur!
        </h1>
        <Button
          type={"button"}
          variant={"primary"}
          className={"flex items-center justify-center text-center mx-auto"}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
          <span className="ms-2">Anasayfaya git</span>
        </Button>
      </section>
    </div>
  );
};

export default AuthorizationErrorPage;
