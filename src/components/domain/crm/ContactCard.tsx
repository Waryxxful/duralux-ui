import { forwardRef } from 'react'
import { cx } from '../../../utils/cx'
import type { ContactCardProps } from '../../../public/types'
import { Avatar } from '../../ui/Avatar'
import { Tag } from '../../ui/Tag'
import { headingTag } from '../../ui/internal/indicator'

/**
 * ContactCard — ficha 360 de un contacto o cliente: identidad, datos de contacto, etiquetas,
 * cifras y acciones.
 *
 * - Correo y teléfono son enlaces (`mailto:` y `tel:`) en monoespaciada; cada dato con su ícono
 *   decorativo y su nombre para lectores de pantalla.
 * - facts: cifras del cliente en una lista de descripción (2 columnas angosta, 3 desde 28rem).
 * - loading: skeleton y `aria-busy`.
 * Estilos: src/styles/components/contact-card.css.
 */
export const ContactCard = /* @__PURE__ */ forwardRef<HTMLElement, ContactCardProps>(function ContactCard({
  name,
  company,
  role,
  email,
  phone,
  src = null,
  tags,
  status,
  facts,
  actions,
  headingLevel = 2,
  loading = false,
  className,
  ...rest
}, ref) {
  const Heading = headingTag(headingLevel, 'h2')
  const subtitle = [role, company].filter(Boolean).join(' · ')

  return (
    <section
      {...rest}
      ref={ref}
      className={cx('card', 'gcu-contact', 'gcu-container', className)}
      aria-label={rest['aria-label'] ?? `Ficha de ${name}`}
      aria-busy={loading || undefined}
    >
      <div className="card-body gcu-contact__body">
        <div className="gcu-contact__head">
          <Avatar name={name} src={src} size="lg" />
          <div className="gcu-contact__who">
            <Heading className="gcu-contact__name">{name}</Heading>
            {subtitle && <span className="gcu-contact__subtitle">{subtitle}</span>}
            {status && <span className="gcu-contact__status">{status}</span>}
          </div>
        </div>
        {loading ? (
          <span className="gcu-skeleton gcu-contact__skeleton" />
        ) : (
          <>
            {(email || phone || company) && (
              <ul className="gcu-contact__meta">
                {company && (
                  <li><i className="feather-briefcase" aria-hidden="true" /><span className="visually-hidden">Empresa: </span>{company}</li>
                )}
                {email && (
                  <li>
                    <i className="feather-mail" aria-hidden="true" />
                    <span className="visually-hidden">Correo: </span>
                    <a className="gcu-contact__mono" href={`mailto:${email}`}>{email}</a>
                  </li>
                )}
                {phone && (
                  <li>
                    <i className="feather-phone" aria-hidden="true" />
                    <span className="visually-hidden">Teléfono: </span>
                    <a className="gcu-contact__mono" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
                  </li>
                )}
              </ul>
            )}
            {tags && tags.length > 0 && (
              <ul className="gcu-contact__tags" aria-label="Etiquetas">
                {tags.map((tag) => <li key={tag}><Tag size="sm">{tag}</Tag></li>)}
              </ul>
            )}
            {facts && facts.length > 0 && (
              <dl className="gcu-contact__facts">
                {facts.map((fact) => (
                  <div key={fact.label} className="gcu-contact__fact">
                    <dt>{fact.label}</dt>
                    <dd className="gcu-tabular">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        )}
      </div>
      {actions && <div className="card-footer gcu-contact__actions">{actions}</div>}
    </section>
  )
})
