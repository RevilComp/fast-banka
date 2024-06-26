import { Suspense, useState, useRef, useEffect } from "react";
import Table from "../../components/ui/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import Button from "../../components/ui/Button";
import * as RemoteController from "../../remoteControl";
import useInput from "../../hooks/useInput";
import Input from "../../components/ui/Input";
import HttpRequest from "../../utils/HttpRequest";
import { Await, useLoaderData } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";
import Datepicker from "react-tailwindcss-datepicker";
import Card from "../../components/ui/Card";
import ReactToPrint from "react-to-print";
import moment from "moment";
import { useMutation, useQuery } from "react-query";
import Modal from "../../components/ui/Modal";
import Cookies from "js-cookie";
import io from "socket.io-client";
import Confirm from "../../components/ui/Confirm";
import Dialog from "../../components/ui/Dialog";

const getTransactions = async (usersData, limit, skip) =>
  await new HttpRequest("api").get(
    `transactions?token=${usersData.queryKey[1].token}&type=${usersData.queryKey[1].type}&startDate=${usersData.queryKey[1].startDate}&endDate=${usersData.queryKey[1].endDate}&papara=${usersData.queryKey[1].papara}&search=${usersData.queryKey[1].search}&status=${usersData.queryKey[1].status}&pool=${usersData.queryKey[1].pool}&websiteId=${usersData.queryKey[1].websiteId}`,
    {
      ...(limit && !usersData.queryKey[1].search && { limit }),
      ...(skip && !usersData.queryKey[1].search && { skip }),
    }
  );

const getTransactionSummary = async (usersData) =>
  await new HttpRequest("api").get(
    `transactions/gettransactionsummary?token=${usersData.queryKey[1].token}&type=${usersData.queryKey[1].type}&startDate=${usersData.queryKey[1].startDate}&endDate=${usersData.queryKey[1].endDate}&papara=${usersData.queryKey[1].papara}&status=${usersData.queryKey[1].status}&pool=${usersData.queryKey[1].pool}&websiteId=${usersData.queryKey[1].websiteId}`
  );

const editTransaction = async (payload) =>
  await new HttpRequest("api").post("transactions/edittransaction", payload);

const validateRejectTransaction = async (payload) =>
  await new HttpRequest("api").post(
    "transactions/verifyrejectdeposit",
    payload
  );

const removeTransaction = async (payload) =>
  await new HttpRequest("api").post("transactions/remove", payload);

const getPools = async (poolsParams) =>
  await new HttpRequest("api").get(
    `pool?token=${poolsParams.queryKey[1].token}&remoteToken=${poolsParams.queryKey[1].remoteToken}`
  );

const getWebsiteUsers = async (query) =>
  await new HttpRequest("api").get("users/website-users", {
    token: query.queryKey[1].token,
  });
const TABLE_HEAD = [
  "SITE",
  "ID",
  "İŞLEMLER",
  "AD SOYAD",
  "MİKTAR",
  "BANKA",
  "KULLANICI ADI",
  "TESLİM ZAMANI",
  "İŞLEM ZAMANI",
  "ONAY KODU",
];

const RejectionDepositPage = () => {
  const [transactionData, setTransactionData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [banksData] = useState([]);
  const [selectedTransactionData] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [modalBankAccounts, setModalBankAccounts] = useState(false);
  const printRef = useRef();
  const loaderData = useLoaderData();
  const [, setIsConnected] = useState();
  const [socket, setSocket] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const selectedUser = urlParams.get("ltd") || null;
  const PAGE_SIZE = 20;
  const [hasNext, setHasNext] = useState(true);
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [pools, setPools] = useState([]);
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [websiteUsers, setWebsiteUsers] = useState([]);
  const [search, setSearch] = useState("");

  const handleSelectedPoolIdChange = (event) => {
    setTransactionData([]);
    setSelectedPoolId(event.target.value);
    setPage(0);
    setHasNext(true);
  };

  const handleSelectedWebsiteId = (event) => {
    setTransactionData([]);
    setSelectedWebsiteId(event.target.value);
    setPage(0);
    setHasNext(true);
  };

  const handleDialog = () => setDialog(!dialog);
  const handleCloseConfirm = () => setConfirm(false);
  const handleOpenConfirm = () => setConfirm(true);

  const profile = JSON.parse(localStorage.getItem("profile"));

  useEffect(() => {
    const socketC = io(process.env.REACT_APP_SOCKET_URL, {
      query: {
        type: "admin",
        token: Cookies.get("token"),
      },
    });
    setSocket(socketC);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("transaction:deposit:update", (transaction) => {
        if (selectedUser) return false;
        if (transaction.status !== 2)
          return setTransactionData((prev) =>
            prev.filter((item) => item._id !== transaction._id)
          );
        setTransactionData((prev) => [transaction, ...prev]);
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("pong");
      };
    }
  }, [socket, selectedUser]);

  const {
    state: { value: searchText },
    handleOnChange: searchOnChange,
  } = useInput();
  const {
    state: { value: fullName },
    handleOnChange: fullNameOnChange,
  } = useInput();

  useEffect(() => {
    if (searchText === "") {
      return setSearch(searchText);
    }

    const delayDebounceFn = setTimeout(() => {
      setSearch(searchText);
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const {
    state: { value: transactionUId },
    handleOnChange: transactionUIdOnChange,
  } = useInput();

  const {
    state: { value: userIdInWebsite },
    handleOnChange: userIdInWebsiteOnChange,
  } = useInput();

  const {
    state: { value: amount },
    handleOnChange: amountOnChange,
  } = useInput();

  const [dateRange, setDateRange] = useState({
    startDate: moment().startOf("day"),
    endDate: moment().endOf("day"),
  });

  const [newDateRange, setNewDateRange] = useState({
    startDate: moment().startOf("day"),
    endDate: moment().endOf("day"),
  });

  const poolsParams = {
    token: RemoteController.getToken(),
    remoteToken: localStorage.getItem("remoteToken"),
  };

  const { refetch: refetchPools } = useQuery(["pools", poolsParams], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      const pools = await getPools(data);
      setPools(pools);
      refetchPools();
    },
  });

  const handleModalBankAccounts = () =>
    setModalBankAccounts(!modalBankAccounts);

  const handleValueChange = (newValue) => {
    setTransactionData([]);
    setHasNext(true);
    setPage(0);

    const formattedStartDate = moment(newValue.startDate).format("YYYY-MM-DD");
    const formattedEndDate = moment(newValue.endDate).format("YYYY-MM-DD");

    setDateRange({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });
  };

  const handleNewValueChange = (newValue) => {
    const formattedStartDate = moment(newValue.startDate).format("YYYY-MM-DD");
    const formattedEndDate = moment(newValue.endDate).format("YYYY-MM-DD");

    setNewDateRange({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });
  };

  const token = RemoteController.getToken();
  const papara = localStorage.getItem("mode") === "papara" ? true : false;

  const transactionParams = {
    token: token,
    type: "deposit",
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    papara,
    search: search ? search : "",
    status: 2,
    pool: selectedPoolId,
    websiteId: selectedWebsiteId,
  };

  const { isLoading: isTransactionDataLoading, refetch: refetchTransaction } =
    useQuery(["getTransactions", transactionParams], {
      refetchOnWindowFocus: false,
      queryFn: async (data) => {
        const response = await getTransactions(
          data,
          PAGE_SIZE,
          page * PAGE_SIZE
        );
        if (search) {
          setHasNext(true);
          setPage(0);
          return setSearchData(response);
        }
        if (page === 0) {
          setTransactionData(response);
        } else {
          setTransactionData((prev) => [...prev, ...response]);
        }
        setPage((prev) => prev + 1);
        if (!response?.length) {
          setHasNext(false);
        }
      },
    });

  const transactionSummaryParams = {
    token: token,
    type: "deposit",
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    papara,
    status: 2,
    pool: selectedPoolId,
    websiteId: selectedWebsiteId,
  };

  useQuery(["getTransactionsSummary", transactionSummaryParams], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      const transactionSummary = await getTransactionSummary(data);
      setTransactionSummary(transactionSummary);
      // refetchTransactionSummary();
    },
  });

  const bankAccountsArray = Object.values(banksData);

  const createUserMutation = useMutation(editTransaction, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        setDialogTitle("Error");
        setDialogMessage(data.message || "İşlem başarısız oldu.");

        handleDialog();
      } else {
        window.location.reload();
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    createUserMutation.mutate({
      _id: selectedTransactionData._id,
      token: Cookies.get("token"),
      bankAccountId: selectedBankId || selectedTransactionData.bankAccountId,
      nameSurname: fullName || selectedTransactionData.nameSurname,
      amount: amount || selectedTransactionData.amount,
      transactionId: transactionUId || selectedTransactionData.transactionId,
      userIdInWebsite:
        userIdInWebsite || selectedTransactionData.userIdInWebsite,
      transactionTime:
        newDateRange.startDate || selectedTransactionData.updatedAt,
      website: selectedTransactionData.website,
    });

    handleModalBankAccounts();
  };

  const validateRejectTransactionMutation = useMutation(
    validateRejectTransaction,
    {
      onSuccess: (data) => {
        if (data.status === "fail") {
          setDialogTitle("Error");
          setDialogMessage(data.message || "İşlem başarısız oldu.");

          handleDialog();
        } else {
          window.location.reload();
        }
      },
    }
  );

  const handleValidateRejectTransaction = (userId, status) => {
    validateRejectTransactionMutation.mutate({
      token: token,
      _id: userId,
      status: 2,
      type: "deposit",
    });
  };

  const removeTransactionMutation = useMutation(removeTransaction, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        setDialogTitle("Error");
        setDialogMessage(data.message || "İşlem başarısız oldu.");

        handleDialog();
      } else {
        window.location.reload();
      }
    },
  });

  const handleRemoveTransaction = (transactionId, status) => {
    removeTransactionMutation.mutate({
      token: Cookies.get("token"),
      _id: transactionId,
    });
  };

  useQuery(["websiteUsers", poolsParams], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      if (profile.type !== "god") return;
      const websites = await getWebsiteUsers(data);
      setWebsiteUsers(websites);
    },
  });

  return (
    <>
      <Suspense fallback={<Spinner />}>
        <Await resolve={loaderData}>
          {(resolvedData) => {
            const tableRows = (search ? searchData : transactionData).map(
              (data) => ({
                SITE: data.websiteCodeS,
                ID: data.transactionId,
                İŞLEMLER: "",
                "AD SOYAD": data.nameSurname,
                MİKTAR: `${data.amount} TRY`,
                BANKA: (
                  <span>
                    {data.bankAccountId?.bankName || ""}{" "}
                    {data.bankAccountId?.bankName2
                      ? `(${data.bankAccountId?.bankName2})`
                      : ""}{" "}
                    - {data.bankAccountId?.nameSurname || ""}
                  </span>
                ),
                "KULLANICI ADI": data.user_id,
                "TESLİM ZAMANI": moment(data.createdAt).format(
                  "YYYY-MM-DD HH:mm"
                ),
                "İŞLEM ZAMANI": moment(data.updatedAt).format(
                  "YYYY-MM-DD HH:mm"
                ),
                "ONAY KODU": data?.rejectReason || "YOK",
              })
            );

            return (
              <>
                <Card className={"mb-12"}>
                  <Card.Header>
                    <h1 className="font-bold">İşlem Filtreleme</h1>
                  </Card.Header>
                  <Card.Body>
                    <div className="md:flex md:gap-2">
                      <div className="mt-5 flex-grow">
                        <Datepicker
                          inputClassName={"text-dark w-full rounded py-3"}
                          value={dateRange}
                          onChange={handleValueChange}
                          showShortcuts={true}
                          inputName="date-range"
                        />
                      </div>
                      <div className="mt-5 flex-grow">
                        <Input
                          type={"text"}
                          name={"search"}
                          label={"İşlem Arama"}
                          placeholder={"İşlem Arama"}
                          autoFocus={true}
                          value={searchText}
                          onChange={searchOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                      </div>
                      {profile?.type === "god" && (
                        <div className="mt-5 flex-grow">
                          <select
                            name="user-type"
                            id="user-type"
                            className="w-full rounded-md py-3 border-gray-300"
                            value={selectedPoolId}
                            onChange={handleSelectedPoolIdChange}
                          >
                            <option value="">Saha Seçiniz</option>
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
                      {profile?.type === "god" && (
                        <div className="mt-5 flex-grow">
                          <select
                            name="user-type"
                            id="user-type"
                            className="w-full rounded-md py-3 border-gray-300"
                            value={selectedWebsiteId}
                            onChange={handleSelectedWebsiteId}
                          >
                            <option value="">Site Seçiniz</option>
                            {websiteUsers?.map((website, index) => (
                              <option
                                key={website._id}
                                value={website._id}
                                className="text-dark"
                              >
                                {profile.type === "god"
                                  ? website.firstName + " " + website.username
                                  : website.shortName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
                <div ref={printRef}>
                  <div className="flex justify-between bg-secondary text-white p-4 rounded-t-xl">
                    <h4 className="font-bold">
                      <span className="hidden md:inline">Toplam Miktarı: </span>{" "}
                      <span className="text-success">
                        {transactionSummary?.amount || 0} TRY
                      </span>
                    </h4>
                    <h4 className="font-bold">
                      <span className="hidden md:inline">Toplam Adeti: </span>{" "}
                      <span className="text-success">
                        {transactionSummary?.number || 0}
                      </span>{" "}
                    </h4>
                    <ReactToPrint
                      documentTitle={"Yatırım Rapor"}
                      trigger={() => {
                        return (
                          <FontAwesomeIcon
                            icon={faFilePdf}
                            size="lg"
                            className="text-white cursor-pointer"
                          />
                        );
                      }}
                      content={() => printRef.current}
                    />
                  </div>
                  {isTransactionDataLoading ? (
                    <center className="mt-5">
                      <Spinner />
                    </center>
                  ) : (
                    <Table
                      tableHead={TABLE_HEAD}
                      tableRows={tableRows}
                      next={() => refetchTransaction()}
                      hasNext={hasNext}
                    />
                  )}
                </div>
              </>
            );
          }}
        </Await>
      </Suspense>
      <Modal
        show={modalBankAccounts}
        className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
        handleModal={handleModalBankAccounts}
      >
        <Modal.Header handleModal={handleModalBankAccounts}>
          <h1 className="font-semibold">İşlem Düzenle</h1>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <div className="flex gap-2">
                <Input
                  type={"text"}
                  name={"name"}
                  label={"Kullanıcı Adı Soyadı"}
                  placeholder={"Kullanıcı Adı Soyadı"}
                  autoFocus={true}
                  value={fullName || selectedTransactionData.nameSurname}
                  onChange={fullNameOnChange}
                  classNames={"min-h-5 lg:min-h-5"}
                />
                <Input
                  type={"text"}
                  name={"transactionUId"}
                  label={"İşlem ID"}
                  placeholder={"İşlem ID"}
                  autoFocus={false}
                  value={
                    transactionUId || selectedTransactionData.transactionId
                  }
                  onChange={transactionUIdOnChange}
                  classNames={"min-h-5 lg:min-h-5"}
                />
              </div>

              <div className="flex gap-2 mt-5">
                <Input
                  type={"text"}
                  name={"userIdInWebsite"}
                  label={"Kullanıcı Websitede Id"}
                  placeholder={"Kullanıcı Websitede Id"}
                  autoFocus={false}
                  value={
                    userIdInWebsite || selectedTransactionData.userIdInWebsite
                  }
                  onChange={userIdInWebsiteOnChange}
                  classNames={"min-h-5 lg:min-h-5"}
                />
                <Input
                  type={"number"}
                  name={"amount"}
                  label={"İşlem Tutarı"}
                  placeholder={"İşlem Tutarı"}
                  autoFocus={false}
                  value={amount || selectedTransactionData.amount}
                  onChange={amountOnChange}
                  classNames={"min-h-5 lg:min-h-5"}
                />
              </div>

              <div className="flex gap-2 mt-5">
                <select
                  name="user-type"
                  id="user-type"
                  className="w-full rounded-md py-3 border-gray-300"
                  onChange={(e) => {
                    setSelectedBankId(e.target.value);
                  }}
                >
                  {bankAccountsArray
                    .filter((transaction) => transaction.active === true)
                    .map((bank) => (
                      <option
                        key={bank._id}
                        value={bank._id}
                        className="text-dark"
                      >
                        {bank.bankName || bank.bankName2}
                      </option>
                    ))}
                </select>
                <Datepicker
                  inputClassName={"text-dark w-full rounded py-3"}
                  value={newDateRange || selectedTransactionData.updateAt}
                  onChange={handleNewValueChange}
                  showShortcuts={true}
                  inputName="date-range"
                />
              </div>
            </div>
            <Button
              type={"submit"}
              variant={"primary"}
              className={"w-full py-4 lg:py-5"}
            >
              Düzenle
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex gap-2">
            <Button
              type={"button"}
              variant={"warning"}
              className={"w-full py-4 lg:py-5 bg-[orange] text-white"}
              onClick={() => {
                handleValidateRejectTransaction(
                  selectedTransactionData._id,
                  selectedTransactionData.status
                );

                handleModalBankAccounts();
              }}
            >
              Reddet
            </Button>
            <Button
              type={"button"}
              variant={"danger"}
              className={"w-full py-4 lg:py-5"}
              onClick={() => {
                setConfirmTitle("İşlemi sil");
                setConfirmMessage("İşlemi silmek istediğinizden emin misiniz?");
                handleOpenConfirm();
              }}
            >
              <FontAwesomeIcon
                icon={faTrashCan}
                size="lg"
                className="text-white cursor-pointer mr-2"
              />
              İşlemi Sil
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <Dialog
        show={dialog}
        title={dialogTitle}
        message={dialogMessage}
        handleDialog={handleDialog}
      />
      <Confirm
        show={confirm}
        title={confirmTitle}
        message={confirmMessage}
        handleCloseConfirm={handleCloseConfirm}
        handleConfirm={() =>
          handleRemoveTransaction(selectedTransactionData._id)
        }
      />
    </>
  );
};

export default RejectionDepositPage;
