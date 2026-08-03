import { cx } from '../../utils/cx'

export function InputGroup({ prepend, append, className, children }) {
  return (
    <div className={cx('input-group', className)}>
      {prepend && <span className="input-group-text">{prepend}</span>}
      {children}
      {append && <span className="input-group-text">{append}</span>}
    </div>
  )
}
