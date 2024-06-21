import Button from "./Button";
import Modal from "./Modal";

const Dialog = ({ show, title, message, handleDialog }) => {
  return (
    <Modal
      show={show}
      handleModal={handleDialog}
      className={"w-11/12 mx-4 md:mx-0 md:w-1/4"}
    >
      <Modal.Header handleModal={handleDialog}>
        <h6 className="text-lg mx-auto font-bold">{title}</h6>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center text-gray-700">{message}</p>
      </Modal.Body>
      <Modal.Footer className={"text-center"}>
        <Button type={"button"} onClick={handleDialog}>
          <span className="text-primary hover:text-primary-darker">OK</span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Dialog;
