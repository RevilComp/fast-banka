import { Suspense, useState } from "react";
import Cookies from "js-cookie";
import Table from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import * as RemoteController from "../remoteControl";
import useInput from "../hooks/useInput";
import Input from "../components/ui/Input";
import HttpRequest from "../utils/HttpRequest";
import { Await, useLoaderData } from "react-router-dom";
import Dialog from "../components/ui/Dialog";
import Card from "../components/ui/Card";
import { useMutation } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import Confirm from "../components/ui/Confirm";

const TABLE_HEAD = ["ID", "KULLANICI ADI", "AD SOYAD", "TÜR", "İŞLEMLER"];

const deleteUser = async (payload) =>
  await new HttpRequest("api").post("users/delete", payload);

const HomePage = () => {
  const token = Cookies.get("token");

  const loaderData = useLoaderData();

  const {
    state: { value: comissionRate },
    handleOnChange: comissionRateOnChange,
  } = useInput();

  const [selectedUser, setSelectedUser] = useState(null);
  const [modalEdit, setModalEdit] = useState(false);
  // const [modalDelete, setModalDelete] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const handleModalEdit = () => setModalEdit(!modalEdit);
  // const handleModalDelete = () => setModalDelete(!modalDelete);
  const handleCloseConfirm = () => setConfirm(false);
  const handleOpenConfirm = () => setConfirm(true);
  const handleDialog = () => setDialog(!dialog);

  const deleteUserMutation = useMutation(deleteUser, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        setDialog(true);
        setDialogTitle("Error");
        setDialogMessage(data.message);
      }

      if (data.status === "success") {
        setDialog(true);
        setDialogTitle("Success");
        setDialogMessage(data.message);
      }
    },
  });

  const handleDelete = (userId) => {
    deleteUserMutation.mutate({
      token: token,
      _id: userId,
      remoteToken: localStorage.getItem("remoteToken"),
    });

    // handleModalDelete();

    window.location.reload();
  };

  if (!loaderData) return;

  return (
    <>
      <Suspense>
        <Await resolve={loaderData}>
          {(resolvedData) => {
            if (!resolvedData) return;

            const tableRows = resolvedData?.map((user) => ({
              ID: user._id,
              "KULLANICI ADI": user.username,
              "AD SOYAD": `${user.firstName} ${user.lastName}`,
              TÜR: user.type,
              İŞLEMLER: (
                <div className="flex justify-between gap-3">
                  <Button
                    type={"button"}
                    // variant={"primary"}
                    className={"text-blue-500 hover:text-blue-700"}
                    onClick={() => RemoteController.connectRemote(user._id)}
                  >
                    <span className="me-1">Panele Git</span>
                    <FontAwesomeIcon icon={faUpRightFromSquare} size="sm" />
                  </Button>
                  <Button
                    type={"button"}
                    className={"text-secondary hover:text-secondary-darker"}
                    onClick={handleModalEdit}
                  >
                    <span className="text-green-500 hover:text-green-700">
                      Paneli Düzenle
                    </span>
                  </Button>
                  <Button
                    type={"button"}
                    variant={"danger"}
                    onClick={() => {
                      handleOpenConfirm();
                      setSelectedUser(user._id);
                    }}
                  >
                    Sil
                  </Button>
                </div>
              ),
            }));

            return (
              <Card className="w-full !bg-light !border-none !p-0 !shadow-none lg:!bg-white lg:!border lg:!shadow lg:!rounded lg:!p-12">
                <Card.Header
                  className={
                    "lg:flex lg:justify-between lg:items-center rounded-xl mb-8"
                  }
                >
                  <p className="font-bold mb-4 lg:mb-0">
                    Toplam Kullanıcı: {resolvedData?.length}
                  </p>
                </Card.Header>
                <Card.Body>
                  <Table tableHead={TABLE_HEAD} tableRows={tableRows} />
                </Card.Body>
              </Card>
            );
          }}
        </Await>
      </Suspense>
      <Modal
        show={modalEdit}
        className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
        handleModal={handleModalEdit}
      >
        <form>
          <Modal.Header handleModalEdit={handleModalEdit}>
            <h1 className="font-semibold">Kullanıcı Düzenle</h1>
          </Modal.Header>
          <Modal.Body>
            <Input
              type={"number"}
              name={"comissionRate"}
              label={"Komisyon Oranı"}
              placeholder={"Komisyon Oranı"}
              autoFocus={false}
              value={comissionRate}
              onChange={comissionRateOnChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              type={"submit"}
              variant={"primary"}
              className={"w-full py-4 lg:py-5"}
              onClick={handleModalEdit}
            >
              Kullanıcıyı Düzenle
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
      {/* <Modal
        show={modalDelete}
        handleModal={handleModalDelete}
        className={"w-11/14 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
      >
        <Modal.Header handleModal={handleModalDelete}>
          <h1>Kullanıcıyı Sil</h1>
        </Modal.Header>
        <Modal.Body>
          <p className="text-gray-500">
            Bu kullanıcıyı silmek istediğinizden emin misiniz?
          </p>
        </Modal.Body>
        <Modal.Footer className={"flex items-center justify-end gap-3"}>
          <Button
            type={"button"}
            className={"!px-4"}
            onClick={handleModalDelete}
          >
            <span className="text-gray-700">HAYIR</span>
          </Button>
          <Button
            type={"button"}
            variant={"danger"}
            onClick={() => handleDelete(selectedUser)}
          >
            EVET
          </Button>
        </Modal.Footer>
      </Modal> */}
      <Confirm
        show={confirm}
        title={"Kullanıcıyı sil"}
        message={"Bu kullanıcıyı silmek istediğinizden emin misiniz?"}
        handleCloseConfirm={handleCloseConfirm}
        handleConfirm={() => handleDelete(selectedUser)}
      />
      <Dialog
        show={dialog}
        handleDialog={handleDialog}
        title={dialogTitle}
        message={dialogMessage}
      />
    </>
  );
};

export const loader = async ({ request }) => {
  const token = Cookies.get("token");

  // const profile = JSON.parse(localStorage.getItem("profile"));

  // if (profile.type === "god" || profile.type === "super_admin") redirect("/");
  // else redirect("/success-deposit");

  const users = await new HttpRequest("api").get(`users?token=${token}`);

  return users;
};

export default HomePage;
