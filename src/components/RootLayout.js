import { Outlet } from "react-router-dom";
import Header from "./ui/Header";
import { useState } from "react";
import Container from "./ui/Container";
import Sidebar from "./ui/Sidebar";
import Panel from "./ui/panel/Panel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faRocket,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";

const GOD = [
  {
    parent: "Operasyonel İşlemler",
    icon: <FontAwesomeIcon icon={faRocket} />,
    children: [
      {
        text: "Başarılı Yatırım İşlemleri",
        to: "/success-deposit",
      },
      {
        text: "Reddedilen Yatırım İşlemleri",
        to: "/rejection-deposit",
      },
      {
        text: "Bekleyen Yatırım İşlemleri",
        to: "/waiting-deposit",
      },
      {
        text: "Başarılı Çekim İşlemleri",
        to: "/success-withdraw",
      },
      {
        text: "Reddedilen Çekim İşlemleri",
        to: "/rejection-withdraw",
      },
      {
        text: "Bekleyen Çekim İşlemleri",
        to: "/waiting-withdraw",
      },
    ],
  },
  {
    parent: "Tanımlamalar",
    icon: <FontAwesomeIcon icon={faSliders} />,
    children: [
      {
        text: "Oyuncular",
        to: "/players",
      },
      {
        text: "Kullanıcılar",
        to: "/users",
      },
      {
        text: "Kullanıcı Oluştur",
        to: "/create-user",
      },
      {
        text: process.env.REACT_APP_PAPARA_ENABLED === "true" ? "Papara Hesapları" : "Banka Hesapları",
        to: "/bank-accounts",
      }

    ],
  },
  {
    parent: "Finansal İşlemler",
    icon: <FontAwesomeIcon icon={faCoins} />,
    children: [
      {
        text: "Mutabakat Ekranı",
        to: "/consensus",
      },
      {
        text: "Havuz Ayarları",
        to: "/pools",
      },
      {
        text: "Loglar",
        to: "/logs",
      },
      {
        text: "Web Siteleri",
        to: "/websites",
      },

      {
        text: "Kasa ve Teslimat",
        to: "/cash-delivery",
      },
    ],
  },
];

const SUPER_ADMIN = [
  {
    parent: "Operasyonel İşlemler",
    icon: <FontAwesomeIcon icon={faRocket} />,
    children: [
      {
        text: "Başarılı Yatırım İşlemleri",
        to: "/success-deposit",
      },
      {
        text: "Reddedilen Yatırım İşlemleri",
        to: "/rejection-deposit",
      },
      {
        text: "Bekleyen Yatırım İşlemleri",
        to: "/waiting-deposit",
      },
      {
        text: "Başarılı Çekim İşlemleri",
        to: "/success-withdraw",
      },
      {
        text: "Reddedilen Çekim İşlemleri",
        to: "/rejection-withdraw",
      },
      {
        text: "Bekleyen Çekim İşlemleri",
        to: "/waiting-withdraw",
      },
    ],
  },
  {
    parent: "Tanımlamalar",
    icon: <FontAwesomeIcon icon={faSliders} />,
    children: [
      {
        text: "Oyuncular",
        to: "/players",
      },
      {
        text: "Kullanıcılar",
        to: "/users",
      },
      {
        text: "Kullanıcı Oluştur",
        to: "/create-user",
      },
      {
        text: process.env.REACT_APP_PAPARA_ENABLED === "true" ? "Papara Hesapları" : "Banka Hesapları",
        to: "/bank-accounts",
      }

    ],
  },
  {
    parent: "Finansal İşlemler",
    icon: <FontAwesomeIcon icon={faCoins} />,
    children: [
      {
        text: "Mutabakat Ekranı",
        to: "/consensus",
      },
      {
        text: "Loglar",
        to: "/logs",
      },
      {
        text: "Havuz Ayarları",
        to: "/pools",
      },

      {
        text: "Kasa ve Teslimat",
        to: "/cash-delivery",
      },
    ],
  },
];

const ADMIN = [
  {
    parent: "Operasyonel İşlemler",
    icon: <FontAwesomeIcon icon={faRocket} />,
    children: [
      {
        text: "Başarılı Yatırım İşlemleri",
        to: "/success-deposit",
      },
      {
        text: "Reddedilen Yatırım İşlemleri",
        to: "/rejection-deposit",
      },
      {
        text: "Bekleyen Yatırım İşlemleri",
        to: "/waiting-deposit",
      },
      {
        text: "Başarılı Çekim İşlemleri",
        to: "/success-withdraw",
      },
      {
        text: "Reddedilen Çekim İşlemleri",
        to: "/rejection-withdraw",
      },
      {
        text: "Bekleyen Çekim İşlemleri",
        to: "/waiting-withdraw",
      },
    ],
  },
  {
    parent: "Finansal İşlemler",
    icon: <FontAwesomeIcon icon={faCoins} />,
    children: [
      {
        text: "Mutabakat Ekranı",
        to: "/consensus",
      },
      {
        text: "Loglar",
        to: "/logs",
      },
    ],
  },
  {
    parent: "Tanımlamalar",
    icon: <FontAwesomeIcon icon={faSliders} />,
    children: [
      {
        text: process.env.REACT_APP_PAPARA_ENABLED === "true" ? "Papara Hesapları" : "Banka Hesapları",
        to: "/bank-accounts",
      }

    ],
  },
];

const USER = [
  {
    parent: "Operasyonel İşlemler",
    icon: <FontAwesomeIcon icon={faRocket} />,
    children: [
      {
        text: "Başarılı Yatırım İşlemleri",
        to: "/success-deposit",
      },
      {
        text: "Reddedilen Yatırım İşlemleri",
        to: "/rejection-deposit",
      },
      {
        text: "Bekleyen Yatırım İşlemleri",
        to: "/waiting-deposit",
      },
      {
        text: "Başarılı Çekim İşlemleri",
        to: "/success-withdraw",
      },
      {
        text: "Reddedilen Çekim İşlemleri",
        to: "/rejection-withdraw",
      },
      {
        text: "Bekleyen Çekim İşlemleri",
        to: "/waiting-withdraw",
      },
    ],
  },
  {
    parent: "Finansal İşlemler",
    icon: <FontAwesomeIcon icon={faCoins} />,
    children: [
      {
        text: "Mutabakat Ekranı",
        to: "/consensus",
      },
      {
        text: "Loglar",
        to: "/logs",
      },
    ],
  },
];

const WEBSITE = [
  {
    parent: "Operasyonel İşlemler",
    icon: <FontAwesomeIcon icon={faRocket} />,
    children: [
      {
        text: "Başarılı Yatırım İşlemleri",
        to: "/success-deposit",
      },
      {
        text: "Reddedilen Yatırım İşlemleri",
        to: "/rejection-deposit",
      },
      {
        text: "Bekleyen Yatırım İşlemleri",
        to: "/waiting-deposit",
      },
      {
        text: "Başarılı Çekim İşlemleri",
        to: "/success-withdraw",
      },
      {
        text: "Reddedilen Çekim İşlemleri",
        to: "/rejection-withdraw",
      },
      {
        text: "Bekleyen Çekim İşlemleri",
        to: "/waiting-withdraw",
      },
    ],
  },
  {
    parent: "Finansal İşlemler",
    icon: <FontAwesomeIcon icon={faCoins} />,
    children: [
      {
        text: "Mutabakat Ekranı",
        to: "/consensus",
      },
      {
        text: "Loglar",
        to: "/logs",
      },
    ],
  },
];

const RootLayout = () => {
  const [sidebar, setSidebar] = useState(false);

  const handleSidebar = () => setSidebar(!sidebar);

  const profile =
    JSON.parse(localStorage.getItem("remoteProfile")) ||
    JSON.parse(localStorage.getItem("profile"));

  const { type } = profile;

  let links;
  switch (type) {
    case "god":
      links = GOD;
      break;

    case "super_admin":
      links = SUPER_ADMIN;
      break;

    case "admin":
      links = ADMIN;
      break;

    case "user":
      links = USER;
      break;

    case "website":
      links = WEBSITE;
      break;

    default:
      throw new Error("Unkown user type.");
  }

  return (
    <div className="App">
      <aside className="hidden lg:block ">
        <Panel links={links} />
      </aside>
      <Sidebar show={sidebar} handleSidebar={handleSidebar} links={links} />
      <main>
        <Header handleSidebar={handleSidebar} className={"mb-12"} />
        <Container>
          {/* A placeholder for pages */}
          <Outlet />
        </Container>
      </main>
    </div>
  );
};

export default RootLayout;
