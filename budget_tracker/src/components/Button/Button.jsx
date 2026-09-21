import './Button.css'

export default function Button({ onClick, type = 'button', ariaLabel, children }) {
  return (
    <button className="btn" type={type} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  )
}