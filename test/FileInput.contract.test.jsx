import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { FileInput } from '../src/components/form/FileInput.jsx'

test('uses a caller ID for both the input and label and links help text', () => {
  render(
    <FileInput
      id="resume-file"
      label="Resume"
      helpText="Upload a PDF"
      aria-describedby="external-description"
    />,
  )
  const input = screen.getByLabelText('Resume')
  const help = screen.getByText('Upload a PDF')

  expect(input).toHaveAttribute('id', 'resume-file')
  expect(input.getAttribute('aria-describedby').split(' ')).toEqual([
    'external-description',
    help.id,
  ])
})

test('links error feedback and exposes invalid state', () => {
  render(<FileInput label="Attachment" error="File is too large" />)
  const input = screen.getByLabelText('Attachment')
  const error = screen.getByText('File is too large')

  expect(input).toHaveAttribute('aria-invalid', 'true')
  expect(input).toHaveAttribute('aria-describedby', error.id)
})
