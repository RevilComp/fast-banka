import { Suspense, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVault,
  faArrowUpFromBracket,
  faPercent,
  faFileExcel,
  faDownload,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../../components/ui/Button";
import * as RemoteController from "../../remoteControl";
import HttpRequest from "../../utils/HttpRequest";
import { Await, Form, useLoaderData } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";
import Datepicker from "react-tailwindcss-datepicker";
import Card from "../../components/ui/Card";
import moment from "moment";
import HeaderReport from "../../components/ui/HeaderReport";
import { useQuery } from "react-query";
import axios from "axios";
// TODO : BEKLEYEN İŞLEM VE POOL FİLTRELEME EKLENECEK

const getMutabakat = async (usersData) =>
  await new HttpRequest("api").get(
    `users/mutabakat?token=${usersData.queryKey[1].token}&selectedUser=${usersData.queryKey[1].selectedUser}&startDate=${usersData.queryKey[1].startDate}&endDate=${usersData.queryKey[1].endDate}&papara=${usersData.queryKey[1].papara}`,
    {
      ...(usersData.queryKey[1].pool !== "all" && usersData.queryKey[1].pool
        ? { pool: usersData.queryKey[1].pool }
        : {}),
    }
  );

const getWebsiteMutabakat = async (usersData) =>
  await new HttpRequest("api").get(
    `users/mutabakat-website?token=${usersData.queryKey[1].token}&selectedUser=${usersData.queryKey[1].selectedUser}&startDate=${usersData.queryKey[1].startDate}&endDate=${usersData.queryKey[1].endDate}&papara=${usersData.queryKey[1].papara}`
  );

const getPool = async (payloadData) =>
  await new HttpRequest("api").get(
    `pool?token=${payloadData.queryKey[1].token}`
  );

const ConsensusPage = () => {
  const loaderData = useLoaderData();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [excelLoading, setExcelLoading] = useState(false);
  const [mutabakatData, setMutabakatData] = useState({});
  const [poolData, setPoolData] = useState();
  const [selectedPool, setSelectedPool] = useState("all");
  const profile = JSON.parse(localStorage.getItem("profile"));
  const [selectedWebsite, setSelectedWebsite] = useState(
    profile?.type == "website" ? profile?._id : "all"
  );

  const handleDateChange = (newValue) => {
    setDateRange(newValue);
  };
  const handleWebsiteChange = (event) => setSelectedWebsite(event.target.value);

  const handleSelectedPoolChange = (event) =>
    setSelectedPool(event.target.value);

  function formatMoney(n) {
    try {
      if (!n) return 0;
      const x = parseFloat(n)
        .toFixed(2)
        .replace(/(\d)(?=(\d{3})+\.)/g, "$1.")
        .replace(/\.(\d+)$/, ",$1");

      return x;
    } catch (e) {
      return n;
    }
  }
  const calculateCommission = (deposit, withdraw, commission) => {
    const amount = Number(deposit);
    return `${formatMoney(amount)}TRY x ${commission}% / 100 = ${formatMoney(
      (amount * commission) / 100
    )}TRY`;
  };

  const token = RemoteController.getToken();
  const papara = localStorage.getItem("mode") === "papara" ? true : false;
  const websiteMutabakatParams = {
    token: token,
    selectedUser: selectedWebsite,
    startDate: moment(dateRange.startDate).format("YYYY-MM-DD"),
    endDate: moment(dateRange.endDate).format("YYYY-MM-DD"),
    papara,
  };

  const getMutabakatData = {
    token: token,
    selectedUser: selectedWebsite,
    startDate: moment(dateRange.startDate).format("YYYY-MM-DD"),
    endDate: moment(dateRange.endDate).format("YYYY-MM-DD"),
    papara,
    pool: selectedPool,
  };

  const { isLoading: IsMutabakatLoading, refetch: refetchMutabakat } = useQuery(
    ["getMutabakat", getMutabakatData],
    {
      refetchOnWindowFocus: false,
      queryFn: async (data) => {
        if (profile?.type == "website") return;
        const response = await getMutabakat(data);
        if (response?.status !== "fail") {
          setMutabakatData(response);
        }
      },
    }
  );

  const {
    isLoading: IsWebsiteMutabakatLoading,
    refetch: refetchWebsiteMutabakat,
  } = useQuery(["getWebsiteMutabakat", websiteMutabakatParams], {
    refetchOnWindowFocus: false,
    queryFn: async (data) => {
      if (profile?.type !== "website") return;
      const response = await getWebsiteMutabakat(data);
      if (response?.status !== "fail") {
        setMutabakatData(response);
      }
    },
  });

  const { isLoading: IsPoolDataLoading, refetch: refetchPoolData } = useQuery(
    [
      "getWebsiteMutabakat",
      {
        token: token,
      },
    ],
    {
      refetchOnWindowFocus: false,
      queryFn: async (data) => {
        if (profile?.type !== "god") return;
        const response = await getPool(data);
        if (response?.status !== "fail") {
          setPoolData(response);
        }
      },
    }
  );

  const downloadExcel = () => {
    axios
      .post(
        process.env.REACT_APP_API_URL + "api/transactions/excel",
        {
          token: token,
          selectedUser: selectedWebsite,
          startDate: moment(dateRange.startDate).format("YYYY-MM-DD"),
          endDate: moment(dateRange.endDate).format("YYYY-MM-DD"),
          papara,
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
  const handleFilter = () => {};

  return (
    <>
      <Suspense
        fallback={
          <center>
            <Spinner />
          </center>
        }
      >
        <Await resolve={loaderData}>
          {(websites) => {
            if (!websites) return;

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
                            onChange={handleDateChange}
                            showShortcuts={true}
                            inputName="date-range"
                          />
                        </div>
                        <div className="mt-5 flex-grow">
                          <select
                            name="status-type"
                            id="status-type"
                            className="w-full rounded-md py-3 border-gray-300"
                            value={selectedWebsite}
                            onChange={handleWebsiteChange}
                          >
                            <option value="" disabled>
                              Site Seçiniz
                            </option>
                            {profile.type !== "website" && (
                              <option value="all">Tüm Siteler</option>
                            )}
                            {websites?.map((website, index) => (
                              <option value={website._id}>
                                {profile.type == "god"
                                  ? website.username
                                  : website.shortName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {profile?.type === "god" && (
                          <div className="mt-5 flex-grow">
                            <select
                              name="status-type"
                              id="status-type"
                              className="w-full rounded-md py-3 border-gray-300"
                              value={selectedPool}
                              onChange={handleSelectedPoolChange}
                            >
                              <option value="" disabled>
                                Saha Seçiniz
                              </option>
                              <option value="all">Tüm Sahalar</option>
                              {poolData?.map((pool, index) => (
                                <option value={pool._id}>
                                  {pool?.title || "İsimsiz Saha"}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="mt-5 md:flex">
                          <Button
                            onClick={() => handleFilter()}
                            type={"submit"}
                            variant={"primary"}
                            className="w-full h-full"
                          >
                            Filtrele
                          </Button>
                        </div>
                        <div className="mt-5 md:flex">
                          <Button
                            type={"submit"}
                            variant={"orange"}
                            className="w-full h-full "
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
                      </div>
                    </Form>
                  </Card.Body>
                </Card>

                <div>
                  <div className="flex flex-col lg:flex-row text-white gap-5 mb-4">
                    <HeaderReport
                      icon={faArrowUpFromBracket}
                      title={"Toplam Yatırım Tutarı"}
                      amount={`${
                        mutabakatData?.getTransactionSumDeposit?.amount || 0
                      } TRY`}
                      backgroundColor={"bg-primary"}
                    />
                    <HeaderReport
                      icon={faDownload}
                      title={"Toplam Çekim Tutarı"}
                      amount={`${
                        mutabakatData?.getTransactionSumWithdraw?.amount || 0
                      } TRY`}
                      backgroundColor={"bg-[#f1416c]"}
                    />
                  </div>
                  <div className="flex flex-col lg:flex-row text-white gap-5 mb-4">
                    <HeaderReport
                      icon={faArrowUpFromBracket}
                      title={"Toplam Yatırım Sayısı"}
                      amount={`${
                        mutabakatData?.getTransactionSumDeposit?.number || 0
                      } Adet`}
                      backgroundColor={"bg-primary"}
                    />
                    <HeaderReport
                      icon={faDownload}
                      title={"Toplam Çekim Sayısı"}
                      amount={`${
                        mutabakatData?.getTransactionSumWithdraw?.number || 0
                      } Adet`}
                      backgroundColor={"bg-[#f1416c]"}
                    />
                  </div>
                  <div className="flex flex-col lg:flex-row text-white gap-5 mb-12">
                    {(profile?.type === "god" ||
                      profile?.type == "super_admin") && (
                      <HeaderReport
                        icon={faPercent}
                        title={"Toplam Komisyon Tutarı"}
                        amount={`${calculateCommission(
                          mutabakatData?.getTransactionSumDeposit?.amount || 0,
                          mutabakatData?.getTransactionSumWithdraw?.amount || 0,
                          mutabakatData?.commissionRate || 0
                        )} TRY`}
                        backgroundColor={"bg-[#7239ea]"}
                      />
                    )}
                    <HeaderReport
                      icon={faVault}
                      title={"Kasa"}
                      amount={`${mutabakatData?.balance || 0} TRY`}
                      backgroundColor={"bg-[#50cd89]"}
                    />
                  </div>
                  <div>
                    {localStorage.getItem("remoteProfile") !== null ||
                    localStorage.getItem("profile").type === "god" ||
                    localStorage.getItem("profile").type === "super_admin" ? (
                      <div className="flex flex-col lg:flex-row text-white gap-5 mb-12">
                        <HeaderReport
                          icon={faHourglassHalf}
                          title={"Bekleyen Yatırım İşlemleri"}
                          amount={`${mutabakatData?.waitingDeposit}`}
                          backgroundColor={"bg-primary"}
                        />
                        <HeaderReport
                          icon={faHourglassHalf}
                          title={"Bekleyen Çekim İşlemleri"}
                          amount={`${mutabakatData?.waitingWithdraw}`}
                          backgroundColor={"bg-[#f1416c]"}
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
};

export const loader = async ({ request }) => {
  // const getProfileInformation = JSON.parse(localStorage.getItem("profile"));
  // const startOfToday = moment().startOf("day");
  // const endOfToday = moment().endOf("day");
  const token = RemoteController.getToken();
  // const papara = localStorage.getItem("mode") === "papara" ? true : false;
  // const state = {
  //   selectedUser:
  //     getProfileInformation?.type === "website"
  //       ? getProfileInformation._id
  //       : "all",
  //   startDate: startOfToday.format("YYYY-MM-DD"),
  //   endDate: endOfToday.format("YYYY-MM-DD"),
  //   comissionRate: 0,
  //   papara: papara,
  // };
  // const paramsDeposit = {
  //   token: token,
  //   ...state,

  // };

  // let mutabakatData;
  const paramsUsers = {
    token: token,
  };
  const websiteUsers = await new HttpRequest("api").get(
    "users/website-users",
    paramsUsers
  );
  // if (getProfileInformation.type === "website") {
  //   mutabakatData = await new HttpRequest("api").get(
  //     "users/mutabakat-website",
  //     paramsDeposit
  //   );
  // } else {
  //   mutabakatData = await new HttpRequest("api").get(
  //     "users/mutabakat",
  //     paramsDeposit
  //   );
  // }
  // const allDataResponse = [websiteUsers, mutabakatData];
  // return allDataResponse;
  return websiteUsers;
};

export default ConsensusPage;
