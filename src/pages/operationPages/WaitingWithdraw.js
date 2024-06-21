import { Suspense, useState, useRef, useEffect } from "react";
import Table from "../../components/ui/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faFilePdf,
  faTrashCan,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../../components/ui/Button";
import * as RemoteController from "../../remoteControl";
import useInput from "../../hooks/useInput";
import Input from "../../components/ui/Input";
import HttpRequest from "../../utils/HttpRequest";
import { Await, useLoaderData } from "react-router-dom";
import Datepicker from "react-tailwindcss-datepicker";
import Card from "../../components/ui/Card";
import ReactToPrint from "react-to-print";
import moment from "moment";
import { useMutation, useQuery } from "react-query";
import Modal from "../../components/ui/Modal";
import Loading from "../../components/ui/loading/Loading";
import Cookies from "js-cookie";
import Spinner from "../../components/ui/Spinner";
import io from "socket.io-client";
import renderForPermission from "../../utils/PermissionLayer";
import Confirm from "../../components/ui/Confirm";
import Dialog from "../../components/ui/Dialog";
import NotificationSound from "../../assets/sounds/notification-sound.mp3";
import toast, { Toaster } from "react-hot-toast";

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

const getWebsiteUsers = async (query) =>
  await new HttpRequest("api").get("users/website-users", {
    token: query.queryKey[1].token,
  });

const forwardWithdrawTransaction = async (payload) =>
  await new HttpRequest("api").post("transactions/forwardwithdraw", payload);

const getBankAccounts = async (bankAccountData) =>
  await new HttpRequest("api").get(
    `bankaccounts/getbyuser?token=${bankAccountData.queryKey[1].token}&userId=${bankAccountData.queryKey[1].userId}`
  );

const getTranscationMovementInfo = async (transcationMovemenData) =>
  await new HttpRequest("api").get(
    `transactions/transcationmovementinfo?token=${transcationMovemenData.queryKey[1].token}&_id=${transcationMovemenData.queryKey[1].transactionId}`
  );

const getTransactionInformation = async (transcationGetOneData) =>
  await new HttpRequest("api").get(
    `transactions/getone?token=${transcationGetOneData.queryKey[1].token}&_id=${transcationGetOneData.queryKey[1].transactionId}`
  );

const getPoolAccounts = async () => {
  const value = await new HttpRequest("api").get(
    `pool?token=${Cookies.get("token")}`
  );

  return value;
};

const editTransaction = async (payload) =>
  await new HttpRequest("api").post("transactions/edittransaction", payload);

const validateRejectTransaction = async (payload) =>
  await new HttpRequest("api").post(
    "transactions/verifyrejectdeposit",
    payload
  );

const removeTransaction = async (payload) =>
  await new HttpRequest("api").post("transactions/remove", payload);

const transferPool = async (payload) =>
  await new HttpRequest("api").post("pool/transfer", payload);

const getPools = async (poolsParams) =>
  await new HttpRequest("api").get(
    `pool?token=${poolsParams.queryKey[1].token}&remoteToken=${poolsParams.queryKey[1].remoteToken}`
  );

const addBotKt = async (payload) => {
  return await new HttpRequest("api").post(
    "transactions/recheck-papara-deposit",
    payload
  );
};

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
];

const WaitingWithdrawPage = () => {
  const [transactionData, setTransactionData] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [, setUserId] = useState("");
  const [, setRejectReasonValue] = useState("");
  const [banksData, setBanksData] = useState([]);
  const [, setTransactionsData] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [selectedTransactionData, setSelectedTransactionData] = useState([]);
  const [selectedBankId] = useState("");
  const [selectedApproveBankId, setSelectedApproveBankId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [selectedTransferPool, setSelectedTransferPool] = useState("");
  const [isTransactionModalVisible, setTransactionModalVisible] =
    useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [selectedApproveTranscation, setSelectedApproveTranscation] =
    useState(null);
  const [socket, setSocket] = useState(null);
  const [, setIsConnected] = useState();
  const urlParams = new URLSearchParams(window.location.search);
  const selectedUser = urlParams.get("ltd") || null;
  const PAGE_SIZE = 20;
  const [hasNext, setHasNext] = useState(true);
  const [page, setPage] = useState(0);
  const [searchData, setSearchData] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const audioPlayer = useRef(null);
  const profile = JSON.parse(localStorage.getItem("profile"));
  const [pools, setPools] = useState([]);
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [websiteUsers, setWebsiteUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showInfoWithdrawModal, setShowInfoWithdrawModal] = useState(false);
  const [selectedInfoTransaction, setSelectedInfoTransaction] = useState(null);

  const {
    state: { value: note },
    handleOnChange: noteOnChange,
  } = useInput();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

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

  const playAudio = () => {
    try {
      audioPlayer.current.play();
    } catch (e) {
      console.log(e);
    }
  };

  const handleInfoModal = (transactionId) => {
    const findTransaction = transactionData.find(
      (transaction) => transaction._id === transactionId
    );
    setSelectedInfoTransaction(findTransaction || null);
    setShowInfoWithdrawModal(true);
  };

  const handleDialog = () => setDialog(!dialog);
  const handleCloseConfirm = () => setConfirm(false);
  const handleOpenConfirm = () => setConfirm(true);
  const handleApproveModal = () => setApproveModal(!approveModal);

  const printRef = useRef();
  const loaderData = useLoaderData();

  const {
    state: { value: searchText },
    handleOnChange: searchOnChange,
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
    state: { value: fullName },
    handleOnChange: fullNameOnChange,
    handleClear: clearFullName,
  } = useInput();

  const {
    state: { value: transactionUId },
    handleOnChange: transactionUIdOnChange,
    handleClear: clearTransactionUId,
  } = useInput();

  const {
    state: { value: amount },
    handleOnChange: amountOnChange,
    handleClear: clearAmount,
  } = useInput();

  const {
    state: { value: rejectReason },
    handleOnChange: rejectReasonOnChange,
  } = useInput();

  const [modalRejectTransaction, setModalRejectTransaction] = useState(false);

  const poolsParams = {
    token: RemoteController.getToken(),
    remoteToken: localStorage.getItem("remoteToken"),
  };

  useQuery(["websiteUsers", poolsParams], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      if (profile.type !== "god") return;
      const websites = await getWebsiteUsers(data);
      setWebsiteUsers(websites);
    },
  });

  const { refetch: refetchPools } = useQuery(["pools", poolsParams], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      const pools = await getPools(data);
      setPools(pools);
      refetchPools();
    },
  });

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

  const validateRejectTransactionMutation = useMutation(
    validateRejectTransaction,
    {
      onSuccess: (data) => {
        if (data.status === "fail") {
          setDialogTitle("Error");
          setDialogMessage(data.message || "İşlem başarısız oldu.");

          handleDialog();
        } else {
          toast("İşlem Başarılı", { icon: "✅" });
        }
      },
    }
  );

  const handleValidateRejectTransaction = () => {
    validateRejectTransactionMutation.mutate({
      token: token,
      _id: selectedApproveTranscation,
      status: 2,
      type: "withdraw",
      rejectReason,
    });
  };

  const validateAcceptTransactionMutation = useMutation(
    validateRejectTransaction,
    {
      onSuccess: (data) => {
        if (data.status === "fail") {
          setDialogTitle("Error");
          setDialogMessage(data.message || "İşlem başarısız oldu.");

          handleDialog();
        } else {
          toast("İşlem Başarılı", { icon: "✅" });
        }
      },
    }
  );

  const handleValidateAcceptTransaction = () => {
    validateAcceptTransactionMutation.mutate({
      token: token,
      _id: selectedApproveTranscation,
      status: 1,
      type: "withdraw",
      selectedBankAccount: selectedApproveBankId,
      description: note,
    });

    setSelectedApproveBankId("");
    setSelectedApproveTranscation(null);
    handleApproveModal();
  };

  const bankAccountData = {
    token: Cookies.get("token"),
    userId: profile._id,
  };

  useQuery(["getBankAccounts", bankAccountData], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      const response = await getBankAccounts(data);
      setBanksData(response);
    },
  });

  useQuery({
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      const response = await getPoolAccounts();
      if (response.status === "fail") return;
      setPoolData(response);
    },
  });

  const transcationMovemenData = {
    token: Cookies.get("token"),
    transactionId: transactionId,
  };

  useQuery(["getTranscationMovementInfo", transcationMovemenData], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      if (!transactionId) return;
      const response = await getTranscationMovementInfo(data);
      setTransactionsData(response);
    },
  });

  const transcationGetOneData = {
    token: Cookies.get("token"),
    transactionId: transactionId,
  };

  useQuery(["getTranscationGetOnetInfo", transcationGetOneData], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      if (!transactionId) return;
      const response = await getTransactionInformation(data);
      setSelectedTransactionData(response);
    },
  });

  const token = RemoteController.getToken();
  const papara = localStorage.getItem("mode") === "papara" ? true : false;

  const transactionParams = {
    token: token,
    type: "withdraw",
    startDate: moment(dateRange.startDate).format("YYYY-MM-DD"),
    endDate: moment(dateRange.endDate).format("YYYY-MM-DD"),
    papara,
    search: search ? search : "",
    status: 0,
    limit: 10,
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
    type: "withdraw",
    startDate: moment(dateRange.startDate).format("YYYY-MM-DD"),
    endDate: moment(dateRange.endDate).format("YYYY-MM-DD"),
    papara,
    status: 0,
    pool: selectedPoolId,
    websiteId: selectedWebsiteId,
  };

  useQuery(["getTransactionsSummary", transactionSummaryParams], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      const transactionSummary = await getTransactionSummary(data);
      setTransactionSummary(transactionSummary);
    },
  });

  const handleEditTransactionModal = (userid, transactions_id) => {
    setUserId(userid);
    setTransactionId(transactions_id);
    setTransactionModalVisible(true);
  };

  const clearTransactionModalInputs = () => {
    clearFullName();
    clearTransactionUId();
    clearAmount();
  };

  const forwardWithdrawTransactionHandle = (transactionId) => {
    forwardWithdrawTransactionMutation.mutate({
      transactionId,
      token: Cookies.get("token"),
    });
  };

  const bankAccountsArray = Object.values(banksData);

  const forwardWithdrawTransactionMutation = useMutation(
    forwardWithdrawTransaction,
    {
      onSuccess: (data) => {},
    }
  );

  const editTransactionMutation = useMutation(editTransaction, {
    onSuccess: (data) => {
      setTransactionId("");
      setTransactionModalVisible(false);
      toast("İşlem Başarılı", { icon: "✅" });
      clearTransactionModalInputs();
      if (data.status === "fail") {
        setDialogTitle("Error");
        setDialogMessage(data.message || "İşlem başarısız oldu.");

        handleDialog();
      } else {
        setTransactionData((prev) =>
          prev.map((transaction) => {
            if (transaction._id === data.transaction._id) {
              return {
                ...transaction,
                ...data.transaction,
              };
            }

            return transaction;
          })
        );
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    editTransactionMutation.mutate({
      _id: selectedTransactionData._id,
      token: Cookies.get("token"),
      bankAccountId: selectedBankId || selectedTransactionData.bankAccountId,
      nameSurname: fullName || selectedTransactionData.nameSurname,
      amount: amount || selectedTransactionData.amount,
      transactionId: transactionUId || selectedTransactionData.transactionId,
    });
  };

  const removeTransactionMutation = useMutation(removeTransaction, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        setDialogTitle("Error");
        setDialogMessage(data.message || "İşlem başarısız oldu.");

        handleDialog();
      } else {
        setTransactionData((prev) =>
          prev.filter((item) => item._id !== data.transaction._id)
        );
      }
    },
  });

  const handleRemoveTransaction = (transactionId, status) => {
    removeTransactionMutation.mutate({
      token: Cookies.get("token"),
      _id: transactionId,
    });
  };

  const transferPoolMutation = useMutation(transferPool, {
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

  const handleTransferPool = (transactionId) => {
    transferPoolMutation.mutate({
      token: Cookies.get("token"),
      transactionId: transactionId,
      poolId: selectedTransferPool,
    });
  };

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

      socket.on("transaction:withdraw", (transaction) => {
        if (selectedUser) return false;
        if (transaction.status !== 0)
          return setTransactionData((prev) =>
            prev.filter((item) => item._id !== transaction._id)
          );

        setTransactionData((prev) => [transaction, ...prev]);
        playAudio();
      });

      socket.on("transaction:withdraw:update", (transaction) => {
        if (selectedUser) return false;
        if (transaction.status !== 0)
          return setTransactionData((prev) =>
            prev.filter((item) => item._id !== transaction._id)
          );
      });

      socket.on("transaction:withdraw:forward", (transaction) => {
        return setTransactionData((prev) =>
          prev.filter((item) => item._id !== transaction._id)
        );
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("pong");
      };
    }
  }, [socket, selectedUser]);

  const addBotKtMutation = useMutation(addBotKt, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        setDialogTitle("Error");
        setDialogMessage(data.message || "İşlem başarısız oldu.");

        handleDialog();
      } else {
        toast("BOT / KT Edildi", { icon: "✅" });
      }
    },
  });

  const handleAddBotKt = (transactionId) => {
    addBotKtMutation.mutate({
      token: Cookies.get("token"),
      _id: transactionId,
    });
  };
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Await resolve={loaderData}>
          {(resolvedData) => {
            if (!resolvedData) return;
            const tableRows = (search ? searchData : transactionData).map(
              (data) => ({
                SITE: data.websiteCodeS,
                ID: data.transactionId,
                İŞLEMLER: (
                  renderForPermission(
                    profile.type,
                    "TransactionsPage.ApproveRejcectButtons"
                  ) && <div className="flex gap-2">
                    <Button
                      type={"button"}
                      variant={"success"}
                      onClick={() => {
                        handleApproveModal();
                        setSelectedApproveTranscation(data._id);
                      }}
                    >
                      Onayla
                    </Button>
                    <Button
                      type={"button"}
                      variant={"danger"}
                      onClick={() => {
                        setSelectedApproveTranscation(data._id);
                        setRejectReasonValue(rejectReason);
                        setModalRejectTransaction(true);
                      }}
                    >
                      Red Ver
                    </Button>

                    {renderForPermission(
                      profile.type,
                      "TransactionsPage.EditTransactionButton"
                    ) && (
                      <Button
                        type={"button"}
                        variant={"success"}
                        onClick={() =>
                          forwardWithdrawTransactionHandle(data._id)
                        }
                      >
                        Yönlendir
                      </Button>
                    )}
                    <Button
                      type={"button"}
                      variant={"primary"}
                      onClick={() => {
                        handleInfoModal(data._id);
                      }}
                    >
                      Info
                    </Button>
                    {renderForPermission(
                      profile.type,
                      "TransactionsPage.EditTransactionButton"
                    ) && (
                      <Button
                        type={"button"}
                        variant={"primary"}
                        onClick={() => {
                          handleEditTransactionModal(data.userId, data._id);
                        }}
                      >
                        Düzenle
                      </Button>
                    )}
                  </div>
                ),
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
                            <option value="">Havuz Seçiniz</option>
                            {pools?.map((pool, index) => (
                              <option
                                key={pool._id}
                                value={pool._id}
                                className="text-dark"
                              >
                                {pool.title || "İsimsiz Havuz" + (index + 1)}
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
                      </span>
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
        show={showInfoWithdrawModal}
        className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
        handleModal={() => setShowInfoWithdrawModal(!showInfoWithdrawModal)}
      >
        <Modal.Header
          handleModal={() => setShowInfoWithdrawModal(!showInfoWithdrawModal)}
        >
          <h1 className="font-semibold">Çekim İşlemi Bilgileri</h1>
        </Modal.Header>
        <Modal.Body>
          <div className="my-5 w-full">
            <div className="flex w-full justify-between mb-2 gap-3">
              <div className="bg-slate-200 p-3 rounded w-1/3 ">Adı Soyadı</div>
              <div className="bg-slate-200 p-3 rounded w-2/3 text-center">
                {selectedInfoTransaction?.nameSurname}
              </div>
            </div>

            <div className="flex w-full justify-between mb-2 gap-3">
              <div className="bg-slate-200 p-3 rounded w-1/3 ">İşlem ID</div>
              <div className="bg-slate-200 p-3 rounded w-2/3 text-center">
                {selectedInfoTransaction?.transactionId}
              </div>
            </div>

            <div className="flex w-full justify-between mb-2 gap-3">
              <div className="bg-slate-200 p-3 rounded w-1/3 ">Banka</div>
              <div className="bg-slate-200 p-3 rounded w-2/3 text-center">
                {selectedInfoTransaction?.bankAccount?.bankName}
              </div>
            </div>

            <div className="flex w-full justify-between mb-2 gap-3">
              <div className="bg-slate-200 p-3 rounded w-1/3 ">
                Hesap Sahibi
              </div>
              <div className="bg-slate-200 p-3 rounded w-2/3 text-center">
                {selectedInfoTransaction?.bankAccount?.nameSurname}
              </div>
            </div>

            <div className="flex w-full justify-between mb-2 gap-3">
              <div className="bg-slate-200 p-3 rounded w-1/3 ">
                Hesap numarası
              </div>
              <div className="bg-slate-200 p-3 rounded w-2/3 text-center">
                {selectedInfoTransaction?.bankAccount?.accountNumber}
              </div>
            </div>

            <div className="flex w-full justify-between mb-2 gap-3">
              <div className="bg-slate-200 p-3 rounded w-1/3">IBAN</div>
              <div className="bg-slate-200 p-3 rounded w-2/3 text-center overflow-x-scroll">
                <span>{selectedInfoTransaction?.bankAccount?.iban}</span>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type={"submit"}
            variant={"danger"}
            className={"w-full py-4 lg:py-5"}
            onClick={() => {
              setShowInfoWithdrawModal(false);
            }}
          >
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={approveModal}
        className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
        handleModal={handleApproveModal}
      >
        <form>
          <Modal.Header handleModal={handleApproveModal}>
            <h1 className="font-semibold">
              İşlemin Yapıldığı Banka Hesabı Seçin
            </h1>
          </Modal.Header>
          <Modal.Body>
            <div className="flex gap-2 mt-5">
              <select
                name="user-type"
                id="user-type"
                className="w-full rounded-md py-3 border-gray-300"
                onChange={(e) => {
                  setSelectedApproveBankId(e.target.value);
                }}
              >
                <option value="" className="text-dark">
                  Lütfen bir banka hesabı seçin
                </option>

                {bankAccountsArray
                  .filter((transaction) => transaction.active === true)
                  .map((bank) => (
                    <option
                      key={bank._id}
                      value={bank._id}
                      className="text-dark"
                    >
                      {bank.bankName} {bank.bankName2} - {bank?.nameSurname}
                    </option>
                  ))}
              </select>

              {selectedApproveBankId !== "" && (
                <Input
                  type={"text"}
                  name={"note"}
                  placeholder={"Notunuz"}
                  label={"Notunuz"}
                  value={note}
                  onChange={noteOnChange}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              disabled={!selectedApproveBankId}
              type={"submit"}
              variant={"danger"}
              className={"w-full py-4 lg:py-5"}
              onClick={() => {
                handleValidateAcceptTransaction();
              }}
            >
              Onayla
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal
        show={modalRejectTransaction}
        className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
        handleModal={setModalRejectTransaction}
      >
        <form>
          <Modal.Header>
            <h1 className="font-semibold">Red Nedeni</h1>
          </Modal.Header>
          <Modal.Body>
            <Input
              type={"text"}
              name={"rejectReason"}
              label={"Red Nedeni"}
              placeholder={"Red Nedeni"}
              autoFocus={true}
              value={rejectReason}
              onChange={rejectReasonOnChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              type={"submit"}
              variant={"danger"}
              className={"w-full py-4 lg:py-5"}
              onClick={() => {
                handleValidateRejectTransaction(); // Red verme işlemini başlat
                setModalRejectTransaction(false);
                setRejectReasonValue("");
              }}
            >
              Red Ver
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
      <Modal
        show={isTransactionModalVisible}
        className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
        handleModal={setTransactionModalVisible}
      >
        <Modal.Header>
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
                {/* <Input
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
                /> */}
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
                {/* <select
                  name="user-type"
                  id="user-type"
                  className="w-full rounded-md py-3 border-gray-300"
                  onChange={(e) => {
                    console.log("target value: ", e.target.value);
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
                </select> */}
                {/* <Datepicker
                  inputClassName={"text-dark w-full rounded py-3"}
                  value={newDateRange || selectedTransactionData.updateAt}
                  onChange={handleNewValueChange}
                  showShortcuts={true}
                  inputName="date-range"
                /> */}
              </div>
            </div>
            {renderForPermission(
              profile.type,
              "WaitingWithdrraw.EditTransactionButton"
            ) && (
              <Button
                type={"submit"}
                variant={"primary"}
                className={"w-full py-4 lg:py-5"}
              >
                Düzenle
              </Button>
            )}

            <Button
              type={"submit"}
              variant={"primary"}
              className={"w-full py-4 lg:py-5"}
            >
              Düzenle
            </Button>
          </form>
          <div className="flex gap-2 mt-5">
            <Button
              type={"button"}
              variant={"danger"}
              className={"w-full py-4 lg:py-5"}
              onClick={() =>
                // handleRemoveTransaction(selectedTransactionData._id)
                {
                  setConfirmTitle("İşlemi sil");
                  setConfirmMessage(
                    "İşlemi silmek istediğinizden emin misiniz?"
                  );
                  handleOpenConfirm();
                }
              }
            >
              <FontAwesomeIcon
                icon={faTrashCan}
                size="lg"
                className="text-white cursor-pointer mr-2"
              />
              İşlemi Sil
            </Button>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div>
            <h1 className="font-bold">İşlem Yönlendirme</h1>
            <div className="flex gap-2 mt-3">
              <Input
                type={"text"}
                name={"selectedGroupName"}
                label={"Mevcut Havuz"}
                placeholder={"Mevcut Havuz"}
                autoFocus={false}
                // value={
                //   "Grup " +
                //   (poolData.findIndex(
                //     (e) => e._id === selectedTransactionData?.pool
                //   ) +
                //     1)
                // }
                classNames={"min-h-5 lg:min-h-5"}
                disabled
              />
              <FontAwesomeIcon
                icon={faArrowRight}
                size="lg"
                className="text-black mt-4"
              />
              <select
                name="user-type"
                id="user-type"
                className="w-full rounded-md py-3 border-gray-300"
                onChange={(e) => {
                  setSelectedTransferPool(e.target.value);
                }}
              >
                {poolData
                  .filter((e) => e._id !== selectedTransactionData?.pool)
                  .map((pool, index) => (
                    <option
                      key={pool._id}
                      value={pool._id}
                      className="text-dark"
                    >
                      {"Grup " + (index + 1)}
                    </option>
                  ))}
              </select>
            </div>
            <Button
              type={"submit"}
              variant={"primary"}
              className={"w-full py-4 lg:py-5 mt-3"}
              onClick={() => handleTransferPool(selectedTransactionData._id)}
            >
              İşlemi Yönlendir
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
      <audio ref={audioPlayer} src={NotificationSound} />
      <Toaster />
    </>
  );
};

export const loader = async ({ request }) => {
  return true;
};
export default WaitingWithdrawPage;
