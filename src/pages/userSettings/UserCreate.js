import { useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import useInput from "../../hooks/useInput";
import HttpRequest from "../../utils/HttpRequest";
import { useMutation } from "react-query";
import Cookies from "js-cookie";
import Dialog from "../../components/ui/Dialog";

const createUser = async (payload) =>
  await new HttpRequest("api").post("users/createuser", payload);

const UserCreatePage = () => {
  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const profile = JSON.parse(localStorage.getItem("profile"));
  const handleDialog = () => setDialog(!dialog);

  const {
    state: { value: username },
    handleOnChange: usernameOnChange,
  } = useInput();

  const {
    state: { value: password },
    handleOnChange: passwordOnChange,
  } = useInput();

  const {
    state: { value: name },
    handleOnChange: nameOnChange,
  } = useInput();

  const {
    state: { value: surname },
    handleOnChange: surnameOnChange,
  } = useInput();

  const token = Cookies.get("token");

  const [userType, setUserType] = useState("");

  const handleUserTypeChange = (event) => setUserType(event.target.value);

  const createUserMutation = useMutation(createUser, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        handleDialog();
        setDialogTitle("Error");
        setDialogMessage("Creation user is failed.");
      }

      if (data.status === "success") {
        setDialog(true);
        setDialogTitle("Error");
        setDialogMessage(data.message);
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    let bank_account_management, bank_account_view;

    switch (userType) {
      case "user":
        bank_account_management = false;
        bank_account_view = false;
        break;

      case "admin":
        bank_account_view = true;
        bank_account_view = false;
        break;

      case "super_admin":
        bank_account_management = true;
        bank_account_view = true;
        break;

      case "god":
        bank_account_management = true;
        bank_account_view = true;
        break;

      default:
        throw new Error("Unknown user type.");
    }

    createUserMutation.mutate({
      token: token,
      firstName: name,
      lastName: surname,
      username,
      password,
      type: userType,
      bank_account_management,
      bank_account_view,
      remoteToken: localStorage.getItem("remoteToken"),
    });
  };

  return (
    <>
    {
      profile?.type === "god" && (
        <div className="flex justify-between">
          <h1>Bir God Admini olarak Lütfen Bu sayfadan Kullanıcı oluşturmayın. Havuzlar sayfasından oluşturabilirsiniz</h1>
        </div>
      )
    }
      <Card>
        <form onSubmit={handleSubmit}>
          <Card.Header>
            <h1 className="font-bold">Kullanıcı Oluştur</h1>
          </Card.Header>
          <Card.Body className={"my-5"}>
            <div className="md:flex gap-2 my-5">
              <Input
                type={"text"}
                name={"name"}
                label={"İsim"}
                placeholder={"İsim"}
                autoFocus={true}
                value={name}
                onChange={nameOnChange}
              />
              <Input
                type={"text"}
                name={"surname"}
                label={"Soyisim"}
                placeholder={"Soyisim"}
                autoFocus={false}
                value={surname}
                onChange={surnameOnChange}
              />
            </div>
            <div className="flex gap-2 my-5">
              <Input
                type={"text"}
                name={"username"}
                label={"Kullanıcı Adı"}
                placeholder={"Kullanıcı Adı"}
                autoFocus={false}
                value={username}
                onChange={usernameOnChange}
              />
              <Input
                type={"password"}
                name={"password"}
                label={"Şİfre"}
                placeholder={"Şİfre"}
                autoFocus={false}
                value={password}
                onChange={passwordOnChange}
              />
            </div>
            <div className="flex gap-2 my-5">
              <select
                name="user-type"
                id="user-type"
                className="w-full rounded-md py-3 border-gray-300"
                value={userType}
                onChange={handleUserTypeChange}
              >
                <option value="">Kullanıcı Rolü Seçiniz</option>
                {/* <option value="god">God</option> */}
                {/* <option value="super_admin">Süper Admin</option> */}
                <option value="admin">Admin</option>
                <option value="user">User</option>
                {/* <option value="god">God</option> */}
              </select>
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="flex justify-between">
              <Button type={"button"} variant={"secondary"}>
                Verileri Sıfırla
              </Button>
              <Button type={"submit"} variant={"primary"}>
                Kullanıcıyı Oluştur
              </Button>
            </div>
          </Card.Footer>
        </form>
      </Card>
      <Dialog
        show={dialog}
        title={dialogTitle}
        message={dialogMessage}
        handleDialog={handleDialog}
      />
    </>
  );
};

export default UserCreatePage;
