import { Suspense, useEffect, useState } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import HttpRequest from "../../utils/HttpRequest";
import * as RemoteController from "../../remoteControl";
import { Await, useLoaderData } from "react-router-dom";
import Loading from "../../components/ui/loading/Loading";
import Table from "../../components/ui/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPowerOff,
  faPenToSquare,
  faTrashCan,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { useMutation, useQuery } from "react-query";
import useInput from "../../hooks/useInput";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Dialog from "../../components/ui/Dialog";

const suspendAndActiveAccount = async (payload) => {
  return await new HttpRequest("api").post(
    "bankaccounts/suspendandactiveaccount",
    payload
  );
};

const getPools = async (poolsParams) =>
  await new HttpRequest("api").get(
    `pool?token=${poolsParams.queryKey[1].token}&remoteToken=${poolsParams.queryKey[1].remoteToken}`
  );

const removeBankAccount = async (payload) => {
  return await new HttpRequest("api").post("bankaccounts/remove", payload);
};

const createBankAccount = async (payload) => {
  return await new HttpRequest("api").post("bankaccounts/create", payload);
};

const getAvaibleBankAccounts = async (transactionsData) =>
  await new HttpRequest("api").get(
    `bankaccounts/getavaiblebankaccounts?token=${transactionsData.queryKey[1].token}&papara=${transactionsData.queryKey[1].papara}&pool=${transactionsData.queryKey[1].pool}`
  );

const getSuspendedBankAccounts = async (transactionsData) =>
  await new HttpRequest("api").get(
    `bankaccounts/getsuspendedbankaccounts?token=${transactionsData.queryKey[1].token}&papara=${transactionsData.queryKey[1].papara}&pool=${transactionsData.queryKey[1].pool}`
  );

const getTransactionLimitExceedAccounts = async (transactionsData) =>
  await new HttpRequest("api").get(
    `bankaccounts/gettransactionlimitexceedaccounts?token=${transactionsData.queryKey[1].token}&papara=${transactionsData.queryKey[1].papara}&pool=${transactionsData.queryKey[1].pool}`
  );

const getUsedAccounts = async (transactionsData) =>
  await new HttpRequest("api").get(
    `bankaccounts/usedaccounts?token=${transactionsData.queryKey[1].token}&papara=${transactionsData.queryKey[1].papara}&pool=${transactionsData.queryKey[1].pool}`
  );

const TABLE_HEAD = [
  "ID",
  "BANKA",
  "HESAP SAHİBİ İSMİ",
  "HESAP NUMARASI",
  "BAKİYE",
  "YATIRIM ADETİ",
  "ÇEKİM ADETİ",
  "EKLENDİĞİ TARİH",
  "DÜZENLE",
];

const BankAccountsPageBanka = () => {
  const token = RemoteController.getToken();
  const papara = localStorage.getItem("mode") === "papara" ? true : false;
  const [activeTab, setActiveTab] = useState("open-accounts");
  const loaderData = useLoaderData();
  const [isCreateBankAccountFormValid, setIsCreateBankAccountFormValid] =
    useState(false);
  const [modalBankAccounts, setModalBankAccounts] = useState(false);
  const [bank, setBank] = useState("");
  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [pools, setPools] = useState([]);
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [avaibleBankAccounts, setAvaibleBankAccounts] = useState([]);
  const [suspendedBankAccounts, setSuspendedBankAccounts] = useState([]);
  const [transactionLimitExceedAccounts, setTransactionLimitExceedAccounts] =
    useState([]);
  const [usedAccounts, setUsedAccounts] = useState([]);
  const profile = JSON.parse(localStorage.getItem("profile"));

  const handleSelectedPoolIdChange = (event) => {
    setAvaibleBankAccounts([]);
    setSuspendedBankAccounts([]);
    setTransactionLimitExceedAccounts([]);
    setUsedAccounts([]);

    setSelectedPoolId(event.target.value);
  };
  const {
    state: { value: bankName, isValid: isBankNameValid },
    handleOnChange: bankNameOnChange,
  } = useInput();
  const {
    state: { value: bankAccountNumber, isValid: isBankAccountNumberValid },
    handleOnChange: bankAccountNumberOnChange,
  } = useInput();
  const {
    state: { value: branchCode, isValid: isBranchCodeValid },
    handleOnChange: branchCodeOnChange,
  } = useInput();
  const {
    state: { value: iban, isValid: isIbanValid },
    handleOnChange: ibanOnChange,
  } = useInput();
  const {
    state: { value: additionalInfo, isValid: isAdditionalInfoValid },
    handleOnChange: additionalInfoOnChange,
  } = useInput();
  const {
    state: { value: bankDescription, isValid: isBankDescriptionValid },
    handleOnChange: bankDescriptionOnChange,
  } = useInput();
  const {
    state: { value: depositDownLimit, isValid: isDepositDownLimitValid },
    handleOnChange: depositDownLimitOnChange,
  } = useInput();
  const {
    state: { value: depositUpLimit, isValid: isDepositUpLimitValid },
    handleOnChange: depositUpLimitOnChange,
  } = useInput();
  const {
    state: { value: withdrawDownLimit, isValid: isWithdrawDownLimitValid },
    handleOnChange: withdrawDownLimitOnChange,
  } = useInput();
  const {
    state: { value: withdrawUpLimit, isValid: isWithdrawUpLimitValid },
    handleOnChange: withdrawUpLimitOnChange,
  } = useInput();
  const {
    state: {
      value: singleDepositUpLimit,
      isValid: isSingleDepositUpLimitValid,
    },
    handleOnChange: singleDepositUpLimitOnChange,
  } = useInput();
  const {
    state: { value: dailyDepositLimit, isValid: isDailyDepositLimitValid },
    handleOnChange: dailyDepositLimitOnChange,
  } = useInput();
  const {
    state: { value: dailyWithdrawLimit, isValid: isDailyWithdrawLimitValid },
    handleOnChange: dailyWithdrawLimitOnChange,
  } = useInput();

  const handleDialog = () => setDialog(!dialog);

  const handleTabClick = (value) => {
    setActiveTab(value);
  };
  const handleBankChange = (event) => setBank(event.target.value);

  const refetchAll = () => {
    refetchSuspendedBankAccounts();
    refetchAvaibleBankAccounts();
    refetchTransactionLimitExceedAccounts();
    refetchUsedAccounts();
  };

  const handleModalBankAccounts = () =>
    setModalBankAccounts(!modalBankAccounts);

  const suspendAndActiveAccountMutation = useMutation(suspendAndActiveAccount, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        setDialog(true);
        setDialogTitle("Error");
        setDialogMessage(data.message);
      } else {
        setDialog(true);
        setDialogTitle("Success");
        setDialogMessage(data.message);
      }
      refetchAll();
    },
  });

  const handleSuspendAndActiveAccount = (userId, active) => {
    suspendAndActiveAccountMutation.mutate({
      token: token,
      _id: userId,
      active: active,
      papara,
    });
  };

  const createBankAccountMutation = useMutation(createBankAccount, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        setDialog(true);
        setDialogTitle("Error");
        setDialogMessage(data.message._message);
      } else {
        setDialog(true);
        setDialogTitle("Success");
        setDialogMessage(data.message);
      }

      setModalBankAccounts(false);
      refetchAll();
    },
  });

  const handleCreateBankAccount = (e) => {
    e.preventDefault();

    createBankAccountMutation.mutate({
      bankName: bank,
      nameSurname: bankName,
      accountNumber: bankAccountNumber,
      branchCode: branchCode,
      iban: iban,
      additionalDescription: additionalInfo,
      description: bankDescription,
      accountDepositLimitTransactionNumber: dailyDepositLimit, // Yatırılabilir Adet
      accountWithdrawLimitTransactionNumber: dailyWithdrawLimit, // Çekilebilir Adet
      minimumDepositLimit: depositDownLimit, // Yatırım Alt limit
      maximumDepositLimit: depositUpLimit, // Yatırım Üst limit
      minimumWithdrawLimit: withdrawDownLimit, // Ödeme Alt Limit
      maximumWithdrawLimit: withdrawUpLimit, // Ödeme Üst limit
      singularDepositForAccountPassive: singleDepositUpLimit, // Teki Yatırım Limiti
      institutional: false,
      mailHost: "gmail",
      token: token,
      papara,
      ...(selectedPoolId ? { pool: selectedPoolId } : {}),
    });
  };

  const poolsParams = {
    token: RemoteController.getToken(),
    remoteToken: localStorage.getItem("remoteToken"),
  };

  const { isLoading: isPoolsDataLoading, refetch: refetchPools } = useQuery(
    ["pools", poolsParams],
    {
      refetchOnWindowFocus: false,
      queryFn: async (data) => {
        const pools = await getPools(data);
        setPools(pools);
      },
    }
  );

  const removeBankAccountMutation = useMutation(removeBankAccount, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        setDialog(true);
        setDialogTitle("Error");
        setDialogMessage(data.message);
      } else {
        setDialog(true);
        setDialogTitle("Success");
        setDialogMessage(data.message);
      }

      setModalBankAccounts(false);
      refetchAll();
    },
  });

  const handleRemoveBankAccount = (userId) => {
    removeBankAccountMutation.mutate({
      token: token,
      _id: userId,
    });
  };

  const paramsDeposit = {
    token: token,
    papara,
    pool: selectedPoolId,
  };

  const {
    isLoading: isAvaibleBankAccountsDataLoading,
    refetch: refetchAvaibleBankAccounts,
  } = useQuery(["availableBankAccounts", paramsDeposit], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      const avaibleBankAccounts = await getAvaibleBankAccounts(data);
      setAvaibleBankAccounts(avaibleBankAccounts);
    },
  });
  const {
    isLoading: isSuspendedBankAccountsDataLoading,
    refetch: refetchSuspendedBankAccounts,
  } = useQuery(["suspendedBankAccounts", paramsDeposit], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      const suspendedBankAccounts = await getSuspendedBankAccounts(data);
      setSuspendedBankAccounts(suspendedBankAccounts);
    },
  });

  const {
    isLoading: isTransactionLimitExceedAccountsDataLoading,
    refetch: refetchTransactionLimitExceedAccounts,
  } = useQuery(["transactionLimitExceedAccounts", paramsDeposit], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      const transactionLimitExceedAccounts =
        await getTransactionLimitExceedAccounts(data);
      setTransactionLimitExceedAccounts(transactionLimitExceedAccounts);
    },
  });

  const { isLoading: isUsedAccountsDataLoading, refetch: refetchUsedAccounts } =
    useQuery(["usedAccounts", paramsDeposit], {
      refetchOnWindowFocus: false,
      queryFn: async (data) => {
        const usedAccounts = await getUsedAccounts(data);
        setUsedAccounts(usedAccounts);
      },
    });

  useEffect(() => {
    const identifier = setTimeout(() => {
      setIsCreateBankAccountFormValid(
        bank !== "" &&
          bank !== "select-bank-accounts" &&
          isBankNameValid &&
          isBankAccountNumberValid &&
          isBranchCodeValid &&
          isIbanValid &&
          isAdditionalInfoValid &&
          isBankDescriptionValid &&
          isDailyDepositLimitValid &&
          isDailyWithdrawLimitValid &&
          isDepositDownLimitValid &&
          isDepositUpLimitValid &&
          isWithdrawDownLimitValid &&
          isWithdrawUpLimitValid &&
          isSingleDepositUpLimitValid
      );
    }, 100);

    return () => clearTimeout(identifier);
  }, [
    bank,
    isBankNameValid,
    isBankAccountNumberValid,
    isBranchCodeValid,
    isIbanValid,
    isAdditionalInfoValid,
    isBankDescriptionValid,
    isDailyDepositLimitValid,
    isDailyWithdrawLimitValid,
    isDepositDownLimitValid,
    isDepositUpLimitValid,
    isWithdrawDownLimitValid,
    isWithdrawUpLimitValid,
    isSingleDepositUpLimitValid,
  ]);

  console.log(
    bank,
    isBankNameValid,
    isBankAccountNumberValid,
    isBranchCodeValid,
    isIbanValid,
    isAdditionalInfoValid,
    isBankDescriptionValid,
    isDailyDepositLimitValid,
    isDailyWithdrawLimitValid,
    isDepositDownLimitValid,
    isDepositUpLimitValid,
    isWithdrawDownLimitValid,
    isWithdrawUpLimitValid,
    isSingleDepositUpLimitValid
  );

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Await resolve={loaderData}>
          {(resolvedData) => {
            if (!resolvedData) return;
            const openAccountsRow = avaibleBankAccounts?.map((item, key) => ({
              ID: key + 1,
              BANKA: item.bankName || item.bankName2 || "Tanımlı Değil",
              "HESAP SAHİBİ İSMİ": item.nameSurname || "Tanımlı Değil",
              "HESAP NUMARASI": item.accountNumber || "Tanımlı Değil",
              BAKİYE: item.balance,
              "YATIRIM ADETİ": item.depositNumber,
              "ÇEKİM ADETİ": item.withdrawNumber,
              "EKLENDİĞİ TARİH": item.createdAt || "Tanımlı Değil",
              DÜZENLE: (
                <div className="flex gap-2">
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    size="lg"
                    className="text-green-600 cursor-pointer"
                    onClick={() =>
                      (window.location = "edit-bank-account?_id=" + item._id)
                    }
                  />
                  <FontAwesomeIcon
                    icon={faPowerOff}
                    size="lg"
                    className="text-orange-500 cursor-pointer"
                    onClick={() =>
                      handleSuspendAndActiveAccount(item._id, false)
                    }
                  />
                  <FontAwesomeIcon
                    icon={faTrashCan}
                    size="lg"
                    className="text-red-700  cursor-pointer"
                    onClick={() => handleRemoveBankAccount(item._id)}
                  />
                </div>
              ),
            }));
            const quantityLimitFullsRow = transactionLimitExceedAccounts?.map(
              (item, key) => ({
                ID: key + 1,
                BANKA: item.bankName || item.bankName2 || "Tanımlı Değil",
                "HESAP SAHİBİ İSMİ": item.nameSurname || "Tanımlı Değil",
                "HESAP NUMARASI": item.accountNumber || "Tanımlı Değil",
                BAKİYE: item.balance,
                "YATIRIM ADETİ": item.depositNumber,
                "ÇEKİM ADETİ": item.withdrawNumber,
                "EKLENDİĞİ TARİH": item.createdAt || "Tanımlı Değil",
                DÜZENLE: (
                  <div className="flex gap-2">
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      size="lg"
                      className="text-green-600 cursor-pointer"
                      onClick={() =>
                        (window.location = "edit-bank-account?_id=" + item._id)
                      }
                    />
                    <FontAwesomeIcon
                      icon={faPowerOff}
                      size="lg"
                      className="text-orange-500 cursor-pointer"
                      onClick={() =>
                        handleSuspendAndActiveAccount(item._id, false)
                      }
                    />
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      size="lg"
                      className="text-red-700 cursor-pointer"
                      onClick={() => handleRemoveBankAccount(item._id)}
                    />
                  </div>
                ),
              })
            );
            const suspendedBankAccountsRow = suspendedBankAccounts?.map(
              (item, key) => ({
                ID: key + 1,
                BANKA: item.bankName || item.bankName2 || "Tanımlı Değil",
                "HESAP SAHİBİ İSMİ": item.nameSurname || "Tanımlı Değil",
                "HESAP NUMARASI": item.accountNumber || "Tanımlı Değil",
                BAKİYE: item.balance,
                "YATIRIM ADETİ": item.depositNumber,
                "ÇEKİM ADETİ": item.withdrawNumber,
                "EKLENDİĞİ TARİH": item.createdAt || "Tanımlı Değil",
                DÜZENLE: (
                  <div className="flex gap-2">
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      size="lg"
                      className="text-green-600 cursor-pointer"
                      onClick={() =>
                        (window.location = "edit-bank-account?_id=" + item._id)
                      }
                    />
                    <FontAwesomeIcon
                      icon={faPowerOff}
                      size="lg"
                      className="text-green-500 cursor-pointer"
                      onClick={() =>
                        handleSuspendAndActiveAccount(item._id, true)
                      }
                    />
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      size="lg"
                      className="text-red-700 cursor-pointer"
                      onClick={() => handleRemoveBankAccount(item._id)}
                    />
                  </div>
                ),
              })
            );
            const usedAccountsRow = usedAccounts?.map((item, key) => ({
              ID: key + 1,
              BANKA: item.bankName || item.bankName2 || "Tanımlı Değil",
              "HESAP SAHİBİ İSMİ": item.nameSurname || "Tanımlı Değil",
              "HESAP NUMARASI": item.accountNumber || "Tanımlı Değil",
              BAKİYE: item.balance,
              "YATIRIM ADETİ": item.depositNumber,
              "ÇEKİM ADETİ": item.withdrawNumber,
              "EKLENDİĞİ TARİH": item.createdAt || "Tanımlı Değil",
              DÜZENLE: (
                <div className="flex gap-2">
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    size="lg"
                    className="text-green-600 cursor-pointer"
                    onClick={() =>
                      (window.location = "edit-bank-account?_id=" + item._id)
                    }
                  />
                  <FontAwesomeIcon
                    icon={faPowerOff}
                    size="lg"
                    className="text-orange-500 cursor-pointer"
                    onClick={() =>
                      handleSuspendAndActiveAccount(item._id, false)
                    }
                  />
                  <FontAwesomeIcon
                    icon={faTrashCan}
                    size="lg"
                    className="text-red-700 cursor-pointer"
                  />
                </div>
              ),
            }));
            const data = [
              {
                label: "Açık Hesaplar",
                value: "open-accounts",
                desc: (
                  <div>
                    <Table tableHead={TABLE_HEAD} tableRows={openAccountsRow} />
                  </div>
                ),
              },
              {
                label: "Adet Limiti Dolanlar",
                value: "quantity-limit-fulls",
                desc: (
                  <div>
                    <Table
                      tableHead={TABLE_HEAD}
                      tableRows={quantityLimitFullsRow}
                    />
                  </div>
                ),
              },
              {
                label: "Askıdaki Hesaplar",
                value: "pending-accounts",
                desc: (
                  <div>
                    <Table
                      tableHead={TABLE_HEAD}
                      tableRows={suspendedBankAccountsRow}
                    />
                  </div>
                ),
              },
              {
                label: "Kullanılmış Hesaplar",
                value: "used-accounts",
                desc: (
                  <div>
                    <Table tableHead={TABLE_HEAD} tableRows={usedAccountsRow} />
                  </div>
                ),
              },
            ];
            return (
              <>
                {profile?.type === "god" && (
                  <div className="mt-5 flex-grow mb-5">
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

                <section className="mb-6 text-end">
                  <Button
                    type={"button"}
                    variant={"primary"}
                    onClick={() => handleModalBankAccounts()}
                  >
                    Yeni Hesap Ekle
                  </Button>
                </section>
                <Tabs
                  value={activeTab}
                  className="overflow-x-auto whitespace-nowrap"
                >
                  <TabsHeader className="bg-gray-200 overflow-x-auto !p-0">
                    {data.map(({ label, value }) => (
                      <Tab
                        key={value}
                        value={value}
                        className={`rounded-md py-3 ${
                          activeTab === value
                            ? "bg-secondary text-white font-bold text-sm"
                            : "hover:bg-gray-300 text-sm"
                        }`}
                        onClick={() => handleTabClick(value)}
                      >
                        {label}
                      </Tab>
                    ))}
                  </TabsHeader>
                  <TabsBody>
                    {data.map(({ value, desc }) => (
                      <TabPanel className="!p-0 my-3" key={value} value={value}>
                        {desc}
                      </TabPanel>
                    ))}
                  </TabsBody>
                </Tabs>
              </>
            );
          }}
        </Await>
        <Modal
          show={modalBankAccounts}
          className={"w-11/12 mx-4 md:mx-0 md:w-3/4 lg:w-2/4"}
          handleModal={handleModalBankAccounts}
        >
          <form onSubmit={handleCreateBankAccount}>
            <Modal.Header handleModal={handleModalBankAccounts}>
              <h1 className="font-semibold">Banka Hesabı Oluştur</h1>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-5">
                <div className="flex gap-2">
                  <select
                    name="bank-accounts"
                    id="bank-accounts"
                    className="w-full rounded-md py-3 border-gray-300"
                    value={bank}
                    onChange={handleBankChange}
                  >
                    <option value="select-bank-accounts">Banka Seçiniz</option>
                    <option value="7/24 Fast">7/24 Fast</option>
                    <option value="Ziraat Bankası">Ziraat Bankası</option>
                    <option value="Garanti Bankası">Garanti Bankası</option>
                    <option value="Akbank">Akbank</option>
                    <option value="İş Bankası">İş Bankası</option>
                    <option value="Yapı Kredi">Yapı Kredi</option>
                    <option value="Denizbank">Denizbank</option>
                    <option value="ING Bank">ING Bank</option>
                    <option value="QNB Finansbank">QNB Finansbank</option>
                    <option value="Kuveyttürk">Kuveyttürk</option>
                    <option value="TEB Bank">TEB Bank</option>
                    <option value="ODEOABANK">ODEOABANK</option>
                    <option value="Türkiye Finans">Türkiye Finans</option>
                    <option value="FIBABANK">FIBABANK</option>
                    <option value="Vakıfbank">Vakıfbank</option>
                    <option value="Halkbank">Halkbank</option>
                    <option value="Enpara">Enpara</option>
                    <option value="Albaraka">Albaraka</option>
                    <option value="Aktif Bank">Aktif Bank</option>
                    <option value="Ziraat Katılım">Ziraat Katılım</option>
                    <option value="Vakıf Katılım">Vakıf Katılım</option>
                    <option value="Türkiye Finans Katılım">Türkiye Finans Katılım</option>
                  </select>

                  <Input
                    type={"text"}
                    name={"bankName"}
                    label={"Hesap Sahibi Adı"}
                    placeholder={"Hesap Sahibi Adı"}
                    autoFocus={false}
                    value={bankName}
                    onChange={bankNameOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                </div>

                <div className="flex gap-2 mt-5">
                  <Input
                    type={"text"}
                    name={"bank-account-number"}
                    label={"Banka Hesap Numarası"}
                    placeholder={"Banka Hesap Numarası"}
                    autoFocus={false}
                    value={bankAccountNumber}
                    onChange={bankAccountNumberOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                  <Input
                    type={"text"}
                    name={"branch-code"}
                    label={"Şube Kodu"}
                    placeholder={"Şube Kodu"}
                    autoFocus={false}
                    value={branchCode}
                    onChange={branchCodeOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                </div>
                <div className="flex gap-2 mt-5">
                  <Input
                    type={"text"}
                    name={"iban"}
                    label={"IBAN"}
                    placeholder={"IBAN"}
                    autoFocus={false}
                    value={iban}
                    onChange={ibanOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                  <Input
                    type={"text"}
                    name={"additionalInfo"}
                    label={"Ek Bilgi"}
                    placeholder={"Ek Bilgi"}
                    autoFocus={false}
                    value={additionalInfo}
                    onChange={additionalInfoOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                </div>
                <div className="flex gap-2 mt-5">
                  <Input
                    type={"text"}
                    name={"bankDescription"}
                    label={"Açıklama"}
                    placeholder={"Açıklama"}
                    autoFocus={false}
                    value={bankDescription}
                    onChange={bankDescriptionOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                </div>
                <div className="flex gap-2 mt-5">
                  <Input
                    type={"number"}
                    name={"dailyDepositLimit"}
                    label={"Yatırım Adet Limiti"}
                    placeholder={"Yatırım Adet Limiti"}
                    autoFocus={false}
                    value={dailyDepositLimit}
                    onChange={dailyDepositLimitOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                  <Input
                    type={"number"}
                    name={"dailyWithdrawLimit"}
                    label={"Çekim Adet Limiti"}
                    placeholder={"Çekim Adet Limiti"}
                    autoFocus={false}
                    value={dailyWithdrawLimit}
                    onChange={dailyWithdrawLimitOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                </div>
                <div className="flex gap-2 mt-5">
                  <Input
                    type={"number"}
                    name={"depositDownLimit"}
                    label={"Yatırım Alt Limit"}
                    placeholder={"Yatırım Alt Limit"}
                    autoFocus={false}
                    value={depositDownLimit}
                    onChange={depositDownLimitOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                  <Input
                    type={"number"}
                    name={"depositUpLimit"}
                    label={"Yatırım Üst Limit"}
                    placeholder={"Yatırım Üst Limit"}
                    autoFocus={false}
                    value={depositUpLimit}
                    onChange={depositUpLimitOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                </div>
                <div className="flex gap-2 mt-5">
                  <Input
                    type={"number"}
                    name={"withdrawDownLimit"}
                    label={"Çekim Alt Limit"}
                    placeholder={"Çekim Alt Limit"}
                    autoFocus={false}
                    value={withdrawDownLimit}
                    onChange={withdrawDownLimitOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                  <Input
                    type={"number"}
                    name={"withdrawUpLimit"}
                    label={"Çekim Üst Limit"}
                    placeholder={"Çekim Üst Limit"}
                    autoFocus={false}
                    value={withdrawUpLimit}
                    onChange={withdrawUpLimitOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                </div>
                <div className="flex gap-2 mt-5">
                  <Input
                    type={"text"}
                    name={"singleDepositUpLimit"}
                    label={"Tekil Miktar Limiti"}
                    placeholder={"Tekil Miktar Limiti"}
                    autoFocus={false}
                    value={singleDepositUpLimit}
                    onChange={singleDepositUpLimitOnChange}
                    classNames={"min-h-5 lg:min-h-5"}
                  />
                  <div
                    className="info"
                    title="Hesaba yüklü miktar yatırım yapıldığı zaman sistem hesabı otomatik olarak askıya alacaktır. Bu miktarı belirleyiniz lütfen."
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
              <Button
                type={"submit"}
                variant={"primary"}
                className={"w-full py-4 lg:py-5"}
                disabled={
                  !isCreateBankAccountFormValid ||
                  createBankAccountMutation.status === "loading"
                }
              >
                Banka Hesabını Oluştur
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      </Suspense>
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
  /*const token = RemoteController.getToken();
  console.log(token);
  const papara = localStorage.getItem("mode") === "papara" ? true : false;
  const paramsDeposit = {
    token: token,
    papara,
  };
  const avaibleBankAccounts = await new HttpRequest("api").get(
    "bankaccounts/getavaiblebankaccounts",
    paramsDeposit
  );
  const suspendedBankAccounts = await new HttpRequest("api").get(
    "bankaccounts/getsuspendedbankaccounts",
    paramsDeposit
  );
  const transactionLimitExceedAccounts = await new HttpRequest("api").get(
    "bankaccounts/gettransactionlimitexceedaccounts",
    paramsDeposit
  );

  const usedAccounts = await new HttpRequest("api").get(
    "bankaccounts/",
    paramsDeposit
  );
  const allData = [
    avaibleBankAccounts,
    suspendedBankAccounts,
    transactionLimitExceedAccounts,
    usedAccounts,
  ];*/
  return "allData";
};

export default BankAccountsPageBanka;
