import { Suspense, useState, useRef } from "react";
import Table from "../../components/ui/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import Button from "../../components/ui/Button";
import * as RemoteController from "../../remoteControl";
import useInput from "../../hooks/useInput";
import Input from "../../components/ui/Input";
import HttpRequest from "../../utils/HttpRequest";
import { Await, Form, useLoaderData } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";
import Datepicker from "react-tailwindcss-datepicker";
import Card from "../../components/ui/Card";
import ReactToPrint from "react-to-print";
import moment from "moment";
import InfiniteScroll from 'react-infinite-scroll-component';

const TABLE_HEAD = [
  "WEBSITE",
  "İŞLEMLER",
  "AD SOYAD",
  "MİKTAR",
  "BANKA",
  "KULLANICI ADI",
  "IP",
  "DURUM",
  "TESLİM ZAMANI",
  "İŞLEM ZAMANI",
  "ONAY KODU",
];

const TransactionListsPage = () => {
  const printRef = useRef();
  const loaderData = useLoaderData();
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [priceMax, setPriceMax] = useState(20);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const handleValueChange = (newValue) => {
    setDateRange(newValue);
  };
  const [userType, setUserType] = useState("");
  const handleUserTypeChange = (event) => setUserType(event.target.value);
  const [statusType, setStatusType] = useState("");
  const handleStatusTypeChange = (event) => setStatusType(event.target.value);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  /*const loadMoreTransactions = async () => {
    setLoading(true);
    const newTransactions = await loader({
      request: {
        price_max: priceMax + 20,
        skip: priceMax,
        ...loaderData.request,
      },
    });
    setLoading(false);
    setPriceMax(priceMax + 20);
    setTransactions((prevTransactions) => [
      ...prevTransactions,
      ...newTransactions,
    ]);
    await new HttpRequest("api").get("transactions/islemlistesi", {
      token: RemoteController.getToken(),
      ...loaderData.request,
      price_max: priceMax + 20,
      skip: priceMax,
      papara: localStorage.getItem("mode") === "papara" ? true : false,
    });
  };
  useEffect(() => {
    loadMoreTransactions(); // Initial load
  }, []); */
  
  const totalAmount = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  const {
    state: { value: fullName },
    handleOnChange: fullNameOnChange,
  } = useInput();

  const {
    state: { value: userId },
    handleOnChange: userIdOnChange,
  } = useInput();

  const {
    state: { value: website },
    handleOnChange: websiteOnChange,
  } = useInput();

  const {
    state: { value: minAmount },
    handleOnChange: minAmountOnChange,
  } = useInput();

  const {
    state: { value: maxAmount },
    handleOnChange: maxAmountOnChange,
  } = useInput();

  
  return (
    <Suspense
      fallback={
        <center>
          <Spinner />
        </center>
      }
    >
      <Await resolve={loaderData}>
        {(resolvedData) => {
          setTransactions(resolvedData);
          const loadMoreTransactions = async () => {
            setLoading(true);
            try {
                const newTransactions = await new HttpRequest("api").get(
                    "transactions/islemlistesi",
                    {
                        token: RemoteController.getToken(),
                        ...resolvedData.request,
                        limit: 10,
                        skip: 20,
                        papara: localStorage.getItem("mode") === "papara"
                    }
                );
                if (newTransactions.length > 0) {
                    setTransactions(prevTransactions => [
                        ...prevTransactions,
                        ...newTransactions
                    ]);
                } else {
                    setHasMore(false);
                }
            } catch (error) {
                console.error("Daha fazla veri yüklenemedi: ", error);
                // Hata durumunda hasMore'u false yaparak sonsuz döngüyü önleyin
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        };
          const tableRows = transactions.map((data) => ({
            WEBSITE: data.websiteCodeS + " - " + data.transactionId,
            İŞLEMLER: (
              <div className="flex">
                <Button type={"button"} variant={"primary"}>
                  {data.type === "deposit" ? "Yatırım" : "Çekim"}
                </Button>
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
            IP: data.ipaddress,
            DURUM: (
              <div className="flex-start">
                <Button type={"button"} variant={"primary"}>
                  Düzenle
                </Button>
                <Button type={"button"} variant={"danger"} className={"ml-4"}>
                  IP Banla
                </Button>
                {data.status === 0 ? (
                  <span className="text-primary font-bold ml-2">Bekliyor</span>
                ) : data.status === 1 ? (
                  <span className="text-success font-bold  ml-2">Onaylandı</span>
                ) : (
                  <span className="text-danger font-bold ml-2">Reddedildi</span>
                )}
              </div>
            ),
            "TESLİM ZAMANI": moment(data.createdAt).format("YYYY-MM-DD HH:mm"),
            "İŞLEM ZAMANI": moment(data.updatedAt).format("YYYY-MM-DD HH:mm"),
            "ONAY KODU": data.validationCode || "YOK",
          }));
          return (
            <div>
            <Card className={"mb-12"}>
              <Card.Header>
                <h1 className="font-bold">İşlem Filtreleme</h1>
              </Card.Header>
              <Card.Body>
                <Form method="GET">
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
                      <select
                        name="user-type"
                        id="user-type"
                        className="w-full rounded-md py-3 border-gray-300"
                        value={userType}
                        onChange={handleUserTypeChange}
                      >
                        <option value="">Tipi</option>
                        <option value="">Seçiniz</option>
                        <option value="success">Yatırım İşlemleri</option>
                        <option value="rejections">Çekim İşlemleri</option>
                      </select>
                    </div>
                    <div className="mt-5 flex-grow">
                      <select
                        name="status-type"
                        id="status-type"
                        className="w-full rounded-md py-3 border-gray-300"
                        value={statusType}
                        onChange={handleStatusTypeChange}
                      >
                        <option value="">Durumu</option>
                        <option value="">Hepsi</option>
                        <option value="deposit">Onaylanmış</option>
                        <option value="withdraw">Reddedilmiş</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:flex md:gap-2">
                    <div className="mt-5 flex-grow">
                      <Input
                        type={"text"}
                        name={"fullName"}
                        label={"Ad Soyad"}
                        placeholder={"Ad Soyad"}
                        autoFocus={true}
                        value={fullName}
                        onChange={fullNameOnChange}
                        className={"h-11 lg:h-12"}
                      />
                    </div>
                    <div className="mt-5 flex-grow">
                      <Input
                        type={"text"}
                        name={"userId"}
                        label={"Kullanıcı Id"}
                        placeholder={"Kullanıcı Id"}
                        autoFocus={true}
                        value={userId}
                        onChange={userIdOnChange}
                        className={"h-11 lg:h-12"}
                      />
                    </div>
                    <div className="mt-5 flex-grow">
                      <Input
                        type={"text"}
                        name={"website"}
                        label={"Website"}
                        placeholder={"Website"}
                        autoFocus={true}
                        value={website}
                        onChange={websiteOnChange}
                        className={"h-11 lg:h-12"}
                      />
                    </div>
                  </div>
                  <div className="md:flex md:gap-2">
                    <div className="mt-5 flex-grow">
                      <Input
                        type={"number"}
                        name={"minAmount"}
                        label={"Min. Tutar"}
                        placeholder={"Min. Tutar"}
                        autoFocus={true}
                        value={minAmount}
                        onChange={minAmountOnChange}
                        className={"h-11 lg:h-12"}
                      />
                    </div>
                    <div className="mt-5 flex-grow">
                      <Input
                        type={"number"}
                        name={"maxAmount"}
                        label={"Max. Tutar"}
                        placeholder={"max. Tutar"}
                        autoFocus={true}
                        value={maxAmount}
                        onChange={maxAmountOnChange}
                        className={"h-11 lg:h-12"}
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <Button
                      type={"submit"}
                      variant={"primary"}
                      className="h-full"
                    >
                      Filtrele
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <div ref={printRef}>
              <div className="flex justify-between bg-secondary text-white p-4 rounded-t-xl">
                <h4 className="font-bold">
                  <span className="hidden md:inline">Toplam Miktarı: </span>{" "}
                  <span className="text-success">{totalAmount} TRY</span>
                </h4>
                <h4 className="font-bold">
                  <span className="hidden md:inline">Toplam Adeti: </span>{" "}
                  <span className="text-success">{transactions.length}</span>{" "}
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
              <InfiniteScroll
                  dataLength={transactions.length}
                  next={loadMoreTransactions}
                  hasMore={true}
                  loader={<Spinner />}
              >
                  {/* Your existing code for displaying transactions */}
                  <Table tableHead={TABLE_HEAD} tableRows={tableRows} />
                  {loading && <Spinner />}
              </InfiniteScroll>
            </div>
          </div>
          )
        }}
      </Await>
    </Suspense>
  );
};

export const loader = async ({ request }) => {
  const token = RemoteController.getToken();
  const papara = localStorage.getItem("mode") === "papara" ? true : false;
  const state = {
    type: "all",
    status: "all",
    nameSurname: "",
    website: "",
    user_id: "",
    startDate: "2021-01-01",
    endDate: "2024-03-20",
    skip: 0,
    limit: 10
  };
  const paramsDeposit = {
    token: token,
    ...state,
    ...request,
    papara,
  };

  const allTransactions = await new HttpRequest("api").get(
    "transactions/islemlistesi",
    paramsDeposit
  );
  return allTransactions;
};

export default TransactionListsPage;
