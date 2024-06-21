import { useReducer } from "react";

const initialState = {
  value: "",
  isValid: null,
  isError: null,
  message: "",
};

const reducer = (state, action) => {
  const { type, name, payload } = action;

  switch (type) {
    case "onChange": {
      switch (name) {
        case "username": {
          return {
            value: payload.toLowerCase().trim(),
            isValid: payload.length >= 1,
          };
        }

        case "userId": {
          return {
            value: payload,
            //isValid: payload.length >= 1,
          };
        }

        case "name": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "title": {
          return {
            value: payload,
            //isValid: payload.length >= 1,
          };
        }

        case "url": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "name-surname": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "nameSurname": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "fullName": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "search": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "userIdInWebsite": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "surname": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "password": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "comissionRate": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "comissionRatePool": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "paparaMail": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "paparaMailPassword": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "minAmount": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "maxAmount": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "ga-code": {
          return {
            value: payload,
            isValid: payload.length === 6,
          };
        }

        case "rejectReason": {
          return {
            value: payload,
            // isValid: payload.length >= 3,
          };
        }

        case "amount": {
          return {
            value: payload,
            isValid: payload >= 1,
          };
        }

        case "note": {
          return {
            value: payload,
          };
        }

        case "transactionUId": {
          return {
            value: payload,
            isValid: payload.length >= 3,
          };
        }

        case "dailyDepositLimit": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "poolTitle": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "withdrawal-amount": {
          return {
            value: payload,
            isValid: Number(payload) >= 1,
          };
        }

        case "comission-amount": {
          return {
            value: payload,
            isValid: Number(payload) >= 1,
          };
        }

        case "dailyWithdrawLimit": {
          return {
            value: payload,
            isValid: Number(payload) >= 1,
          };
        }

        case "commissionRatePool": {
          return {
            value: payload,
            isValid: Number(payload) >= 1,
          };
        }

        case "bank-account-number": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "selectedGroupName": {
          return {
            value: payload,
          };
        }

        case "bankName": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "bankAccountNumber": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "branch-code": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "iban": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "cash-delivery-address": {
          return {
            value: payload,
            isValid: true,
          };
        }

        case "additionalInfo": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "bankDescription": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "depositDownLimit": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "depositUpLimit": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "withdrawDownLimit": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "withdrawUpLimit": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "singleDepositUpLimit": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "websiteName": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "shortName": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        case "targetName": {
          return {
            value: payload,
            isValid: payload.length >= 1,
          };
        }

        default: {
          return {
            value: "",
            isValid: true,
          };
        }
      }
    }

    case "onBlur": {
      switch (name) {
        case "username": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz kullanıcı adı",
          };
        }
        case "userId": {
          return {
            ...state,
          };
        }

        case "fullName": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz İsim",
          };
        }

        case "name": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz İsim",
          };
        }

        case "title": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz Başlık",
          };
        }

        case "url": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz URL",
          };
        }

        case "search": {
          return {
            ...state,
          };
        }

        case "userIdInWebsite": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz Kullanıcı ID",
          };
        }

        case "minAmount": {
          return {
            ...state,
          };
        }

        case "maxAmount": {
          return {
            ...state,
          };
        }

        case "rejectReason": {
          return {
            ...state,
          };
        }

        case "amount": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz Soyisim",
          };
        }

        case "transactionUId": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz İşlem ID",
          };
        }

        case "dailyDepositLimit": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz Yatırım Limiti",
          };
        }

        case "dailyWithdrawLimit": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz Çekim Limiti",
          };
        }

        case "surname": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz Soyisim",
          };
        }

        case "password": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz şifre",
          };
        }

        case "comissionRate": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz şifre",
          };
        }

        case "paparaMail": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz şifre",
          };
        }

        case "paparaMailPassword": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz şifre",
          };
        }

        case "bankName": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz banka adı.",
          };
        }

        case "bankAccountNumber": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz hesap numarası.",
          };
        }

        case "branchCode": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz şube kodu",
          };
        }

        case "iban": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz IBAN",
          };
        }

        case "additionalInfo": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz ek bilgi",
          };
        }

        case "bankDescription": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz açıklama",
          };
        }

        case "depositDownLimit": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz yatırım alt limiti",
          };
        }

        case "depositUpLimit": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz yatırım üst limiti",
          };
        }

        case "withdrawDownLimit": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz çekim alt limiti",
          };
        }

        case "withdrawUpLimit": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz çekim üst limiti",
          };
        }

        case "singleDepositUpLimit": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz tekil yatırım üst limiti",
          };
        }

        case "websiteName": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz website adı",
          };
        }

        case "shortName": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz kısa adı",
          };
        }

        case "targetName": {
          return {
            ...state,
            isError: !state.isValid,
            message: "Geçersiz Hedef URL",
          };
        }

        case "selectedGroupName": {
          return {
            ...state,
          };
        }

        default: {
          return {
            ...state,
            isError: false,
            message: "",
          };
        }
      }
    }

    case "onClear": {
      return {
        value: "",
        isValid: null,
        isError: null,
        message: "",
      };
    }

    default: {
      throw new Error(`Bilinmyen input type: ${type}`);
    }
  }
};

const useInput = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "onChange", name, payload: value });
  };

  const handleOnBlur = (e) => {
    const { name } = e.target;
    dispatch({ type: "onBlur", name });
  };

  const handleClear = () => {
    dispatch({ type: "onClear" });
  };

  return {
    state,
    handleOnChange,
    handleOnBlur,
    handleClear,
  };
};

export default useInput;
