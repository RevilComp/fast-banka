import Table from "../../components/ui/Table";
import { Suspense, useState, useEffect } from "react";
import * as RemoteController from "../../remoteControl";
import HttpRequest from "../../utils/HttpRequest";
import { Await, useLoaderData } from "react-router-dom";
import moment from "moment";
import { useMutation, useQuery } from "react-query";
import Button from "../../components/ui/Button";
import Confirm from "../../components/ui/Confirm";
import Dialog from "../../components/ui/Dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan } from "@fortawesome/free-solid-svg-icons";
import Input from "../../components/ui/Input";
import useInput from "../../hooks/useInput";

const getPlayers = async (playersData, limit, skip) =>
  await new HttpRequest("api").get(
    `players/players?token=${playersData.queryKey[1].token}&papara=${playersData.queryKey[1].papara}&search=${playersData.queryKey[1].search}`,
    {
      ...(limit && !playersData.queryKey[1].search && { limit }),
      ...(skip && !playersData.queryKey[1].search && { skip }),
    }
  );

const banPlayer = async (payload) =>
  await new HttpRequest("api").post("players/ban", payload);

const TABLE_HEAD = [
  "WEBSITE",
  "AD SOYAD",
  "YASAKLILIK",
  "İLK İŞLEM",
  "SON İŞLEM",
  "İŞLEMLER",
];

const PlayersPage = () => {
  const loaderData = useLoaderData();
  const [playersData, setPlayersData] = useState([]);
  const PAGE_SIZE = 20;
  const [hasNext, setHasNext] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const token = RemoteController.getToken();
  const papara = localStorage.getItem("mode") === "papara" ? true : false;
  const handleOpenConfirm = () => setConfirm(true);
  const handleCloseConfirm = () => setConfirm(false);
  const handleDialog = () => setDialog(!dialog);
const [search, setSearch] = useState("");
  const {
    state: { value: searchText, isValid: isSearchValid },
    handleOnChange: handleSearchOnChange,
  } = useInput();

  useEffect(() => {

    if(searchText == ""){
      return setSearch(searchText);
    }

    const delayDebounceFn = setTimeout(() => {
      setSearch(searchText);
    }, 800)

    return () => clearTimeout(delayDebounceFn)
  }, [searchText])
  

  const banPlayerMutation = useMutation(banPlayer, {
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

  const handleBan = (userId) => {
    banPlayerMutation.mutate({
      token: token,
      playerId: userId,
    });
  };

  const playerParams = {
    token: token,
    search: search,
    papara,
  };

  const { refetch: refetchPlayer } = useQuery(["getPlayers", playerParams], {
    queryFn: async (data) => {
      const response = await getPlayers(data, PAGE_SIZE, page * PAGE_SIZE);
      if (search) {
        setHasNext(true);
        setPage(0);
        return setPlayersData(response);
      }
      if(page == 0){
        setPlayersData(response);
      }
      else{
        setPlayersData((prev) => [...prev, ...response]);
      }
      setPage((prev) => prev + 1);
      if (!response?.length) {
        setHasNext(false);
      }
    },
    onSuccess: (data) => {
      // setPage(prev=>prev+1)
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Suspense fallback={"Loading..."}>
      <Await resolve={loaderData}>
        {(resolvedData) => {
          const tableRows = playersData.map((user) => ({
            WEBSITE: user.webSiteCode,
            "AD SOYAD": user.nameSurname,
            YASAKLILIK: user.isBanned ? "Yasaklı" : "Yasaklı Değil",
            "İLK İŞLEM": moment(user.createdAt).format("DD-MM-YYYY"),
            "SON İŞLEM": moment(user.updtedAt).format("DD-MM-YYYY"),
            İŞLEMLER: (
              <>
                <Button
                  type={"button"}
                  variant={"danger"}
                  onClick={() => {
                    handleOpenConfirm();
                    setSelectedUser(user._id);
                  }}
                >
                  <FontAwesomeIcon icon={faBan} size="lg" className="mr-3" />
                  IP Banla
                </Button>
              </>
            ),
          }));
          return (
            <>
              <section className="mb-6">
                <Input
                  type={"text"}
                  name={"search"}
                  placeholder={"Oyuncu ara"}
                  label={"Oyuncu ara"}
                  value={searchText}
                  onChange={handleSearchOnChange}
                  // className={"!w-auto"}
                />
              </section>

              <Table
                tableHead={TABLE_HEAD}
                tableRows={tableRows}
                next={() => refetchPlayer()}
                hasNext={hasNext}
              />

              <Confirm
                show={confirm}
                title={"Oyuncuyu banla"}
                message={"Bu oyuncuyu banlamak istediğinizden emin misiniz?"}
                handleCloseConfirm={handleCloseConfirm}
                handleConfirm={() => handleBan(selectedUser)}
              />
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

export default PlayersPage;
