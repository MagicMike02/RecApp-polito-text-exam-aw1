import PropTypes from "prop-types";
import "./CreateRecapButton.css";

function CreateRecapButton({ onClick, children, disabled, type = "button" }) {
  return (
    <button className="create-recap-btn" onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  );
}

CreateRecapButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  type: PropTypes.string,
};

export default CreateRecapButton;
