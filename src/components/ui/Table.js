import { Typography } from "@material-tailwind/react";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "../../components/ui/Spinner";

const Table = ({
  tableHead,
  tableRows,
  className,
  next = () => {},
  hasNext = false,
}) => {
  return (
    <div
      className={`h-full w-full overflow-auto overflow-x-hidden ${className}`}
    >
      <InfiniteScroll
        dataLength={tableRows?.length} //This is important field to render the next data
        next={next}
        hasMore={hasNext}
        style={{ overflowY: "hidden" }}
        loader={
          hasNext && (
            <center className="my-5">
              <Spinner />
            </center>
          )
        }
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>Sayfa Sonu</b>
          </p>
        }
      >
        <table className="w-full min-w-max table-auto text-left">
          <thead className="bg-secondary text-white">
            <tr>
              {tableHead.map((head) => (
                <th
                  key={head?._id}
                  className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-semibold leading-none opacity-70 text-center"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, index) => (
              <tr
                key={index}
                // className={
                //   index % 2 === 0 ? "even:bg-gray-500" : "even:bg-gray-200"
                // }
                className="bg-light even:bg-gray-200"
              >
                {Object.values(row).map((value, index) => (
                  <td key={index} className="p-4">
                    <Typography
                      variant="small"
                      className="font-normal leading-none opacity-70 text-center"
                    >
                      {value}
                    </Typography>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
};

export default Table;
