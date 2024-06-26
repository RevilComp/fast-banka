import Table from "../../components/ui/Table";
import { Suspense, useEffect, useState } from "react";
import Cookies from "js-cookie";
import Button from "../../components/ui/Button";
import HttpRequest from "../../utils/HttpRequest";
import { Await, useLoaderData, useRevalidator } from "react-router-dom";
import * as RemoteController from "../../remoteControl";
import Modal from "../../components/ui/Modal";
import useInput from "../../hooks/useInput";
import Input from "../../components/ui/Input";
import Dialog from "../../components/ui/Dialog";
import { useMutation, useQuery } from "react-query";
import Loading from "../../components/ui/loading/Loading";
import renderForPermission from "../../utils/PermissionLayer";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";

const createPool = async (payload) =>
  await new HttpRequest("api").post("pool/create", payload);

const clonePool = async (payload) =>
  await new HttpRequest("api").post("pool/clone", payload);

const updatePool = async (payload) =>
  await new HttpRequest("api").post("pool/update", payload);

const deletePool = async (payload) =>
  await new HttpRequest("api").post("pool/delete", payload);

const deleteUser = async (payload) =>
  await new HttpRequest("api").post("users/delete", payload);

const createUser = async (payload) =>
  await new HttpRequest("api").post("users/createuser", payload);

const set2FA = async (payload) =>
  await new HttpRequest("api").post("users/set-2fa", payload);

const getUsers = async (transactionsData) => {
  return await new HttpRequest("api").get(
    `users?token=${transactionsData.queryKey[1].token}&${transactionsData.queryKey[1].remoteToken}}`
  );
};

const getWebsites = async (transactionsData) => {
  return await new HttpRequest("api").get(
    `users/website-users?token=${transactionsData.queryKey[1].token}&${transactionsData.queryKey[1].remoteToken}}`
  );
};

const TABLE_HEAD = [
  "ID",
  "KULLANICI ADI",
  "ADI SOYADI",
  "TİPİ",
  "SON GİRİŞ",
  "AKTİFLİK",
  "İŞLEMLER",
];

const PoolSettingsPageBanka = () => {
  const profile = JSON.parse(localStorage.getItem("profile"));
  const loaderData = useLoaderData();
  const refetchData = useRevalidator();
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createModalPool, setCreateModalPool] = useState(false);
  const [updateModalPool, setUpdateModalPool] = useState(false);
  const [addUserModal, setAddUserModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState();
  const [modalPoolTransfer, setModalPoolTransfer] = useState(false);
  const [isEnabled, setIsEnabled] = useState();
  const [selectedTransferPool, setSelectedTransferPool] = useState();
  const [userType, setUserType] = useState("");
  const [addUserSelectedPoolId, setAddUserSelectedPoolId] = useState(null);
  const [twoFaModal, setTwoFaModal] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const handleUserTypeChange = (event) => setUserType(event.target.value);
  const handleTwoFaModal = () => setTwoFaModal(!twoFaModal);
  const handleUpdateModalPool = () => setUpdateModalPool(!updateModalPool);
  const handleModalPoolTransfer = () =>
    setModalPoolTransfer(!modalPoolTransfer);
  const handleCreatePoolModal = () => setCreateModalPool(!createModalPool);
  const handleAddUserModal = () => setAddUserModal(!addUserModal);
  const handleIsEnabled = (event) => setIsEnabled(event.target.value);
  const [targetWebsites, setTargetWebsites] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [users, setUsers] = useState([]);
  const [poolAccounts, setPoolAccounts] = useState([]);

  const refetch = () => {
    refetchData.revalidate();
  };

  const {
    state: { value: dailyDepositLimit },
    handleOnChange: dailyDepositLimitOnChange,
  } = useInput();

  const {
    state: { value: poolTitle },
    handleOnChange: poolTitleOnChange,
  } = useInput();

  const {
    state: { value: commissionRatePool },
    handleOnChange: commissionRatePoolOnChange,
  } = useInput();

  const {
    state: { value: dailyWithdrawLimit },
    handleOnChange: dailyWithdrawLimitOnChange,
  } = useInput();

  const {
    state: { value: username, isValid: isUsernameValid },
    handleOnChange: usernameOnChange,
  } = useInput();

  const {
    state: { value: password, isValid: isPasswordValid },
    handleOnChange: passwordOnChange,
  } = useInput();

  const {
    state: { value: name, isValid: isNameValid },
    handleOnChange: nameOnChange,
  } = useInput();

  const {
    state: { value: surname, isValid: isSurnameValid },
    handleOnChange: surnameOnChange,
  } = useInput();

  const {
    state: { value: title },
    handleOnChange: titleOnChange,
  } = useInput();
  const {
    state: { value: url },
    handleOnChange: urlOnChange,
  } = useInput();

  const handleUpdatePool = (pool) => {
    setSelectedPool(pool);
    setUpdateModalPool(true);
  };

  const createPoolMutation = useMutation(createPool, {
    onSuccess: (data) => {
      refetch();
    },
  });

  const handleDialog = () => setDialog(!dialog);

  const createPoolUserMutation = useMutation(createUser, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        setDialogTitle("Error");
        setDialogMessage(data.message || "İşlem başarısız oldu.");

        return handleDialog();
      }
      refetch();
      setQrCodeImage(null);
      set2FAUserMutation.mutate({
        token: Cookies.get("token"),
        userId: data.data.newUser._id,
      });
    },
  });

  const set2FAUserMutation = useMutation(set2FA, {
    onSuccess: (data) => {
      setTwoFaModal(true);
      setQrCodeImage(data.data_url);
    },
  });

  const addUserSubmit = (e) => {
    e.preventDefault();

    createPoolUserMutation.mutate({
      firstName: name,
      lastName: surname,
      username,
      password,
      type: userType,
      pool: addUserSelectedPoolId,
      token: Cookies.get("token"),
    });
    setAddUserModal(false);
  };

  const createSubmit = (e) => {
    e.preventDefault();
    createPoolMutation.mutate({
      title: poolTitle,
      token: Cookies.get("token"),
      depositLimit: dailyDepositLimit,
      withdrawLimit: dailyWithdrawLimit,
      commissionRate: Number(commissionRatePool),
      targetWebsites,
      // targetWebsites: websiteList,
    });
    setCreateModalPool(false);
  };

  const updateUserMutation = useMutation(updatePool, {
    onSuccess: (data) => {
      console.log("data", data);
      setUpdateModalPool(false);
      refetch();
    },
  });

  const updatePoolRequest = (e) => {
    e.preventDefault();

    updateUserMutation.mutate({
      token: Cookies.get("token"),
      poolId: selectedPool?._id,
      depositLimit: dailyDepositLimit || selectedPool?.depositLimit || 0,
      withdrawLimit: dailyWithdrawLimit || selectedPool?.withdrawLimit || 0,
      enabled: isEnabled,
      title: poolTitle || selectedPool?.title,
      commissionRate:
        Number(commissionRatePool) || Number(selectedPool?.commissionRate) || 0,
      targetWebsites: selectedPool?.targetWebsites,
    });

    setCreateModalPool(false);
  };

  const clonePoolMutation = useMutation(clonePool, {
    onSuccess: (data) => {
      refetch();
    },
  });

  const cloneSubmit = (e) => {
    e.preventDefault();
    clonePoolMutation.mutate({
      token: Cookies.get("token"),
      userId: selectedUser._id,
      poolId: selectedTransferPool,
    });
    setModalPoolTransfer(false);
  };

  const deletePoolMutation = useMutation(deletePool, {
    onSuccess: (data) => {
      if (data?.isUserExistInPool) {
        return alert(
          "Kullanıcı sahada bulunmaktadır. Lütfen önce kullanıcıyı sahadan çıkarın."
        );
      }
      refetch();
    },
  });

  const deleteUserMutation = useMutation(deleteUser, {
    onSuccess: (data) => {
      refetch();
    },
  });

  const deleteSubmit = (poolId) => {
    deletePoolMutation.mutate({
      token: Cookies.get("token"),
      poolId: poolId,
    });
  };

  const paramsDeposit = {
    token: Cookies.get("token"),
    remoteToken: localStorage.getItem("remoteToken"),
  };

  /*

  const {
    isLoading: isUsersDataLoading,
    refetch: refetchUsers,
  } = useQuery(["getUsers", paramsDeposit], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      const usersData = await getUsers(data);
      console.log("users: ", usersData);
      setWebsites(
        usersData
          .filter((e) => e.type === "website")
          .map((c) => [
            { ...c, targetWebsite: c.targetWebsite },
          ])
          .flat(),
      );
      setUsers(
        usersData
          .filter(
            (e) => e.parentAccount && (e.type === "admin" || e.type === "user"),
          )
          .sort((e) => (e.pool ? -2 : 1))
          .sort((a, b) =>
            a?.pool?._id.toString() > b?.pool?._id?.toString() ? 1 : -1,
          ),
      );
      const inputData = usersData
        .filter((e) => e?.pool?._id)
        .map((e) => e?.pool._id);
      const distinctValues = [...new Set(inputData)];
      if (distinctValues) {
        setPoolAccounts(
          distinctValues.sort((a, b) => (a.toString() > b.toString() ? 1 : -1)),
        );
        if (distinctValues.length) setSelectedTransferPool(distinctValues[0]);
      }
    },
  });
  console.log("setWebsites: ", websites);

  */

  useQuery(["getWebsites", paramsDeposit], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      const usersData = await getWebsites(data);
      console.log("users: ", usersData);
      setWebsites(
        usersData
          .filter((e) => e.type === "website")
          .map((c) => [{ ...c, targetWebsite: c.targetWebsite }])
          .flat()
      );
      /*const inputData = usersData
        .filter((e) => e?.pool?._id)
        .map((e) => e?.pool._id);
      const distinctValues = [...new Set(inputData)];
      if (distinctValues) {
        setPoolAccounts(
          distinctValues.sort((a, b) => (a.toString() > b.toString() ? 1 : -1)),
        );
        if (distinctValues.length) setSelectedTransferPool(distinctValues[0]);
      }*/
    },
  });

  useEffect(() => {
    const identifier = setTimeout(() => {
      setIsFormValid(
        isNameValid && isSurnameValid && isUsernameValid && isPasswordValid
      );
    }, 100);

    return () => clearTimeout(identifier);
  }, [isNameValid, isSurnameValid, isUsernameValid, isPasswordValid]);

  console.log("selectedPool: ", selectedPool);
  console.log("targetWebsites: ", targetWebsites);
  console.log("selectedPool.targetWebsites: ", selectedPool?.targetWebsites);
  // console.log("websites", websites);

  return (
    <Suspense fallback={<Loading />}>
      <Await resolve={loaderData}>
        {(resolvedData) => {
          if (!resolvedData) return;

          const { pools = [] } = resolvedData;

          return (
            <>
              {renderForPermission(
                profile.type,
                "PoolsSettings.AddPoolButton"
              ) && (
                <Button
                  type={"button"}
                  variant={"primary"}
                  className={"mb-4"}
                  onClick={() => {
                    handleCreatePoolModal();
                    poolTitleOnChange({
                      target: { name: "poolTitle", value: "" },
                    });
                    commissionRatePoolOnChange({
                      target: { name: "commissionRate", value: "" },
                    });
                    dailyDepositLimitOnChange({
                      target: { name: "dailyDepositLimit", value: "" },
                    });
                    dailyWithdrawLimitOnChange({
                      target: { name: "dailyWithdrawLimit", value: "" },
                    });
                  }}
                >
                  Saha Ekle
                </Button>
              )}
              {pools.map((pool) => {
                let tableRows = (pool?.users || []).map((user) => ({
                  ID: user._id,
                  "KULLANICI ADI": user.username,
                  "ADI SOYADI": user.firstName + " " + user.lastName,
                  TİPİ: user.type,
                  "SON GİRİŞ": user?.lastLoginDate
                    ? moment(user?.lastLoginDate).format("DD/MM/YYYY HH:mm")
                    : "Bulunamadı",
                  ONLINE: user?.isOnline ? "Online" : "Offline",
                  İŞLEMLER: (
                    <>
                      <Button
                        type={"button"}
                        variant={"success"}
                        className={"mr-2 mb-2"}
                        onClick={() => RemoteController.connectRemote(user._id)}
                      >
                        Panele Git
                      </Button>
                      {renderForPermission(
                        profile.type,
                        "PoolsSettings.TransferToAnotherPoolButton"
                      ) && (
                        <Button
                          type={"button"}
                          variant={"primary"}
                          className={"mr-2 mb-2"}
                          onClick={() => {
                            setSelectedUser(user);
                            handleModalPoolTransfer();
                          }}
                        >
                          Başka Sahaya Transfer Et
                        </Button>
                      )}
                      <Button
                        type={"button"}
                        variant={"danger"}
                        className={"mr-2 mb-2"}
                        onClick={() => {
                          deleteUserMutation.mutate({
                            token: Cookies.get("token"),
                            _id: user._id,
                          });
                        }}
                      >
                        Kullanıcı Sil
                      </Button>
                    </>
                  ),
                }));
                return (
                  <div className="mb-4 border-2">
                    <div className="bg-secondary p-4 text-white rounded-t-lg">
                      <div className="flex align-center justify-between">
                        <h1 className="font-bold">
                          {pool.title || "İsimsiz Saha"} (
                          {pool.enabled ? "Aktif" : "Pasif"})
                        </h1>
                        <div>
                          <Button
                            type={"button"}
                            variant={"success"}
                            className={"mr-2 mb-2"}
                            onClick={() => {
                              setAddUserSelectedPoolId(pool._id);
                              // setAddUserModal(true);
                              handleAddUserModal();
                              nameOnChange({
                                target: {
                                  name: "name",
                                  value: "",
                                },
                              });

                              surnameOnChange({
                                target: {
                                  name: "surname",
                                  value: "",
                                },
                              });

                              usernameOnChange({
                                target: {
                                  name: "username",
                                  value: "",
                                },
                              });

                              passwordOnChange({
                                target: {
                                  name: "password",
                                  value: "",
                                },
                              });
                            }}
                          >
                            Kullanıcı Ekle
                          </Button>

                          {renderForPermission(
                            profile.type,
                            "PoolsSettings.UpdatePoolButton"
                          ) && (
                            <Button
                              type={"button"}
                              variant={"primary"}
                              className={"mr-2 mb-2"}
                              onClick={() => {
                                handleUpdatePool(pool);
                                // setSelectedPool(pool);
                                // setUpdateModalPool(true);

                                poolTitleOnChange({
                                  target: {
                                    name: "poolTitle",
                                    value: pool.title,
                                  },
                                });
                                commissionRatePoolOnChange({
                                  target: {
                                    name: "commissionRate",
                                    value: pool.commissionRate || 0,
                                  },
                                });
                                dailyDepositLimitOnChange({
                                  target: {
                                    name: "dailyDepositLimit",
                                    value: pool.depositLimit,
                                  },
                                });
                                dailyWithdrawLimitOnChange({
                                  target: {
                                    name: "dailyWithdrawLimit",
                                    value: pool.withdrawLimit,
                                  },
                                });
                              }}
                            >
                              Düzenle
                            </Button>
                          )}

                          {renderForPermission(
                            profile.type,
                            "PoolsSettings.DeletePoolButton"
                          ) && (
                            <Button
                              type={"button"}
                              variant={"danger"}
                              className={"mr-2 mb-2"}
                              onClick={() => {
                                deleteSubmit(pool._id);
                              }}
                            >
                              Sahayı Sil
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="mb-4">
                          Yatırım: {pool?.currentDeposit}TL /{" "}
                          {pool?.depositLimit}TL
                          <div
                            id="progress"
                            className="bg-gray-300 h-2 rounded-lg"
                            style={{ width: "50%", height: 15 }}
                          >
                            <div
                              className="bg-green-500 h-2 rounded-lg"
                              style={{
                                width: `${Math.min(
                                  (pool?.currentDeposit / pool?.depositLimit) *
                                    100,
                                  100
                                )}%`,
                                margin: 10,
                                backgroundColor: `green`,
                                height: "100%",
                                marginLeft: 0,
                              }}
                            ></div>
                          </div>
                        </p>
                        <p>
                          Çekim: {pool?.currentWithdraw}TL /{" "}
                          {pool?.withdrawLimit}TL
                        </p>

                        <div
                          id="progress"
                          className="bg-gray-300 h-2 rounded-lg"
                          style={{ width: "50%", height: 15 }}
                        >
                          <div
                            className="bg-green-500 h-2 rounded-lg"
                            style={{
                              width: `${Math.min(
                                (pool?.currentWithdraw / pool?.withdrawLimit) *
                                  100,
                                100
                              )}%`,
                              margin: 10,
                              backgroundColor: `green`,
                              height: "100%",
                              marginLeft: 0,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <Table tableHead={TABLE_HEAD} tableRows={tableRows} />
                  </div>
                );
              })}
              <Modal
                show={twoFaModal}
                className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
                handleModal={handleTwoFaModal}
              >
                <Modal.Header handleModal={handleTwoFaModal}>
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
                show={updateModalPool}
                className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
                handleModal={handleUpdateModalPool}
              >
                <form onSubmit={updatePoolRequest}>
                  <Modal.Header handleModal={handleUpdateModalPool}>
                    <h1 className="font-semibold">
                      {selectedPool?.title || "İsimsiz Saha"} için Saha Düzenle
                    </h1>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="md-5 w-full mb-2">
                      <Input
                        type={"text"}
                        name={"poolTitle"}
                        label={"Saha İsmi"}
                        placeholder={"Saha İsmi"}
                        value={poolTitle}
                        onChange={poolTitleOnChange}
                        className={"md-5"}
                      />
                    </div>
                    <div className="md:flex md:gap-2 mt-4">
                      <div className="md-5 w-full">
                        <Input
                          type={"number"}
                          name={"dailyDepositLimit"}
                          label={"Günlük Yatırım Limiti"}
                          placeholder={"Günlük Yatırım Limiti"}
                          autoFocus={true}
                          value={
                            dailyDepositLimit || selectedPool?.depositLimit
                          }
                          onChange={dailyDepositLimitOnChange}
                          className={"md-5"}
                        />
                      </div>
                      <div className="md-5 w-full">
                        <Input
                          type={"number"}
                          name={"dailyWithdrawLimit"}
                          label={"Günlük Çekim Limiti"}
                          placeholder={"Günlük Çekim Limiti"}
                          autoFocus={false}
                          value={
                            dailyWithdrawLimit || selectedPool?.withdrawLimit
                          }
                          onChange={dailyWithdrawLimitOnChange}
                          className="md-5"
                        />
                      </div>
                      <div className="md-5 w-full">
                        <Input
                          type={"number"}
                          name={"comissionRatePool"}
                          label={"Komisyon Oranı (Yüzdelik)"}
                          placeholder={"Komisyon Oranı (Yüzdelik)"}
                          autoFocus={false}
                          value={
                            commissionRatePool || selectedPool?.commissionRate
                          }
                          onChange={commissionRatePoolOnChange}
                          className="md-5"
                        />
                      </div>
                    </div>
                    {websites && (
                      <div className="col-sm-6">
                        Website
                        <div className="form-group">
                          <Select
                            value={selectedPool?.targetWebsites?.map((e) => {
                              const website = websites.find((w) => w._id === e);

                              return {
                                label: website.username,
                                value: website._id,
                              };
                            })}
                            options={websites.map((e) => ({
                              label: e.username,
                              value: e._id,
                            }))}
                            isMulti={true}
                            onChange={(e) =>
                              setSelectedPool((prev) => ({
                                ...prev,
                                targetWebsites: e.map((c) => c.value),
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}
                    <div className="w-ful mt-5">
                      <select
                        name="isEnabled"
                        id="isEnabled"
                        className="w-full rounded-md py-3 border-gray-300"
                        value={isEnabled || selectedPool?.enabled}
                        onChange={handleIsEnabled}
                      >
                        <option disabled>Durumu Seçiniz</option>
                        <option value="true">Aktif</option>
                        <option value="false">Pasif</option>
                      </select>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      type={"submit"}
                      variant={"primary"}
                      className={"w-full py-4 lg:py-5"}
                    >
                      Sahayı Düzenle
                    </Button>
                  </Modal.Footer>
                </form>
              </Modal>
              <Modal
                show={modalPoolTransfer}
                className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
                handleModal={handleModalPoolTransfer}
              >
                <form onSubmit={cloneSubmit}>
                  <Modal.Header handleModal={handleModalPoolTransfer}>
                    <h1 className="font-semibold">
                      {selectedUser?.firstName} {selectedUser?.lastName}
                      {" - "}
                      {selectedUser?.username}
                      için Saha Transfer İşlemi
                    </h1>
                  </Modal.Header>
                  <Modal.Body>
                    <select
                      name="user-type"
                      id="user-type"
                      className="w-full rounded-md py-3 border-gray-300"
                      onChange={(e) => setSelectedTransferPool(e.target.value)}
                    >
                      {pools
                        .filter((e) => e._id !== selectedUser?.pool?._id)
                        .map((pool, index) => (
                          <option
                            key={pool}
                            value={pool._id}
                            className="text-dark"
                          >
                            {pool.title || "İsimsiz Saha"}
                          </option>
                        ))}
                    </select>
                  </Modal.Body>
                  <Modal.Footer>
                    <div className="md:flex md:gap-1">
                      <Button
                        type={"submit"}
                        variant={"primary"}
                        className={"w-full py-4 lg:py-5 mt-3"}
                      >
                        Sahayı Kaydet
                      </Button>
                      <Button
                        type={"submit"}
                        variant={"danger"}
                        className={"w-full py-4 lg:py-5 mt-3"}
                      >
                        Sahayı Kaldır
                      </Button>
                    </div>
                  </Modal.Footer>
                </form>
              </Modal>
              <Modal
                show={createModalPool}
                className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
                handleModal={handleCreatePoolModal}
              >
                <form onSubmit={createSubmit}>
                  <Modal.Header handleModal={handleCreatePoolModal}>
                    <h1 className="font-semibold">Yeni Saha Hesabı Aç</h1>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="md-5 w-full mb-2">
                      <Input
                        type={"text"}
                        name={"poolTitle"}
                        label={"Saha İsmi"}
                        placeholder={"Saha İsmi"}
                        value={poolTitle}
                        onChange={poolTitleOnChange}
                        className={"md-5"}
                      />
                    </div>
                    <div className="md:flex md:gap-2 mt-2">
                      <div className="md-5 w-full">
                        <Input
                          type={"number"}
                          name={"dailyDepositLimit"}
                          label={"Günlük Yatırım Limiti"}
                          placeholder={"Günlük Yatırım Limiti"}
                          autoFocus={true}
                          value={dailyDepositLimit}
                          onChange={dailyDepositLimitOnChange}
                          className={"md-5"}
                        />
                      </div>

                      <div className="md-5 w-full">
                        <Input
                          type={"number"}
                          name={"dailyWithdrawLimit"}
                          label={"Günlük Çekim Limiti"}
                          placeholder={"Günlük Çekim Limiti"}
                          autoFocus={false}
                          value={dailyWithdrawLimit}
                          onChange={dailyWithdrawLimitOnChange}
                          className="md-5"
                        />
                      </div>

                      <div className="md-5 w-full">
                        <Input
                          type={"number"}
                          name={"commissionRatePool"}
                          label={"Komisyon Oranı (Yüzdelik)"}
                          placeholder={"Komisyon Oranı (Yüzdelik)"}
                          autoFocus={false}
                          value={commissionRatePool}
                          onChange={commissionRatePoolOnChange}
                          className="md-5"
                        />
                      </div>
                    </div>
                    <div className="md-5 w-full mt-2">
                      <Select
                        className="pt-3"
                        options={websites.map((e, i) => ({
                          label: e.username,
                          value: e._id,
                        }))}
                        isMulti
                        onChange={(e) =>
                          setTargetWebsites(e.map((c) => c.value))
                        }
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      type={"submit"}
                      variant={"primary"}
                      className={"w-full py-4 lg:py-5"}
                      onClick={() => setCreateModalPool(true)}
                    >
                      Saha Aç
                    </Button>
                  </Modal.Footer>
                </form>
              </Modal>
              <Modal
                show={addUserModal}
                className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
                handleModal={handleAddUserModal}
              >
                <form onSubmit={addUserSubmit}>
                  <Modal.Header handleModal={handleAddUserModal}>
                    <h1 className="font-semibold">Yeni Kullanıcı Aç</h1>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="md:flex md:gap-2 mb-3">
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
                        label={"Soyad"}
                        placeholder={"Soyad"}
                        autoFocus={false}
                        value={surname}
                        onChange={surnameOnChange}
                      />
                    </div>
                    <div className="md:flex md:gap-2">
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
                        label={"Şifre"}
                        placeholder={"Şifre"}
                        autoFocus={false}
                        value={password}
                        onChange={passwordOnChange}
                      />
                    </div>
                    <select
                      name="user-type"
                      id="user-type"
                      className="w-full mt-3 rounded-md py-4 border-gray-300"
                      value={userType}
                      onChange={handleUserTypeChange}
                    >
                      <option value="">Kullanıcı Rolü Seçiniz</option>
                      {renderForPermission(
                        profile.type,
                        "PoolsSettings.CreateUserForSuperAdmin"
                      ) && <option value="super_admin">Süper Admin</option>}
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      type={"submit"}
                      variant={"primary"}
                      className={"w-full py-4 lg:py-5"}
                      disabled={
                        !isFormValid || createPoolUserMutation.isLoading
                      }
                    >
                      Kullanıcıyı Oluştur
                    </Button>
                  </Modal.Footer>
                </form>
              </Modal>
            </>
          );
        }}
      </Await>
      <Dialog
        show={dialog}
        title={dialogTitle}
        message={dialogMessage}
        handleDialog={handleDialog}
      />
    </Suspense>
  );
};

export const loader = async ({ request }) => {
  const token = RemoteController.getToken();
  const remoteToken = localStorage.getItem("remoteToken");
  const params = {
    token: token,
    remoteToken: remoteToken,
  };
  const pools = await new HttpRequest("api").get("pool", params);
  const users = await new HttpRequest("api").get("users", params);

  return {
    pools,
    users: users
      .filter((e) => !e.pool)
      .filter((e) => e.type !== "website" && e.type !== "website_admin"),
  };
};

export default PoolSettingsPageBanka;
