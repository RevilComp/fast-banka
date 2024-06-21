import styles from "./Loading.module.css";

const Loading = () => (
  <>
    <div
      className={`flex items-center justify-center gap-3 w-full rounded shadow, border p-5 lg:p-12 mb-12 ${styles.loading}`}
    >
      {/* <Spinner /> */}
      <div
        className="p-6 rounded w-full"
        style={{ backgroundColor: "rgb(200, 200, 200)" }}
      ></div>
      <div
        className="p-6 rounded w-full"
        style={{ backgroundColor: "rgb(200, 200, 200)" }}
      ></div>
      <div
        className="px-8 p-4 bg-light rounded"
        style={{ backgroundColor: "rgb(200, 200, 200)" }}
      ></div>
    </div>
    <div
      className={`w-full rounded shadow, border p-5 lg:p-12 mb-12 ${styles.loading}`}
      style={{ height: "100vh" }}
    >
      <div
        className="w-full rounded-t p-6"
        style={{ backgroundColor: "rgb(200, 200, 200)" }}
      ></div>
      <div
        className="flex items-center justify-center w-full p-6"
        style={{ backgroundColor: "rgb(225, 225, 225)", height: "95%" }}
      ></div>
    </div>
  </>
);

export default Loading;
