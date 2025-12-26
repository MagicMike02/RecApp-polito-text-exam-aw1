// Alert.jsx
import PropTypes from 'prop-types';
import './Alert.css';

function Alert({ message, type = 'info' }) {
  return (
    <div className={`alert alert-${type}`}>
      {message}
    </div>
  );
}

Alert.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
};

export default Alert;