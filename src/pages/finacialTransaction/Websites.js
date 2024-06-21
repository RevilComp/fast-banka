import Table from "../../components/ui/Table";
import { Suspense, useState } from "react";
import Button from "../../components/ui/Button";
import HttpRequest from "../../utils/HttpRequest";
import { Await, useLoaderData } from "react-router-dom";
import * as RemoteController from "../../remoteControl";
import { useMutation } from "react-query";
import Cookies from "js-cookie";
import { Switch } from "@headlessui/react";
import useInput from "../../hooks/useInput";
import Modal from "../../components/ui/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Dialog from "../../components/ui/Dialog";

import {
  faTrashCan,
  faCircleQuestion,
  faPlus,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import Input from "../../components/ui/Input";

const TABLE_HEAD = [
  "SITE ADI",
  "KONTROL HESABI",
  "TARGET WEBSITE",
  "KISA AD",
  "SAHAYA AÇIKLIK DURUMU",
  "İŞLEMLER",
];

const changeWebsiteActive = async (payload) =>
  new HttpRequest("api").post("users/change-website-active", payload);

const addWebsite = async (payload) =>
  new HttpRequest("api").post("users/create-website-user", payload);

const editWebsite = async (payload) =>
  new HttpRequest("api").post("users/edit-website-user", payload);

const removeWebsite = async (payload) => 
  await new HttpRequest("api").post("users/delete-website-user", payload);

const set2FA = async (payload) =>
  await new HttpRequest("api").post("users/set-2fa", payload);


const WebsiesPage = () => {
  const [enabled, setEnabled] = useState(false);
  const [websiteActiveList, setWebsiteActiveList] = useState({});
  const loaderData = useLoaderData();
  const [modalCreateWebsite, setModalCreateWebsite] = useState(false);
  const [modalEditWebsite, setModalEditWebsite] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState("")
  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [twoFaModal, setTwoFaModal] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const handleDialog = () => setDialog(!dialog);

  const handleModalCreateWebsite = () =>
    setModalCreateWebsite(!modalCreateWebsite);
    
  const handleModalEditWebsite = (id) => {
    setModalEditWebsite(!modalEditWebsite);
    setSelectedWebsite(id)
  }
  const {
    state: { value: websiteName, isValid: isWebsiteNameValid },
    handleOnChange: websiteNameOnChange,
  } = useInput();

  const {
    state: { value: shortName, isValid: isShortNameValid },
    handleOnChange: shortNameOnChange,
  } = useInput();

  const {
    state: { value: targetName, isValid: isTargetNameValid },
    handleOnChange: targetNameOnChange,
  } = useInput();

  const {
    state: { value: username, isValid: isUsernameValid },
    handleOnChange: usernameOnChange,
  } = useInput();

  const {
    state: { value: password, isValid: isPasswordValid },
    handleOnChange: passwordOnChange,
  } = useInput();

  const handleWebsiteActive = (websiteId, isWebsiteActive) => {
    changeWebsiteActiveMutation.mutate({
      token: Cookies.get("token"),
      websiteId,
      isWebsiteActive,
    });
  };

  const createWebsiteMutation = useMutation(addWebsite, {
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
        setModalCreateWebsite(false);

      setQrCodeImage(null);
      set2FAUserMutation.mutate({
        token: Cookies.get("token"),
        userId: data.data.newUser._id,
      });
      }
    },
  });

  const set2FAUserMutation = useMutation(set2FA, {
    onSuccess: (data) => {
      setTwoFaModal(true);
      setQrCodeImage(data.data_url);
    },
  });

  const handleCreateWebsite = (e) => {
    e.preventDefault();
    createWebsiteMutation.mutate({
      token: Cookies.get("token"),
      firstName: websiteName,
      password: password,
      targetWebsite: targetName,
      username: username,
      shortName: shortName
    });
  }

  const editWebsiteMutation = useMutation(editWebsite, {
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
        setModalEditWebsite(false)
      }
    },
  });

  const handleEditWebsite = (e) => {
    e.preventDefault();
    editWebsiteMutation.mutate({
      token: Cookies.get("token"),
      websiteId: selectedWebsite._id,
      firstName: websiteName || selectedWebsite?.firstName,
      password: password || selectedWebsite?.password,
      targetWebsite: targetName || selectedWebsite?.targetWebsite,
      username: username || selectedWebsite?.username,
      shortName: shortName || selectedWebsite?.shortName
    });
  }

  const removeWebsiteMutation = useMutation(removeWebsite, {
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

  const handleRemoveWebsite = (websiteId) => {
    removeWebsiteMutation.mutate({
      token: Cookies.get("token"),
      websiteId: websiteId,
    });
  };

  const changeWebsiteActiveMutation = useMutation(changeWebsiteActive, {
    onSuccess: (data) => {
      if (data.status !== "fail") {
        const isWebsiteActive = data?.data?.isWebsiteActive;
        const websiteId = data?.data?._id;
        if (
          !(isWebsiteActive === true || isWebsiteActive === false) ||
          !websiteId
        )
          return;
        setWebsiteActiveList((prev) => {
          prev[websiteId] = isWebsiteActive;
          return prev;
        });
      }
    },
  });

  const getIsWebsiteActive = (user, websiteId) => {
    if (
      websiteActiveList[websiteId] === true ||
      websiteActiveList[websiteId] === false
    ) {
      return websiteActiveList[websiteId];
    }
    return user?.isWebsiteActive;
  };

  return (
    <Suspense fallback={"Loading..."}>
      <Await resolve={loaderData}>
        {(resolveData) => {
          const tableRows = resolveData.map((user, index) => ({
            "SITE ADI": user.targetWebsite,
            "KONTROL HESABI": user.username,
            "TARGET WEBSITE": user.targetWebsite,
            "KISA ADI": user.shortName,
            "SAHAYA AÇIKLIK DURUMU": (
              <div className="relative inline-flex">
                <Switch
                  checked={getIsWebsiteActive(user, user?._id)}
                  onChange={(isActive) =>
                    handleWebsiteActive(user._id, isActive)
                  }
                  className={`${
                    getIsWebsiteActive(user, user?._id)
                      ? "bg-primary"
                      : "bg-gray-700"
                  }
                    relative inline-flex h-[19px] w-[37px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
                >
                  <span className="sr-only">Use setting</span>
                  <span
                    aria-hidden="true"
                    className={`${
                      getIsWebsiteActive(user, user?._id)
                        ? "translate-x-4"
                        : "translate-x-0"
                    }
                      pointer-events-none inline-block h-[17px] w-[17px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mb-1`}
                  />
                </Switch>
                <span className="font-bold ml-2">
                  {" "}
                  {getIsWebsiteActive(user, user?._id) ? "Açık" : "Kapalı"}{" "}
                </span>
              </div>
            ),
            İŞLEMLER: (
              <div className="flex justify-around">
                <Button
                  type={"button"}
                  variant={"primary"}
                  className={"mr-2 mb-2"}
                  onClick={() => handleModalEditWebsite(user)}
                >
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    size="lg"
                    className="mr-3"
                  />
                  Düzenle
                </Button>
                <Button
                  type={"button"}
                  variant={"danger"}
                  className={"mr-2 mb-2"}
                  onClick={() => handleRemoveWebsite(user._id)}
                >
                  <FontAwesomeIcon
                    icon={faTrashCan}
                    size="lg"
                    className="mr-3"
                  />
                  Sil
                </Button>
              </div>
            ),
          }));
          return (
            <>
              <div className="flex">
                <Button
                  type={"submit"}
                  variant={"primary"}
                  className={"py-2 mb-2 ml-auto"}
                  onClick={() => handleModalCreateWebsite()}
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    size="lg"
                    className="mr-3"
                  />
                  Yeni Websitesi Ekle
                </Button>
              </div>
              <Table tableHead={TABLE_HEAD} tableRows={tableRows} />
              <Modal
                show={twoFaModal}
                className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
                handleModal={setTwoFaModal}
              >
                <Modal.Header handleModal={setTwoFaModal}>
                  <h1 className="font-semibold">2FA Authentication Kodu</h1>
                </Modal.Header>
                <Modal.Body>
                  {qrCodeImage && (
                    <img
                      width={300}
                      height={300}
                      src={qrCodeImage}
                      alt="QR Code"
                    />
                  )}
                  {!qrCodeImage && <h6>Yükleniyor...</h6>}
                </Modal.Body>
                <Modal.Footer>
                  <a
                    href={qrCodeImage}
                    download="qrcode.png"
                    type="button"
                    className="btn btn-secondary"
                  >
                    İndir
                  </a>
                </Modal.Footer>
              </Modal>
              <Modal
                show={modalCreateWebsite}
                className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
                handleModal={handleModalCreateWebsite}
              >
                <Modal.Header handleModal={handleModalCreateWebsite}>
                  <h1 className="font-semibold">İşlem Düzenle</h1>
                </Modal.Header>
                <form onSubmit={handleCreateWebsite}>
                  <Modal.Body>
                    <div className="mb-5">
                      <div className="flex gap-2">
                        <Input
                          type={"text"}
                          name={"username"}
                          label={"Site Kullanıcı Adı"}
                          placeholder={"Site Kullanıcı Adı"}
                          autoFocus={true}
                          value={username}
                          onChange={usernameOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                        <Input
                          type={"text"}
                          name={"password"}
                          label={"Kontrol Hesabı Şifresi"}
                          placeholder={"Kontrol Hesabı Şifresi"}
                          autoFocus={false}
                          value={password}
                          onChange={passwordOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                      </div>

                      <div className="flex gap-2 mt-5">
                        <Input
                          type={"text"}
                          name={"websiteName"}
                          label={"Site Adı"}
                          placeholder={"Site Adı"}
                          autoFocus={false}
                          value={websiteName}
                          onChange={websiteNameOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                        <Input
                          type={"text"}
                          name={"shortName"}
                          label={"Site Kısa Adı"}
                          placeholder={"Site Kısa Adı"}
                          autoFocus={false}
                          value={shortName}
                          onChange={shortNameOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                      </div>

                      <div className="flex gap-2 mt-5">
                        <Input
                          type={"text"}
                          name={"targetName"}
                          label={"Domain Target Adı"}
                          placeholder={"Domain Target Adı"}
                          autoFocus={false}
                          value={targetName}
                          onChange={targetNameOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                        <div
                          className="info"
                          title="URL den değişmeyen alan yazılmalı. Örnek: eğer site xsite234.com ise 234 daha sonradan değişebilecei için xsite diye yazılmalıdır"
                        >
                          <FontAwesomeIcon
                            icon={faCircleQuestion}
                            size="lg"
                            className="mt-3"
                          />
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="flex gap-2">
                      <Button
                        type={"submit"}
                        variant={"primary"}
                        className={"w-full py-4 lg:py-5"}
                      >
                        Hesabı Oluştur
                      </Button>
                    </div>
                  </Modal.Footer>
                </form>
              </Modal>
              <Modal
                show={modalEditWebsite}
                className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
                handleModal={handleModalEditWebsite}
              >
                <Modal.Header handleModal={handleModalEditWebsite}>
                  <h1 className="font-semibold">İşlem Düzenle</h1>
                </Modal.Header>
                <form onSubmit={handleEditWebsite}>
                  <Modal.Body>
                    <div className="mb-5">
                      <div className="flex gap-2">
                        <Input
                          type={"text"}
                          name={"username"}
                          label={"Site Kullanıcı Adı"}
                          placeholder={"Site Kullanıcı Adı"}
                          autoFocus={true}
                          value={username || selectedWebsite?.username}
                          onChange={usernameOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                        <Input
                          type={"text"}
                          name={"password"}
                          label={"Kontrol Hesabı Şifresi"}
                          placeholder={"Kontrol Hesabı Şifresi"}
                          autoFocus={false}
                          value={password || selectedWebsite?.password}
                          onChange={passwordOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                      </div>

                      <div className="flex gap-2 mt-5">
                        <Input
                          type={"text"}
                          name={"websiteName"}
                          label={"Site Adı"}
                          placeholder={"Site Adı"}
                          autoFocus={false}
                          value={websiteName || selectedWebsite?.firstName}
                          onChange={websiteNameOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                        <Input
                          type={"text"}
                          name={"shortName"}
                          label={"Site Kısa Adı"}
                          placeholder={"Site Kısa Adı"}
                          autoFocus={false}
                          value={shortName || selectedWebsite?.shortName}
                          onChange={shortNameOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                      </div>

                      <div className="flex gap-2 mt-5">
                        <Input
                          type={"text"}
                          name={"targetName"}
                          label={"Domain Target Adı"}
                          placeholder={"Domain Target Adı"}
                          autoFocus={false}
                          value={targetName || selectedWebsite?.targetWebsite}
                          onChange={targetNameOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                        <div
                          className="info"
                          title="URL den değişmeyen alan yazılmalı. Örnek: eğer site xsite234.com ise 234 daha sonradan değişebilecei için xsite diye yazılmalıdır"
                        >
                          <FontAwesomeIcon
                            icon={faCircleQuestion}
                            size="lg"
                            className="mt-3"
                          />
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="flex gap-2">
                      <Button
                        type={"submit"}
                        variant={"primary"}
                        className={"w-full py-4 lg:py-5"}
                      >
                        Websiteyi Düzenle
                      </Button>
                    </div>
                  </Modal.Footer>
                </form>
              </Modal>
              <Dialog
                show={dialog}
                handleDialog={handleDialog}
                title={dialogTitle}
                message={dialogMessage}
              />
            </>
          );
        }}
        
      </Await>
    </Suspense>
  );
};

export const loader = async ({ request }) => {
  const token = RemoteController.getToken();
  const remoteProfile = localStorage.getItem("profile");
  const params = {
    token: token,
    remoteProfile,
  };
  const users = await new HttpRequest("api").get("users/website-users", params);
  if (!users) return [];
  const websites = users.filter((e) => e.type === "website");
  return websites;
};

export default WebsiesPage;
