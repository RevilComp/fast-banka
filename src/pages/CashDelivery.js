import { Suspense, useState, useEffect } from "react";
import { Await, useLoaderData } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import Card from "../components/ui/Card";
import * as RemoteController from "../remoteControl";
import Dialog from "../components/ui/Dialog";
import Input from "../components/ui/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTurkishLiraSign,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../components/ui/Button";
import HttpRequest from "../utils/HttpRequest";
import Loading from "../components/ui/loading/Loading";
import useInput from "../hooks/useInput";
import moment from "moment";
import Table from "../components/ui/Table";
import Spinner from "../components/ui/Spinner";
import Cookies from "js-cookie";
import axios from "axios";

const TABLE_HEAD = [
  "ID",
  "AD",
  "SOYAD",
  "KULLANICI ADI",
  "KULLANICI TPI",
  "ÇEKİM",
  "KOMISYON",
  "KASA",
  "GÜNCEL KASA",
  "İŞLEM ZAMANI",
  "İŞLEMLER",
];

// * GET: Get Cash Delivery State
const getCashDelivery = async (cashParams) =>
  new HttpRequest("api").get(`cashdelivery?token=${cashParams.token}&pool=${cashParams.pool}`);

const getPoolByUser = async (cashParams) =>
  new HttpRequest("api").get(`pool/byuser?token=${cashParams.token}&pool=${cashParams.pool}`);

// * POST: Create Cash Delivery State
const createCashDelivery = async (payload) =>
  new HttpRequest("api").post("cashdelivery", payload);

const deleteCashDelivery = async (payload) =>
  new HttpRequest("api").post("cashdelivery/delete", payload);

const getPools = async (poolsParams) =>
  await new HttpRequest("api").get(`pool?token=${poolsParams.queryKey[1].token}&remoteToken=${poolsParams.queryKey[1].remoteToken}`);

const CashDeliveryPage = () => {
  const loaderData = useLoaderData();

  const [isFormValid, setIsFormValid] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState();
  const [dialogMessage, setDialogMessage] = useState();
  const [cashDeliveries, setCashDeliveries] = useState([]);
  const [latestCash, setLatestCash] = useState();
  const [poolInformation, setPoolInformation] = useState({});
  const [selectedPoolInformation, setSelectedPoolInformation] = useState({});
  const [excelLoading, setExcelLoading] = useState(false);
  const token = RemoteController.getToken();
  const [pools, setPools] = useState([]);
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const handleSelectedPoolIdChange = (event) => {
    setSelectedPoolId(event.target.value);
    setSelectedPoolInformation(pools.find((pool) => pool._id === event.target.value));
  };


  const downloadExcel = () => {
    axios
      .post(
        process.env.REACT_APP_API_URL + "/cashdelivery/download-excel",
        {
          token: token,
        },
        { responseType: "blob" }
      )
      .then(async function (response) {
        setExcelLoading(false);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "file.xlsx");
        document.body.appendChild(link);
        link.click();
      });
  };
  const {
    state: { value: withdrawalAmount, isValid: isWithdrawalAmountValid },
    handleOnChange: withdrawalAmountOnChange,
    handleClear: withdrawalAmountOnClear,
  } = useInput();

  const {
    state: { value: comissionAmount, isValid: isComissionAmountValid },
    handleOnChange: comissonAmountOnChange,
    handleClear: comissionAmountOnClear,
  } = useInput();

  const profile = JSON.parse(localStorage.getItem("profile"));

  const handleDialog = () => setDialog(!dialog);

  const poolsParams = {
    token: RemoteController.getToken(),
    remoteToken: localStorage.getItem("remoteToken"),
  };

  const {
    isLoading: isPoolsDataLoading,
    refetch: refetchPools,
  } = useQuery(["getPools", poolsParams], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      if(profile?.type === "god") {
      const pools = await getPools(data);
      setPools(pools);
      setSelectedPoolId(pools[0]._id);
      setSelectedPoolInformation(pools[0]);
      }
    },
  });

  const cashParams = {
    token: Cookies.get("token"),
    pool: selectedPoolId
  };

  

  const { isLoading: isCashDeliveryLoading, refetch: refetchGetCashDelivery } =
    useQuery(["getCashDelivery", cashParams], {
      queryFn: async (data) => {
        const response = await getCashDelivery(cashParams);

        if (response.data.cashDelivery.length === 0) {
          setLatestCash(0);
          setCashDeliveries([]);
        }
        else {
          const cashDelivery = response.data.cashDelivery;

          setCashDeliveries(cashDelivery);
          setLatestCash(cashDelivery[cashDelivery.length - 1].latest_cash);
        }
      },
    });

  const {
    isLoading: isPoolInformationLoading,
    refetch: refetchPoolInformation,
  } = useQuery(["getPoolInformation", null], {
    queryFn: async (data) => {
      const response = await getPoolByUser(cashParams);
      setPoolInformation(response);
    },
  });

  const cashDeliveryMutation = useMutation(createCashDelivery, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        handleDialog();
        setDialogTitle("Error");
        setDialogMessage(data.message);
      }

      if (data.status === "success") {
        withdrawalAmountOnClear();
        comissionAmountOnClear();
        refetchPoolInformation();
        refetchPools();
        refetchGetCashDelivery();
      }
    },
  });

  const cashDeliveryDeleteMutation = useMutation(deleteCashDelivery, {
    onSuccess: (data) => {
      if (data.status === "fail") {
        handleDialog();

        setDialogTitle("Error");
        setDialogMessage(data.message);
      }

      if (data.status === "success") {
        withdrawalAmountOnClear();
        comissionAmountOnClear();
        refetchPoolInformation();
        refetchPools();
        refetchGetCashDelivery();
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    cashDeliveryMutation.mutate({
      token: Cookies.get("token"),
      withdrawalAmount,
      comissionAmount,
      pool: selectedPoolId
    });

    refetchPoolInformation();
  };

  useEffect(() => {
    const identifier = setTimeout(() => {
      setIsFormValid(isWithdrawalAmountValid && isComissionAmountValid);
    }, 100);

    return () => clearTimeout(identifier);
  }, [isWithdrawalAmountValid, isComissionAmountValid]);

  if (isCashDeliveryLoading) return <Spinner />;

  

  return (
    <Suspense fallback={<Loading />}>
      <Await resolve={loaderData}>
        {() => {
          const tableRows = cashDeliveries.map((cashDelivery) => ({
            ID: cashDelivery._id,
            AD: cashDelivery.firstname,
            SOYAD: cashDelivery.lastname,
            "KULLANICI ADI": cashDelivery.username,
            "KULLANICI TIPI": cashDelivery.type,
            ÇEKİM: cashDelivery.withdrawalAmount,
            KOMISYON: cashDelivery.comissionAmount,
            KASA: cashDelivery.cash,
            "GUNCEL KASA": cashDelivery.latest_cash,
            "İŞLEM ZAMANI": moment(cashDelivery.date).format("YYY-MM-DD HH:mm"),
            İŞLEMLER: (
              <Button
                type={"button"}
                variant={"danger"}
                onClick={() =>
                  cashDeliveryDeleteMutation.mutate({
                    token: Cookies.get("token"),
                    cashDeliveryId: cashDelivery._id,
                  })
                }
              >
                Sil
              </Button>
            ),
          }));

          return (
            <>
              <Card className={"mb-12"}>
                <Card.Header className={"mb-3"}>
                  <div className="mb-3 flex justify-between">
                  <h1 className="font-bold">Kasa ve Teslimat</h1>
                  
                  <Button
                    type={"submit"}
                    variant={"orange"}
                    className=""
                    onClick={() => {
                      setExcelLoading(true);
                      downloadExcel();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faFileExcel}
                      size="lg"
                      className="text-white cursor-pointer mr-2"
                    />
                    Excel İndir
                  </Button>
                  </div>
                  <div className="mt-5">
                  {JSON.parse(localStorage.getItem("profile"))?.type === "god" && (
                        <div className="mt-5 flex-grow">
                          <select
                            name="user-type"
                            id="user-type"
                            className="w-full rounded-md py-3 border-gray-300"
                            value={selectedPoolId}
                            onChange={handleSelectedPoolIdChange}
                          >
                            <option disabled>Havuz Seçiniz</option>
                            {pools?.map((pool, index) => (
                              <option key={pool._id} value={pool._id} className="text-dark">
                                {pool?.title || "İsizmsiz Havuz"}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                  </div>
                </Card.Header>
                <Card.Body
                  className={
                    "flex items-center justify-between lg:justify-normal gap-4 mb-12"
                  }
                >
                  <div className="rounded-md inline-block bg-danger text-white px-4 lg:px-12 py-4">
                    <h1 className="font-bold mb-1">Kasa Durumu</h1>
                    <section className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faTurkishLiraSign} />
                      <span className="font-semibold">
                        {poolInformation?.currentDeposit !== undefined ? (poolInformation?.currentDeposit -
                          poolInformation?.currentWithdraw) : (selectedPoolInformation?.currentDeposit - selectedPoolInformation?.currentWithdraw)}
                      </span>
                    </section>
                  </div>
                  <div className="rounded-md inline-block bg-success text-white px-4 lg:px-12 py-4">
                    <h1 className="font-bold mb-1">Güncel Kasa Durumu</h1>
                    <section className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faTurkishLiraSign} />
                      <span className="font-semibold">
                        {poolInformation?.finalBalance || selectedPoolInformation?.finalBalance || 0}
                      </span>
                    </section>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <form
                    onSubmit={handleSubmit}
                    className={"lg:grid lg:grid-cols-12 gap-2"}
                  >
                    <div className="lg:flex lg:col-span-8 lg:gap-2 mb-4 lg:mb-0">
                      <div className="w-full mb-4 lg:mb-0">
                        <Input
                          type={"number"}
                          name={"withdrawal-amount"}
                          placeholder={"Çekim tutarı"}
                          label={"Çekim tutarı"}
                          value={withdrawalAmount}
                          onChange={withdrawalAmountOnChange}
                        />
                      </div>
                      <div className="w-full">
                        <Input
                          type={"number"}
                          name={"comission-amount"}
                          placeholder={"Komisyon tutarı"}
                          label={"Komisyion tutarı"}
                          value={comissionAmount}
                          onChange={comissonAmountOnChange}
                        />
                      </div>
                    </div>
                    <div className="col-span-4">
                      <Button
                        type={"submit"}
                        variant={"primary"}
                        className={"!py-3.5 w-full lg:w-auto"}
                        disabled={
                          !isFormValid || cashDeliveryMutation.isLoading
                        }
                      >
                        Onayla
                      </Button>
                    </div>
                  </form>
                </Card.Footer>
              </Card>
              <Table
                tableHead={TABLE_HEAD}
                tableRows={tableRows}
                className={"rounded-t"}
              />
              {/* <Table tableHead={TABLE_HEAD} tableRows={tableRows} */}
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
  // const token = RemoteController.getToken();
  // const papara = localStorage.getItem("mode") === "papara" ? true : false;

  // const state = {
  //   selectedUser: "all",
  //   startDate: "2021-01-01",
  //   endDate: "2024-03-20",
  //   skip: 0,
  // };

  // const paramsDeposit = {
  //   token: token,
  //   ...state,
  //   ...request,
  //   papara,
  // };

  // const transactionsData = await new HttpRequest("api").get(
  //   "users/mutabakat",
  //   paramsDeposit
  // );

  // return transactionsData;
  return true;
};

export default CashDeliveryPage;
