import { Suspense, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import useInput from "../../hooks/useInput";
import HttpRequest from "../../utils/HttpRequest";
import { useMutation } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import * as RemoteController from "../../remoteControl";
import Loading from "../../components/ui/loading/Loading";
import { Await, useLoaderData, useNavigate } from "react-router-dom";
import Dialog from "../../components/ui/Dialog";


const editBankAccount = async (payload) => {
  return await new HttpRequest("api").post("bankaccounts/update", payload);
};

const EditBankAccountPageBanka = () => {
  const loaderData = useLoaderData();
  const [bank, setBank] = useState("");
  const papara = localStorage.getItem("mode") === "papara" ? true : false;
  const token = RemoteController.getToken();
  const queryParams = new URLSearchParams(window.location.search);
  const _id = queryParams.get("_id");
  const [selectedBank, setSelectedBank] = useState();
  const [dialog, setDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const navigate = useNavigate();


  const {
    state: { value: bankName },
    handleOnChange: bankNameOnChange,
  } = useInput();
  const {
    state: { value: bankAccountNumber },
    handleOnChange: bankAccountNumberOnChange,
  } = useInput();
  const {
    state: { value: branchCode },
    handleOnChange: branchCodeOnChange,
  } = useInput();
  const {
    state: { value: iban },
    handleOnChange: ibanOnChange,
  } = useInput();
  const {
    state: { value: additionalInfo },
    handleOnChange: additionalInfoOnChange,
  } = useInput();
  const {
    state: { value: bankDescription },
    handleOnChange: bankDescriptionOnChange,
  } = useInput();
  const {
    state: { value: depositDownLimit },
    handleOnChange: depositDownLimitOnChange,
  } = useInput();
  const {
    state: { value: depositUpLimit },
    handleOnChange: depositUpLimitOnChange,
  } = useInput();
  const {
    state: { value: withdrawDownLimit },
    handleOnChange: withdrawDownLimitOnChange,
  } = useInput();
  const {
    state: { value: withdrawUpLimit },
    handleOnChange: withdrawUpLimitOnChange,
  } = useInput();
  const {
    state: { value: singleDepositUpLimit },
    handleOnChange: singleDepositUpLimitOnChange,
  } = useInput();
  const {
    state: { value: dailyDepositLimit },
    handleOnChange: dailyDepositLimitOnChange,
  } = useInput();
  const {
    state: { value: dailyWithdrawLimit },
    handleOnChange: dailyWithdrawLimitOnChange,
  } = useInput();
  const handleBankChange = (event) => setBank(event.target.value);
  const handleDialog = () => setDialog(!dialog);


  const editBankAccountMutation = useMutation(editBankAccount, {
    onSuccess: (data) => {
      console.log("data: ", data);
      if (data.status === "fail") {
        setDialog(true);
        setDialogTitle("Error");
        setDialogMessage(data.message);
      }
      if (data.status === "success") {
        setDialog(true);
        setDialogTitle("Success");
        setDialogMessage(data.message + ". Banka Hesaplarına yönlediriliyorsunuz");
        setTimeout(() => {
          navigate("/bank-accounts");
        }, 5000);
      }
    },
  });


  const handleEditBankAccount = (e) => {
    e.preventDefault();
    editBankAccountMutation.mutate({
      _id: _id,
      bankName: bank || selectedBank.bankName || selectedBank.bankName2,
      nameSurname: bankName || selectedBank.nameSurname,
      accountNumber: bankAccountNumber || selectedBank.accountNumber,
      branchCode: branchCode || selectedBank.branchCode,
      iban: iban || selectedBank.iban,
      additionalDescription:
        additionalInfo || selectedBank.additionalDescription,
      description: bankDescription || selectedBank.description,
      accountDepositLimitTransactionNumber:
        dailyDepositLimit || selectedBank.accountDepositLimitTransactionNumber, // Yatırılabilir Adet
      accountWithdrawLimitTransactionNumber:
        dailyWithdrawLimit ||
        selectedBank.accountWithdrawLimitTransactionNumber, // Çekilebilir Adet
      minimumDepositLimit: depositDownLimit || selectedBank.minimumDepositLimit, // Yatırım Alt limit
      maximumDepositLimit: depositUpLimit || selectedBank.maximumDepositLimit, // Yatırım Üst limit
      minimumWithdrawLimit:
        withdrawDownLimit || selectedBank.minimumWithdrawLimit, // Ödeme Alt Limit
      maximumWithdrawLimit:
        withdrawUpLimit || selectedBank.maximumWithdrawLimit, // Ödeme Üst limit
      singularDepositForAccountPassive:
        singleDepositUpLimit || selectedBank.singularDepositForAccountPassive, // Teki Yatırım Limiti
      institutional: false,
      mailHost: "gmail",
      token: token,
      papara,
    });
  };

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Await resolve={loaderData}>
          {(resolvedData) => {
            if (!resolvedData) return;

            const data = resolvedData;
            setSelectedBank(data);
            return (
              <Card>
                <form onSubmit={handleEditBankAccount}>
                  <Card.Header>
                    <h1 className="font-bold">
                      {data.bankName} Banka Hesabını Düzenle
                    </h1>
                  </Card.Header>
                  <Card.Body className={"my-5"}>
                    <div className="mb-5">
                      <div className="md:flex md:gap-2 md:space-y-0 space-y-5 mt-5">
                        <select
                          name="user-type"
                          id="user-type"
                          className="w-full rounded-md py-3 border-gray-300"
                          value={bank || data.bankName2 || data.bankName}
                          defaultValue={bank || data.bankName}
                          onChange={handleBankChange}
                        >
                          <option value="">Banka Seçiniz</option>
                          <option value="7/24 Fast">7/24 Fast</option>
                          <option value="Ziraat Bankası">Ziraat Bankası</option>
                          <option value="Garanti Bankası">
                            Garanti Bankası
                          </option>
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
                          label={"Banka Adı"}
                          placeholder={"Banka Adı"}
                          autoFocus={false}
                          value={bankName || data?.nameSurname}
                          onChange={bankNameOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                      </div>
                      <div className="md:flex md:gap-2 md:space-y-0 space-y-5 mt-5">
                        <Input
                          type={"text"}
                          name={"bankAccountNumber"}
                          label={"Banka Hesap Numarası"}
                          placeholder={"Banka Hesap Numarası"}
                          autoFocus={false}
                          value={bankAccountNumber || data?.accountNumber}
                          onChange={bankAccountNumberOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                        <Input
                          type={"text"}
                          name={"branchCode"}
                          label={"Şube Kodu"}
                          placeholder={"Şube Kodu"}
                          autoFocus={false}
                          value={branchCode || data.branchCode}
                          onChange={branchCodeOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                      </div>
                      <div className="md:flex md:gap-2 md:space-y-0 space-y-5 mt-5">
                        <Input
                          type={"text"}
                          name={"iban"}
                          label={"IBAN"}
                          placeholder={"IBAN"}
                          autoFocus={false}
                          value={iban || data.iban}
                          onChange={ibanOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                        <Input
                          type={"text"}
                          name={"additionalInfo"}
                          label={"Ek Bilgi"}
                          placeholder={"Ek Bilgi"}
                          autoFocus={false}
                          value={additionalInfo || data.additionalDescription}
                          onChange={additionalInfoOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                      </div>
                      <div className="md:flex md:gap-2 md:space-y-0 space-y-5 mt-5">
                        <Input
                          type={"text"}
                          name={"bankDescription"}
                          label={"Açıklama"}
                          placeholder={"Açıklama"}
                          autoFocus={false}
                          value={bankDescription || data.description}
                          onChange={bankDescriptionOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                      </div>
                      <div className="md:flex md:gap-2 md:space-y-0 space-y-5 mt-5">
                        <Input
                          type={"number"}
                          name={"dailyDepositLimit"}
                          label={"Yatırım Adet Limiti"}
                          placeholder={"Yatırım Adet Limiti"}
                          autoFocus={false}
                          value={
                            dailyDepositLimit ||
                            data.accountDepositLimitTransactionNumber
                          }
                          onChange={dailyDepositLimitOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                        <Input
                          type={"number"}
                          name={"dailyWithdrawLimit"}
                          label={"Çekim Adet Limiti"}
                          placeholder={"Çekim Adet Limiti"}
                          autoFocus={false}
                          value={
                            dailyWithdrawLimit ||
                            data.accountWithdrawLimitTransactionNumber
                          }
                          onChange={dailyWithdrawLimitOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                      </div>
                      <div className="md:flex md:gap-2 md:space-y-0 space-y-5 mt-5">
                        <Input
                          type={"number"}
                          name={"depositDownLimit"}
                          label={"Yatırım Alt Limit"}
                          placeholder={"Yatırım Alt Limit"}
                          autoFocus={false}
                          value={depositDownLimit || data.minimumDepositLimit}
                          onChange={depositDownLimitOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                        <Input
                          type={"number"}
                          name={"depositUpLimit"}
                          label={"Yatırım Üst Limit"}
                          placeholder={"Yatırım Üst Limit"}
                          autoFocus={false}
                          value={depositUpLimit || data.maximumDepositLimit}
                          onChange={depositUpLimitOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                      </div>
                      <div className="md:flex md:gap-2 md:space-y-0 space-y-5 mt-5">
                        <Input
                          type={"number"}
                          name={"withdrawDownLimit"}
                          label={"Çekim Alt Limit"}
                          placeholder={"Çekim Alt Limit"}
                          autoFocus={false}
                          value={withdrawDownLimit || data.minimumWithdrawLimit}
                          onChange={withdrawDownLimitOnChange}
                          classNames={"min-h-5 lg:min-h-5"}
                        />
                        <Input
                          type={"number"}
                          name={"withdrawUpLimit"}
                          label={"Çekim Üst Limit"}
                          placeholder={"Çekim Üst Limit"}
                          autoFocus={false}
                          value={withdrawUpLimit || data.maximumWithdrawLimit}
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
                          value={
                            singleDepositUpLimit ||
                            data.singularDepositForAccountPassive
                          }
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
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      type={"submit"}
                      variant={"primary"}
                      className={"mt-5 w-full py-4"}
                    >
                      Düzenle
                    </Button>
                  </Card.Footer>
                </form>
              </Card>
            );
          }}
        </Await>
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
  const queryParams = new URLSearchParams(window.location.search);
  const _id = queryParams.get("_id");
  const token = RemoteController.getToken();
  const paramsDeposit = {
    token: token,
    _id: _id,
  };
  const bankAccountById = await new HttpRequest("api").get(
    "bankaccounts/getbankbyid",
    paramsDeposit
  );
  return bankAccountById;
};

export default EditBankAccountPageBanka;