import Button from "./Button";
import Modal from "./Modal";

const Confirm = ({
  show,
  title,
  message,
  handleCloseConfirm,
  handleConfirm,
}) => (
  <Modal
    show={show}
    handleModal={handleCloseConfirm}
    className={"w-11/12 mx-4 md:mx-0 md:w-2/4 lg:w-1/4"}
  >
    <Modal.Header handleModal={handleCloseConfirm}>
      <h1>{title}</h1>
    </Modal.Header>
    <Modal.Body>
      <p className="text-gray-500">{message}</p>
    </Modal.Body>
    <Modal.Footer className={"flex items-center justify-end gap-3"}>
      <Button type={"button"} className={"!px-4"} onClick={handleCloseConfirm}>
        <span className="text-gray-700">HAYIR</span>
      </Button>
      <Button
        type={"button"}
        variant={"primary"}
        onClick={() => {
          handleConfirm();
          handleCloseConfirm();
        }}
      >
        EVET
      </Button>
    </Modal.Footer>
  </Modal>
);

export default Confirm;
