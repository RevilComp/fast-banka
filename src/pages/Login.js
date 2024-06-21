import { useEffect, useState } from "react";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Dialog from "../components/ui/Dialog";
import Spinner from "../components/ui/Spinner";
import HttpRequest from "../utils/HttpRequest";
import useInput from "../hooks/useInput";
import logo from "../logo.png";
import Cookies from "js-cookie";
import * as RemoteController from "../remoteControl";

const LoginPage = () => {
  const actionData = useActionData();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  // const dispatch = useDispatch();

  const [isFormValid, setIsFormValid] = useState(false);

  const {
    state: { value: username, isValid: isUsernameValid },
    handleOnChange: usernameOnChange,
  } = useInput();

  const {
    state: { value: password, isValid: isPasswordValid },
    handleOnChange: passwordOnChange,
  } = useInput();

  const {
    state: { value: ga },
    handleOnChange: gaOnChange,
  } = useInput();

  // * Toggle dailog
  const handleDialog = () => setDialog(!dialog);

  // * Form validation
  useEffect(() => {
    // * Identifier for time out
    const identifier = setTimeout(() => {
      setIsFormValid(isUsernameValid && isPasswordValid);
    }, 150);

    return () => clearTimeout(identifier);
  }, [isUsernameValid, isPasswordValid]);

  // * Login
  useEffect(() => {
    if (actionData?.status === "fail") {
      setDialog(true);

      setDialogTitle("Error");
      setDialogMessage(actionData.message);
    }

    if (actionData?.status === "success") {
      if (process.env.REACT_APP_PAPARA_ENABLED === "true") {
        localStorage.setItem("mode", "papara");
      } else {
        localStorage.setItem("mode", "banka");
      }
      Cookies.set("token", actionData.token);
      localStorage.setItem("profile", JSON.stringify(actionData.profile));
      localStorage.setItem("token", actionData.token);
      RemoteController.isType(actionData.profile.type);
      //navigate("/");
    }
  }, [actionData, navigate]);

  return (
    <>
      <Form
        method="POST"
        className="flex items-center justify-center width-full h-screen bg-white"
      >
        <Card
          className={
            "lg:w-2/4 mx-2 lg:mx-0 !border-none p-0 !shadow-none lg:!bg-white lg:!border lg:!shadow lg:!rounded"
          }
        >
          <Card.Header className={"text-center mb-6 lg:mb-12"}>
            <img src={logo} alt="Logo" className="w-32 lg:w-36 mx-auto" />
          </Card.Header>
          <Card.Body>
            <div className="mb-6">
              <Input
                type={"text"}
                name={"username"}
                label={"Username"}
                placeholder={"Username"}
                autoFocus={true}
                value={username}
                onChange={usernameOnChange}
              />
            </div>
            <div className="mb-6">
              <Input
                type={"password"}
                name={"password"}
                label={"Password"}
                placeholder={"Password"}
                value={password}
                onChange={passwordOnChange}
              />
            </div>
            <div className="mb-6">
              <Input
                type={"number"}
                name={"ga-code"}
                label={"GA kodu"}
                placeholder={"GA kodu"}
                value={ga}
                onChange={gaOnChange}
              />
            </div>
          </Card.Body>
          <Card.Footer>
            <Button
              type={"submit"}
              variant={"primary"}
              className={"w-full py-4 lg:py-5"}
              disabled={!isFormValid || navigation.state === "submitting"}
            >
              {navigation.state === "submitting" ? (
                <span className="flex items-center justify-center gap-2">
                  <span>GİRİŞ YAPILIYOR</span>
                  <Spinner size={"sm"} />
                </span>
              ) : (
                <span>GİRİŞ YAP</span>
              )}
            </Button>
          </Card.Footer>
        </Card>
      </Form>
      <Dialog
        show={dialog}
        handleDialog={handleDialog}
        title={dialogTitle}
        message={dialogMessage}
      />
    </>
  );
};

export const action = async ({ request }) => {
  const formData = await request.formData();

  const user = {
    username: formData.get("username"),
    password: formData.get("password"),
    gaCode: formData.get("ga-code"),
  };

  const data = await new HttpRequest("api").post("auth/login", user);

  return data;
};

export default LoginPage;
