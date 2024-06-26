import Table from "../../components/ui/Table";
import { Suspense, useState } from "react";
import { useQuery } from "react-query";
import Cookies from "js-cookie";
import Button from "../../components/ui/Button";
import { PERMISSIONS } from "../../consts/Permissions";
import HttpRequest from "../../utils/HttpRequest";
import { Await, useLoaderData } from "react-router-dom";
import * as RemoteController from "../../remoteControl";
import { useMutation } from "react-query";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Dialog from "../../components/ui/Dialog";
import Input from "../../components/ui/Input";
import useInput from "../../hooks/useInput";

const getPools = async (poolsParams) =>
  await new HttpRequest("api").get(
    `pool?token=${poolsParams.queryKey[1].token}&remoteToken=${poolsParams.queryKey[1].remoteToken}`
  );

const getUserByUsers = async (usersParams) =>
  await new HttpRequest("api").get(
    `users/get-by-pool?token=${usersParams.queryKey[1].token}&remoteToken=${usersParams.queryKey[1].remoteToken}&pool=${usersParams.queryKey[1].pool}`
  );

const set2fa = async (payload) =>
  await new HttpRequest("api").post("users/set-2fa", payload);

const remove2fa = async (payload) =>
  await new HttpRequest("api").post("users/remove-2fa", payload);

const deleteUser = async (payload) =>
  await new HttpRequest("api").post("users/delete", payload);

const TABLE_HEAD = [
  "ID",
  "KULLANICI ADI",
  "AD SOYAD",
  "TÜR",
  "YETKİLER",
  "İŞLEMLER",
];

const searchUsers = async (search) =>
  await new HttpRequest("api").get(`users/search/${search}`);

const UsersPage = () => {
  const loaderData = useLoaderData();
  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [qrcodeImage, setQrCodeImage] = useState(null);
  const [modalQR, setModalQR] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const token = Cookies.get("token");
  const handleModalQR = () => setModalQR(!modalQR);
  const remoteToken = localStorage.getItem("remoteToken");
  const [users, setUsers] = useState([]);
  const [pools, setPools] = useState([]);
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const handleSelectedPoolIdChange = (event) => {
    setSelectedPoolId(event.target.value);
  };
  const handleDialog = () => setDialog(!dialog);
  const profile = JSON.parse(localStorage.getItem("profile"));

  const {
    state: { value: search, isValid: isSearchValid },
    handleOnChange: handleSearchOnChange,
  } = useInput();

  const set2faMutation = useMutation(set2fa, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        handleDialog();
        setDialogTitle("Error");
        setDialogMessage("2FA ayarlanamadı.");
      }

      if (data.status === "success") {
        setQrCodeImage(data.data_url);
        handleModalQR();
      }
    },
  });

  const handleSet2Fa = (userId) => {
    set2faMutation.mutate({
      token: token,
      userId: userId,
    });
  };

  const remove2faMutation = useMutation(remove2fa, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        setDialog(true);
        setDialogTitle("Error");
        setDialogMessage(data.message);
      }
      if (data.status === "success") {
        window.location.reload();
      }
    },
  });

  const handleRemove2Fa = (userId) => {
    remove2faMutation.mutate({
      token: token,
      userId: userId,
    });
  };

  const deleteUserMutation = useMutation(deleteUser, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        handleDialog();
        setDialogTitle("Error");
        setDialogMessage("Kullanıcı silme işlemi başarısız oldu.");
      }

      if (data.status === "success") {
        window.location.reload();
      }
    },
  });

  const handledeleteUser = (userId) => {
    deleteUserMutation.mutate({
      token,
      remoteToken,
      _id: userId,
    });

    // deleteUserMutation.mutate({
    //   token: token,
    //   remoteToken: remoteToken,
    //   _id: userId,
    // });success-deposit
  };

  useQuery(["searchUsers", search], {
    queryFn: async () => {
      if (isSearchValid) {
        const response = await searchUsers(search);

        setSearchedUsers(response.data.users);
      }
    },
  });

  // if (isSearchedUsersLoading) return <Spinner />;

  const poolsParams = {
    token: RemoteController.getToken(),
    remoteToken: localStorage.getItem("remoteToken"),
  };

  const { isLoading: isPoolsDataLoading, refetch: refetchPools } = useQuery(
    ["getTransactions", poolsParams],
    {
      refetchOnWindowFocus: false,
      queryFn: async (data) => {
        const pools = await getPools(data);
        setPools(pools);
        refetchPools();
      },
    }
  );

  const usersParams = {
    token: RemoteController.getToken(),
    remoteToken: localStorage.getItem("remoteToken"),
    pool: selectedPoolId,
  };

  const { isLoading: isUsersDataLoading, refetch: refetchUsers } = useQuery(
    ["getUsers", usersParams],
    {
      refetchOnWindowFocus: false,
      queryFn: async (data) => {
        const users = await getUserByUsers(data);
        setUsers(users);
        refetchUsers();
      },
    }
  );

  return (
    <Suspense fallback={"Loading..."}>
      <Await resolve={loaderData}>
        {(resolveData) => {
          let tableRows;

          if (!searchedUsers || searchedUsers.length === 0 || !isSearchValid)
            tableRows = users.map((user, index) => ({
              WEBSITE: index + 1,
              "KLLANICI ADI": user.username,
              "AD SOYAD": user.firstName + " " + user.lastName,
              TÜR: user.type,
              YETKİLER: (
                <div className="flex flex-wrap justify-between gap-2">
                  {Object.keys(user?.permissions).map(
                    (key) =>
                      PERMISSIONS[key]?.name && (
                        <span
                          className="bg-black text-white rounded-full py-2 px-3"
                          key={key}
                          type={"button"}
                          variant={"primary"}
                        >
                          {PERMISSIONS[key]?.name}
                        </span>
                      )
                  )}
                </div>
              ),
              "İŞLEM GEÇMİŞİ": (
                <div className="flex justify-between gap-3">
                  {!user?.secret && (
                    <Button
                      type={"button"}
                      onClick={() => {
                        handleSet2Fa(user._id);
                      }}
                    >
                      2FA Ayarla
                    </Button>
                  )}
                  {user?.secret && (
                    <Button
                      type={"button"}
                      onClick={() => {
                        handleRemove2Fa(user._id);
                      }}
                    >
                      <span className="text-red-500 hover:text-red-700">
                        2FA Kaldır
                      </span>
                    </Button>
                  )}
                  <Button type={"button"}>
                    <span className="text-red-500 hover:text-red-700">
                      Yatırım Geçmişi
                    </span>
                  </Button>
                  <Button type={"button"}>
                    <span className="text-green-500 hover:text-green-700">
                      Çekim Geçmişi
                    </span>
                  </Button>
                  <Button
                    type={"button"}
                    variant={"danger"}
                    className={"!py-1 !px-2"}
                    onClick={() => handledeleteUser(user._id)}
                  >
                    Kullanıcıyı Sil
                  </Button>
                </div>
              ),
            }));
          else
            tableRows = searchedUsers?.map((user, index) => ({
              WEBSITE: index + 1,
              "KLLANICI ADI": user.username,
              "AD SOYAD": user.firstName + " " + user.lastName,
              TÜR:
                user.type === "super_admin"
                  ? "Süper Admin"
                  : user.type === "admin"
                  ? "Admin"
                  : "User",
              YETKİLER: (
                <div className="flex flex-wrap justify-between gap-2">
                  {Object.keys(user?.permissions).map(
                    (key) =>
                      PERMISSIONS[key]?.name && (
                        <Button key={key} type={"button"} variant={"primary"}>
                          {PERMISSIONS[key]?.name}
                        </Button>
                      )
                  )}
                </div>
              ),
              "İŞLEM GEÇMİŞİ": (
                <div className="flex justify-between gap-3">
                  {!user?.secret && (
                    <Button
                      type={"button"}
                      onClick={() => {
                        handleSet2Fa(user._id);
                      }}
                    >
                      2FA Ayarla
                    </Button>
                  )}
                  {user?.secret && (
                    <Button
                      type={"button"}
                      onClick={() => {
                        handleRemove2Fa(user._id);
                      }}
                    >
                      <span className="text-red-500 hover:text-red-700">
                        2FA Kaldır
                      </span>
                    </Button>
                  )}
                  <Button type={"button"}>
                    <span className="text-red-500 hover:text-red-700">
                      Yatırım Geçmişi
                    </span>
                  </Button>
                  <Button type={"button"}>
                    <span className="text-green-500 hover:text-green-700">
                      Çekim Geçmişi
                    </span>
                  </Button>
                  <Button
                    type={"button"}
                    variant={"danger"}
                    className={"!py-1 !px-2"}
                    onClick={() => handledeleteUser(user._id)}
                  >
                    Kullanıcıyı Sil
                  </Button>
                </div>
              ),
            }));

          return (
            <>
              <div className="flex gap-2">
                <div className="mb-6 flex-grow">
                  <section className="">
                    <Input
                      type={"text"}
                      name={"search"}
                      placeholder={"Kullanıcı ara"}
                      label={"Kullanıcı ara"}
                      value={search}
                      onChange={handleSearchOnChange}
                      // className={"!w-auto"}
                    />
                  </section>
                  {searchedUsers.length === 0 && isSearchValid && (
                    <p className="mb-4">
                      Aradığınız kullanıcı adına göre bır kriter bulunamadı.
                    </p>
                  )}
                </div>
                {profile?.type === "god" && (
                  <div className="mb-6 flex-grow">
                    <select
                      name="user-type"
                      id="user-type"
                      className="w-full rounded-md py-3 border-gray-300"
                      value={selectedPoolId}
                      onChange={handleSelectedPoolIdChange}
                    >
                      <option disabled>Saha Seçiniz</option>
                      <option value="">Hepsi</option>
                      {pools?.map((pool, index) => (
                        <option
                          key={pool._id}
                          value={pool._id}
                          className="text-dark"
                        >
                          {pool.title || "İsimsiz Saha" + (index + 1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <Table tableHead={TABLE_HEAD} tableRows={tableRows} />
              <Modal
                show={modalQR}
                className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
                handleModal={handleModalQR}
              >
                <Modal.Header handleModal={handleModalQR}>
                  <h1 className="font-bold text-lg">QR Kodunuz</h1>
                </Modal.Header>
                <Modal.Body>
                  <div className="flex justify-center">
                    {qrcodeImage && (
                      <img
                        width={300}
                        height={300}
                        src={qrcodeImage}
                        alt="QR Code"
                      />
                    )}
                    {!qrcodeImage && <Spinner />}
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <a
                    href={qrcodeImage}
                    download="qrcode.png"
                    type="button"
                    className="btn btn-secondary"
                  >
                    <Button
                      type={"button"}
                      variant={"primary"}
                      className={"mr-2 mb-2 w-full py-3"}
                    >
                      <FontAwesomeIcon
                        icon={faDownload}
                        size="lg"
                        className="text-white cursor-pointer mr-2"
                      />
                      <span>İndir</span>
                    </Button>
                  </a>
                </Modal.Footer>
              </Modal>
              <Dialog
                show={dialog}
                title={dialogTitle}
                message={dialogMessage}
                handleDialog={handleDialog}
              />
            </>
          );
        }}
      </Await>
    </Suspense>
  );
};

export default UsersPage;
