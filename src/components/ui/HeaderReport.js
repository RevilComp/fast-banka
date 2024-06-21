import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const HeaderReport = ({ icon, title, amount, backgroundColor, rotate, number }) => {
  return (
    <div className={`depositAmount w-full flex p-2 pr-10 pl-5 rounded-lg mt-3 ${backgroundColor}`}>
      <FontAwesomeIcon icon={icon} className={`text-3xl transform mr-5 rotate-${rotate}`} />
      <div>
        <h5>{title}</h5>
        <div className="flex justify-between">
          <h5 className="pt-1">{amount}</h5>
          <h5 className="pt-1">{number}</h5>
        </div>
      </div>
    </div>
  );
};

export default HeaderReport;
