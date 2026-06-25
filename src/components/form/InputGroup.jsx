export function InputGroup({ prepend, append, className, children }) {
  return (
    <div className={['input-group', className].filter(Boolean).join(' ')}>
      {prepend && <span className="input-group-text">{prepend}</span>}
      {children}
      {append && <span className="input-group-text">{append}</span>}
    </div>
  )
}
